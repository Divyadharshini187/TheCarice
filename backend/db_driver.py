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
    token: str = ""
    status: str = "Pending"

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
                    total_amount REAL NOT NULL,
                    gst_amount REAL DEFAULT 0,
                    final_total REAL NOT NULL,
                    timestamp TEXT NOT NULL,
                    token TEXT,
                    status TEXT DEFAULT 'Pending'
                )
            """)
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS menu_items (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    price INTEGER NOT NULL,
                    category TEXT NOT NULL,
                    available INTEGER DEFAULT 1,
                    stock_count INTEGER DEFAULT 100,
                    image_url TEXT
                )
            """)
            # Migration: Add columns if they don't exist
            try:
                cursor.execute("ALTER TABLE menu_items ADD COLUMN stock_count INTEGER DEFAULT 100")
            except: pass
            try:
                cursor.execute("ALTER TABLE food_orders ADD COLUMN gst_amount REAL DEFAULT 0")
                cursor.execute("ALTER TABLE food_orders ADD COLUMN final_total REAL")
            except: pass
            # Check if menu_items is empty and populate default items
            cursor.execute("SELECT COUNT(*) FROM menu_items")
            if cursor.fetchone()[0] == 0:
                default_items = [
                    ("Dosai", 60, "Breakfast"),
                    ("Poori", 60, "Breakfast"),
                    ("Ven Pongal", 50, "Breakfast"),
                    ("Watermelon juice", 30, "Drinks"),
                    ("Idly", 30, "Breakfast"),
                    ("Roast", 40, "Breakfast"),
                    ("Parotta", 30, "Lunch"),
                    ("Chappathi", 30, "Lunch"),
                    ("Variety Rice", 30, "Lunch"),
                    ("Meals", 60, "Lunch"),
                    ("Kothu parotta", 50, "Lunch")
                ]
                cursor.executemany(
                    "INSERT INTO menu_items (name, price, category, available) VALUES (?, ?, ?, 1)",
                    default_items
                )
            conn.commit()

    def add_menu_item(self, name: str, price: int, category: str, image_url: str = "") -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO menu_items (name, price, category, image_url) VALUES (?, ?, ?, ?)",
                (name, price, category, image_url)
            )
            conn.commit()
            return cursor.rowcount > 0

    def get_all_menu_items(self) -> list:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM menu_items")
            rows = cursor.fetchall()
            items = []
            for row in rows:
                items.append({
                    "id": row[0],
                    "name": row[1],
                    "price": row[2],
                    "category": row[3],
                    "available": bool(row[4]),
                    "image_url": row[5]
                })
            return items

    def delete_menu_item(self, item_id: int) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM menu_items WHERE id = ?", (item_id,))
            conn.commit()
            return cursor.rowcount > 0

    def update_menu_item_availability(self, item_id: int, available: bool) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE menu_items SET available = ? WHERE id = ?", (1 if available else 0, item_id))
            conn.commit()
            return cursor.rowcount > 0

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
        total_amount: float,
        timestamp: str
    ) -> FoodOrder:
        import random
        token = f"T-{random.randint(1000, 9999)}"
        status = "Pending"
        
        # Calculate GST (5%)
        gst_amount = total_amount * 0.05
        final_total = total_amount + gst_amount

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO food_orders (bill_id, customer_name, order_items, total_amount, gst_amount, final_total, timestamp, token, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (bill_id, customer_name, json.dumps(order_items), total_amount, gst_amount, final_total, timestamp, token, status)
            )
            
            # Reduce inventory for each item
            for item in order_items:
                cursor.execute("UPDATE menu_items SET stock_count = MAX(0, stock_count - 1) WHERE name = ?", (item['name'] if isinstance(item, dict) else item,))
            
            conn.commit()
            return FoodOrder(
                customer_name=customer_name,
                order_items=order_items,
                bill_id=bill_id,
                total_amount=total_amount,
                timestamp=timestamp,
                token=token,
                status=status
            )

    def get_sales_report(self) -> dict:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Summary for today
            today = datetime.now().strftime('%Y-%m-%d')
            cursor.execute("SELECT COUNT(*), SUM(final_total), SUM(gst_amount) FROM food_orders WHERE timestamp LIKE ?", (f'{today}%',))
            summary = cursor.fetchone()
            
            # Sales by item
            cursor.execute("SELECT order_items FROM food_orders WHERE timestamp LIKE ?", (f'{today}%',))
            orders = cursor.fetchall()
            item_counts = {}
            for row in orders:
                items = json.loads(row[0])
                for it in items:
                    name = it['name'] if isinstance(it, dict) else it
                    item_counts[name] = item_counts.get(name, 0) + 1
            
            return {
                "date": today,
                "total_orders": summary[0] or 0,
                "total_revenue": summary[1] or 0,
                "total_gst": summary[2] or 0,
                "item_sales": item_counts
            }

    def update_stock(self, item_id: int, new_count: int) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE menu_items SET stock_count = ? WHERE id = ?", (new_count, item_id))
            conn.commit()
            return cursor.rowcount > 0
    def get_order_by_bill_id(self, bill_id: str) -> Optional[dict]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM food_orders WHERE bill_id = ?", (bill_id,))
            row = cursor.fetchone()
            if not row:
                return None           
            return {
                "bill_id": row[0],
                "customer_name": row[1],
                "order_items": json.loads(row[2]),
                "total_amount": row[3],
                "gst_amount": row[4],
                "final_total": row[5],
                "timestamp": row[6],
                "token": row[7],
                "status": row[8]
            }

    def get_all_orders(self) -> list:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM food_orders ORDER BY timestamp DESC")
            rows = cursor.fetchall()
            orders = []
            for row in rows:
                orders.append({
                    "bill_id": row[0],
                    "customer_name": row[1],
                    "order_items": json.loads(row[2]),
                    "total_amount": row[3],
                    "gst_amount": row[4],
                    "final_total": row[5],
                    "timestamp": row[6],
                    "token": row[7],
                    "status": row[8]
                })
            return orders

    def update_order_status(self, bill_id: str, status: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE food_orders SET status = ? WHERE bill_id = ?", (status, bill_id))
            conn.commit()
            return cursor.rowcount > 0