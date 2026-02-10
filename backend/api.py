from livekit.agents import llm
from livekit import rtc
import enum
from typing import Annotated
from pydantic import Field
import logging
from db_driver import DatabaseDriver
from datetime import datetime
import uuid
logger = logging.getLogger("food-court")
logger.setLevel(logging.INFO)
DB = DatabaseDriver()
class FoodDetails(enum.Enum):
    CUSTOMER_NAME = "customer_name"
    ORDER_ITEMS = "order_items"
    BILL_ID = "bill_id"
    TOTAL_AMOUNT = "total_amount"
    TIMESTAMP = "timestamp"
class AssistantFnc:
    def __init__(self, room: rtc.Room = None):
        super().__init__()
        self._room = room
        # initialize empty order
        self._order_details = {
            FoodDetails.CUSTOMER_NAME: "",
            FoodDetails.ORDER_ITEMS: [],
            FoodDetails.BILL_ID: "",
            FoodDetails.TOTAL_AMOUNT: 0,
            FoodDetails.TIMESTAMP: ""
        }
    def get_order_str(self):
        order_str = ""
        for key, value in self._order_details.items():
            order_str += f"{key.value}: {value}\n"
        return order_str
    @llm.function_tool(description="Create a new food order with customer name and items")
    def create_order(
        self,
        customer_name: Annotated[str, Field(description="The name of the customer")],
        order_items: Annotated[list[dict], Field(description="List of ordered items with item name and quantity")]
    ):
        logger.info("create order - customer: %s, items: %s", customer_name, order_items)
        bill_id = f"FC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        timestamp = datetime.now().isoformat()
        total_amount = DB.calculate_total(order_items)
        result = DB.store_food_order(customer_name, order_items, bill_id, total_amount, timestamp)
        if result is None:
            return "Failed to create order"
        self._order_details = {
            FoodDetails.CUSTOMER_NAME: customer_name,
            FoodDetails.ORDER_ITEMS: order_items,
            FoodDetails.BILL_ID: bill_id,
            FoodDetails.TOTAL_AMOUNT: total_amount,
            FoodDetails.TIMESTAMP: timestamp
        }
        
        # Publish order to the room if available
        if self._room:
            import json
            import asyncio
            asyncio.create_task(self._room.local_participant.publish_data(
                json.dumps({
                    "type": "order_update",
                    "items": order_items,
                    "bill_id": bill_id,
                    "total": total_amount
                })
            ))
            
        return f"Order created!\n{self.get_order_str()}"
    @llm.function_tool(description="Get the details of the current food order")
    def get_order_details(self):
        logger.info("get order details")
        return f"The order details are:\n{self.get_order_str()}"
    def has_order(self):
        return self._order_details[FoodDetails.BILL_ID] != ""