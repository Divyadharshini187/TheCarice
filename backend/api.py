from livekit.agents.llm import function_tool
import enum
from typing import Annotated
import logging
import json
import asyncio
import uuid
from datetime import datetime

try:
    from .db_driver import DatabaseDriver, MENU
except (ImportError, ValueError):
    from db_driver import DatabaseDriver, MENU

logger = logging.getLogger("food-court")
logger.setLevel(logging.INFO)


class FoodDetails(enum.Enum):
    CUSTOMER_NAME = "customer_name"
    ORDER_ITEMS = "order_items"
    BILL_ID = "bill_id"
    TOTAL_AMOUNT = "total_amount"
    TIMESTAMP = "timestamp"


class AssistantFnc:
    def __init__(self, room=None):
        self._room = room
        self._db = DatabaseDriver()  # ✅ Per-instance DB, not a global
        self._order_details = {
            FoodDetails.CUSTOMER_NAME: "",
            FoodDetails.ORDER_ITEMS: [],
            FoodDetails.BILL_ID: "",
            FoodDetails.TOTAL_AMOUNT: 0,
            FoodDetails.TIMESTAMP: "",
        }

    def has_order(self) -> bool:
        return bool(self._order_details[FoodDetails.BILL_ID])

    def get_order_str(self) -> str:
        return "".join(
            f"{key.value}: {value}\n"
            for key, value in self._order_details.items()
        )

    def _publish(self, payload: dict):
        """Fire-and-forget data publish to the LiveKit room."""
        if self._room:
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.create_task(
                        self._room.local_participant.publish_data(
                            json.dumps(payload).encode()
                        )
                    )
            except Exception as e:
                logger.warning("Failed to publish room data: %s", e)

    # ─────────────────────────────────────────────
    # Step 2 — Save customer name
    # ─────────────────────────────────────────────
    @function_tool(description="Save the customer's name for the current order.")
    async def set_customer_name(
        self,
        name: Annotated[str, "The customer's name"],
    ) -> str:
        logger.info("set_customer_name: %s", name)
        self._order_details[FoodDetails.CUSTOMER_NAME] = name.strip()
        return f"Got it! I've noted your name as {name.strip()}. What would you like to order?"

    # ─────────────────────────────────────────────
    # Step 4 — Add an item to the order
    # ─────────────────────────────────────────────
    @function_tool(description=(
        "Add a menu item to the current order. "
        "Available items: Dosai, Poori, Ven Pongal, Watermelon Juice, Idly, "
        "Roast, Parotta, Chappathi, Variety Rice, Meals, Kothu Parotta."
    ))
    async def add_item(
        self,
        item_name: Annotated[str, "Name of the menu item to add"],
        quantity: Annotated[int, "How many of this item to add"] = 1,
    ) -> str:
        logger.info("add_item: %s x%d", item_name, quantity)

        # Match against known menu
        matched_name = None
        for menu_name in MENU.keys():
            if (menu_name.lower() in item_name.lower()
                    or item_name.lower() in menu_name.lower()):
                matched_name = menu_name
                break

        if not matched_name:
            return (
                f"Sorry, '{item_name}' is not on the menu. "
                f"Available items: {', '.join(MENU.keys())}."
            )

        items: list = self._order_details[FoodDetails.ORDER_ITEMS]

        # If already in order, increment quantity
        for entry in items:
            if entry["name"] == matched_name:
                entry["quantity"] += quantity
                logger.info("Updated quantity: %s → %d", matched_name, entry["quantity"])
                return f"Updated {matched_name} to {entry['quantity']} in your order. Anything else?"

        items.append({"name": matched_name, "quantity": quantity})
        logger.info("Added new item: %s x%d", matched_name, quantity)
        return f"Added {quantity} {matched_name} to your order. Anything else?"

    # ─────────────────────────────────────────────
    # Remove an item
    # ─────────────────────────────────────────────
    @function_tool(description="Remove a menu item from the current order.")
    async def remove_item(
        self,
        item_name: Annotated[str, "Name of the item to remove"],
    ) -> str:
        logger.info("remove_item: %s", item_name)

        items: list = self._order_details[FoodDetails.ORDER_ITEMS]
        original_len = len(items)
        self._order_details[FoodDetails.ORDER_ITEMS] = [
            i for i in items
            if item_name.lower() not in i["name"].lower()
        ]

        if len(self._order_details[FoodDetails.ORDER_ITEMS]) < original_len:
            return f"Removed {item_name} from your order."
        return f"'{item_name}' was not found in your order."

    # ─────────────────────────────────────────────
    # Step 6 — Get order summary
    # ─────────────────────────────────────────────
    @function_tool(description="Get a summary of all items currently in the order.")
    async def get_order_summary(self) -> str:
        logger.info("get_order_summary")
        items: list = self._order_details[FoodDetails.ORDER_ITEMS]

        if not items:
            return "Your order is currently empty."

        lines = [f"  • {i['quantity']}x {i['name']}" for i in items]
        total = self._db.calculate_total(items)
        summary = (
            f"Here is your current order for "
            f"{self._order_details[FoodDetails.CUSTOMER_NAME] or 'you'}:\n"
            + "\n".join(lines)
            + f"\n\nEstimated total: ₹{total}"
        )
        return summary

    # ─────────────────────────────────────────────
    # Step 8 — Place the order
    # ─────────────────────────────────────────────
    @function_tool(description="Finalise and place the confirmed order into the database.")
    async def place_order(self) -> str:
        logger.info("place_order")

        customer_name = self._order_details[FoodDetails.CUSTOMER_NAME]
        items = self._order_details[FoodDetails.ORDER_ITEMS]

        if not customer_name:
            return "I don't have your name yet. Please tell me your name first."
        if not items:
            return "Your order is empty. Please add items before placing the order."
        if self.has_order():
            return (
                f"An order has already been placed with Bill ID "
                f"{self._order_details[FoodDetails.BILL_ID]}."
            )

        bill_id = f"FC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        timestamp = datetime.now().isoformat()
        total_amount = self._db.calculate_total(items)

        result = self._db.store_food_order(
            customer_name, items, bill_id, total_amount, timestamp
        )
        if result is None:
            return "Failed to place the order. Please try again."

        self._order_details[FoodDetails.BILL_ID] = bill_id
        self._order_details[FoodDetails.TOTAL_AMOUNT] = total_amount
        self._order_details[FoodDetails.TIMESTAMP] = timestamp

        self._publish({
            "type": "order_placed",
            "bill_id": bill_id,
            "customer_name": customer_name,
            "items": items,
            "total": total_amount,
        })

        logger.info("Order placed — bill_id: %s, total: ₹%s", bill_id, total_amount)
        return (
            f"Order placed successfully! "
            f"Bill ID: {bill_id}. Total: ₹{total_amount}. "
            f"Shall I print the bill?"
        )

    # ─────────────────────────────────────────────
    # Step 9 — Print bill
    # ─────────────────────────────────────────────
    @function_tool(description="Print the bill for the current placed order.")
    async def print_bill(self) -> str:
        logger.info("print_bill")

        target_bill_id = self._order_details[FoodDetails.BILL_ID]
        if not target_bill_id:
            return "No order has been placed yet."

        order = self._db.get_order_by_bill_id(target_bill_id)
        if not order:
            return f"Could not retrieve order for Bill ID: {target_bill_id}"

        separator = "=" * 40
        thin = "─" * 40
        lines = [
            f"\n{separator}",
            "        SREC FOOD COURT",
            separator,
            f"Bill ID  : {order.bill_id}",
            f"Customer : {order.customer_name}",
            f"Date     : {order.timestamp[:10]}",
            thin,
        ]
        for item in order.order_items:
            name = item.get("name", "Unknown")
            qty = item.get("quantity", 1)
            price = MENU.get(name, 0) * qty
            lines.append(f"  {name:<20} x{qty}  ₹{price}")

        lines += [
            thin,
            f"  {'TOTAL':<24} ₹{order.total_amount}",
            separator,
            "     Thank you! Come again!",
            f"{separator}\n",
        ]

        bill_str = "\n".join(lines)
        logger.info(bill_str)

        self._publish({"type": "bill_printed", "bill_id": target_bill_id})

        return bill_str

    # ─────────────────────────────────────────────
    # Lookup order by customer name
    # ─────────────────────────────────────────────
    @function_tool(description="Look up a previous order by the customer's name.")
    async def lookup_order_by_name(
        self,
        name: Annotated[str, "The customer name to search for"],
    ) -> str:
        logger.info("lookup_order_by_name: %s", name)

        order = self._db.get_order_by_customer_name(name)
        if not order:
            return f"No order found for customer '{name}'."

        items_str = ", ".join(
            f"{i['quantity']}x {i['name']}" for i in order.order_items
        )
        return (
            f"Found order for {order.customer_name}: "
            f"{items_str}. "
            f"Total: ₹{order.total_amount}. "
            f"Bill ID: {order.bill_id}."
        )
