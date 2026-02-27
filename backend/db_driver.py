import sqlite3
from typing import Optional, List, Dict
from dataclasses import dataclass
from contextlib import contextmanager
import json


@dataclass
class FoodOrder:
    customer_name: str
    order_items: List[Dict]
    bill_id: str
    total_amount: int
    timestamp: str


MENU = {
    "dosai": 60,
    "poori": 60,
    "ven pongal": 50,
    "watermelon juice": 30,
    "idly": 30,
    "roast": 40,
    "parotta": 30,
    "chappathi": 30,
    "variety rice": 30,
    "meals": 60,
    "kothu parotta": 50,
}


class DatabaseDriver:
    def __init__(self, db_path: str = "foodcourt_db.sqlite"):
        self.db_path = db_path
        self._init_db()

    @contextmanager
    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS food_orders (
                    bill_id TEXT PRIMARY KEY,
                    customer_name TEXT NOT NULL,
                    order_items TEXT NOT NULL,
                    total_amount INTEGER NOT NULL,
                    timestamp TEXT NOT NULL
                )
                """
            )
            conn.commit()

    def calculate_total(self, order_items: List[Dict]) -> int:
        total = 0

        if not order_items:
            return 0

        for item in order_items:
            name = str(item.get("name", "")).strip().lower()
            quantity = int(item.get("quantity", 1))

            price = MENU.get(name, 0)
            total += price * quantity

        return total

    def format_order_summary(self, order_items: List[Dict], total: int) -> str:
        if not order_items:
            return "I didn't catch any items in your order."

        parts = []
        for item in order_items:
            name = item.get("name", "item")
            qty = item.get("quantity", 1)
            parts.append(f"{qty} {name}")

        items_text = ", ".join(parts)
        return f"You ordered {items_text}. Your total is ₹{total}. Should I confirm the order?"

    def store_food_order(
        self,
        customer_name: str,
        order_items: List[Dict],
        bill_id: str,
        total_amount: int,
        timestamp: str,
    ) -> FoodOrder:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO food_orders
                (bill_id, customer_name, order_items, total_amount, timestamp)
                VALUES (?, ?, ?, ?, ?)
                """,
                (
                    bill_id,
                    customer_name,
                    json.dumps(order_items),
                    total_amount,
                    timestamp,
                ),
            )
            conn.commit()

        return FoodOrder(
            customer_name=customer_name,
            order_items=order_items,
            bill_id=bill_id,
            total_amount=total_amount,
            timestamp=timestamp,
        )

    def get_menu_item_by_name(self, item_name: str):
        if not item_name:
            return None

        name = item_name.strip().lower()

        # direct match
        if name in MENU:
            return {
                "name": name.title(),
                "price": MENU[name],
            }

        # fuzzy space-insensitive match
        normalized = name.replace(" ", "")
        for menu_name, price in MENU.items():
            if menu_name.replace(" ", "") == normalized:
                return {
                    "name": menu_name.title(),
                    "price": price,
                }

        return None