import sqlite3
from typing import Optional
from dataclasses import dataclass
from contextlib import contextmanager
import json
@dataclass
class FoodOrder:
    customer_name: str
    order_items: list   # stored as JSON string in DB
    bill_id: str
    total_amount: int
    timestamp: str
@dataclass
class FoodOrder:
    customer_name: str
    order_items: list   # stored as JSON string in DB
    bill_id: str
    total_amount: int
    timestamp: str

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
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS food_orders (
                    bill_id TEXT PRIMARY KEY,
                    customer_name TEXT NOT NULL,
                    order_items TEXT NOT NULL,   -- stored as JSON
                    total_amount INTEGER NOT NULL,
                    timestamp TEXT NOT NULL
                )
            """)
            conn.commit()

    def calculate_total(self, order_items):
        total = 0
        for item in order_items:
            # item is expected to be a dict with 'price' or 'cost'
            # Assuming item structure: {'name': '...', 'price': 100, ...}
            if 'price' in item:
                total += int(item['price'])
        return total

    def store_food_order(
        self,
        customer_name: str,
        order_items: list,
        bill_id: str,
        total_amount: int,
        timestamp: str
    ) -> FoodOrder:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO food_orders (bill_id, customer_name, order_items, total_amount, timestamp) VALUES (?, ?, ?, ?, ?)",
                (bill_id, customer_name, json.dumps(order_items), total_amount, timestamp)
            )
            conn.commit()
            return FoodOrder(
                customer_name=customer_name,
                order_items=order_items,
                bill_id=bill_id,
                total_amount=total_amount,
                timestamp=timestamp
            )
    def get_order_by_bill_id(self, bill_id: str) -> Optional[FoodOrder]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM food_orders WHERE bill_id = ?", (bill_id,))
            row = cursor.fetchone()
            if not row:
                return None           
            return FoodOrder(
                customer_name=row[1],
                order_items=json.loads(row[2]),
                bill_id=row[0],
                total_amount=row[3],
                timestamp=row[4]
            )