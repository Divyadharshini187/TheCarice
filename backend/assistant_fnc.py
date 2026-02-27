from livekit.agents.llm import function_tool
import enum
from typing import Annotated
import logging
from db_driver import DatabaseDriver

logger = logging.getLogger("food-court")
logger.setLevel(logging.INFO)


class OrderDetails(enum.Enum):
    CustomerName = "customer_name"
    OrderID = "order_id"
    Items = "items"
    TotalAmount = "total_amount"
    Status = "status"


class AssistantFnc:
    def __init__(self, room=None):
        self._room = room
        self._db = DatabaseDriver()
        self._order_details = {
            OrderDetails.CustomerName: "",
            OrderDetails.OrderID: "",
            OrderDetails.Items: [],
            OrderDetails.TotalAmount: 0.0,
            OrderDetails.Status: "",
        }

    def get_order_str(self) -> str:
        order_str = ""
        for key, value in self._order_details.items():
            if key == OrderDetails.Items and isinstance(value, list):
                items_str = (
                    ", ".join(
                        f"{item['name']} x{item['quantity']} (₹{item['price']})"
                        for item in value
                    )
                    if value else "No items"
                )
                order_str += f"{key.value}: {items_str}\n"
            else:
                order_str += f"{key.value}: {value}\n"
        return order_str

    def has_order(self) -> bool:
        return bool(self._order_details[OrderDetails.OrderID])

    @function_tool(description="Save the customer's name to start the order session.")
    async def set_customer_name(
        self,
        name: Annotated[str, "The full name of the customer"],
    ) -> str:
        logger.info("Setting customer name: %s", name)
        self._order_details[OrderDetails.CustomerName] = name.strip()
        return f"Customer name set to {name.strip()}. Now ask what they want to order."

    @function_tool(description=(
        "Add a food item to the customer's order. "
        "Available items: Dosai, Poori, Ven Pongal, Watermelon Juice, Idly, "
        "Roast, Parotta, Chappathi, Variety Rice, Meals, Kothu Parotta."
    ))
    async def add_item(
        self,
        item_name: Annotated[str, "The name of the food item"],
        quantity: Annotated[int, "The quantity of the item"],
    ) -> str:
        logger.info("Adding item — name: %s, qty: %d", item_name, quantity)

        menu_item = self._db.get_menu_item_by_name(item_name)
        if menu_item is None:
            return f"Sorry, '{item_name}' is not available. Please ask the customer to choose something else."

        items: list = self._order_details[OrderDetails.Items]
        for item in items:
            if item["name"].lower() == menu_item.name.lower():
                item["quantity"] += quantity
                logger.info("Updated qty: %s → %d", menu_item.name, item["quantity"])
                return f"Updated {menu_item.name} quantity to {item['quantity']}."

        items.append({
            "name": menu_item.name,
            "quantity": quantity,
            "price": menu_item.price,
        })
        return f"Added {quantity}x {menu_item.name} at ₹{menu_item.price} each."

    @function_tool(description="Remove a food item from the order.")
    async def remove_item(
        self,
        item_name: Annotated[str, "The name of the food item to remove"],
    ) -> str:
        logger.info("Removing item: %s", item_name)
        items: list = self._order_details[OrderDetails.Items]
        updated = [i for i in items if i["name"].lower() != item_name.lower()]
        if len(updated) == len(items):
            return f"'{item_name}' was not found in the order."
        self._order_details[OrderDetails.Items] = updated
        return f"Removed {item_name} from the order."

    @function_tool(description="Get a summary of the current order.")
    async def get_order_summary(
        self,
        unused: Annotated[str, "Leave this empty"] = "",  # ✅ Fixes Groq schema error
    ) -> str:
        logger.info("get_order_summary")
        if not self._order_details[OrderDetails.Items]:
            return "The order is currently empty."
        return f"Current order:\n{self.get_order_str()}"

    @function_tool(description="Place and save the confirmed order to the database.")
    async def place_order(
        self,
        unused: Annotated[str, "Leave this empty"] = "",  # ✅ Fixes Groq schema error
    ) -> str:
        logger.info("Placing order for: %s", self._order_details[OrderDetails.CustomerName])

        if not self._order_details[OrderDetails.CustomerName]:
            return "Customer name is missing. Please ask for the name first."
        if not self._order_details[OrderDetails.Items]:
            return "Order is empty. Please ask the customer to add items first."
        if self.has_order():
            return f"An order has already been placed with ID {self._order_details[OrderDetails.OrderID]}."

        total = round(
            sum(
                item["price"] * item["quantity"]
                for item in self._order_details[OrderDetails.Items]
            ),
            2,
        )
        self._order_details[OrderDetails.TotalAmount] = total

        result = self._db.create_order(
            customer_name=self._order_details[OrderDetails.CustomerName],
            items=self._order_details[OrderDetails.Items],
            total_amount=total,
        )
        if result is None:
            return "Failed to place order. Please try again."

        self._order_details[OrderDetails.OrderID] = result.order_id
        self._order_details[OrderDetails.Status] = result.status

        logger.info("Order placed — id: %s, total: ₹%s", result.order_id, total)
        return (
            f"Order placed successfully! "
            f"Order ID: {result.order_id}. Total: ₹{total}. "
            f"Shall I print the bill?"
        )

    @function_tool(description="Print the bill for the current placed order.")
    async def print_bill(
        self,
        unused: Annotated[str, "Leave this empty"] = "",  # ✅ Fixes Groq schema error
    ) -> str:
        target_id = self._order_details[OrderDetails.OrderID]
        logger.info("Printing bill for order: %s", target_id)

        if not target_id:
            return "No order found. Please place an order first."

        result = self._db.get_order_by_id(target_id)
        if result is None:
            return f"No order found with ID {target_id}."

        items_str = "\n".join(
            f"  {item['name']:<22} x{item['quantity']}  ₹{item['price'] * item['quantity']:.2f}"
            for item in result.items
        )
        bill = (
            f"\n{'='*40}\n"
            f"       SREC FOOD COURT BILL\n"
            f"{'='*40}\n"
            f"Order ID   : {result.order_id}\n"
            f"Customer   : {result.customer_name}\n"
            f"{'─'*40}\n"
            f"{items_str}\n"
            f"{'─'*40}\n"
            f"TOTAL      : ₹{result.total_amount:.2f}\n"
            f"Status     : {result.status}\n"
            f"{'='*40}\n"
            f"  Thank you for dining with us!\n"
            f"{'='*40}\n"
        )
        logger.info(bill)
        return bill

    @function_tool(description="Look up existing orders by customer name.")
    async def lookup_order_by_name(
        self,
        customer_name: Annotated[str, "The customer name to search for"],
    ) -> str:
        logger.info("Looking up orders for: %s", customer_name)
        results = self._db.get_orders_by_customer(customer_name)
        if not results:
            return f"No orders found for '{customer_name}'."

        summary = f"Found {len(results)} order(s) for {customer_name}:\n"
        for order in results:
            total = self._db.calculate_total(order.items)
            summary += self._db.format_order_summary(order.items, total)
            summary += (
                f"  - Order ID: {order.order_id} | "
                f"Total: ₹{order.total_amount:.2f} | "
                f"Status: {order.status}\n"
            )
        return summary