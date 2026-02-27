import os
import uuid
import logging
from datetime import datetime

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from livekit import api as livekit_api

from db_driver import DatabaseDriver

# ── Environment ──────────────────────────────────────────
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, ".env.local"))

# ── App setup ─────────────────────────────────────────────
project_root = os.path.dirname(backend_dir)
static_folder = os.path.join(project_root, "frontend", "dist")

app = Flask(__name__, static_folder=static_folder, template_folder=static_folder)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("food-court-api")


def get_db() -> DatabaseDriver:
    if not hasattr(get_db, "_instance"):
        get_db._instance = DatabaseDriver()
    return get_db._instance


# ── Health ────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "service": "food-court-api"})


# ── LiveKit token ─────────────────────────────────────────
@app.route("/api/get-token", methods=["GET"])
def get_token():
    room_name = request.args.get("room", "food-court-room")
    participant_name = request.args.get(
        "participant", "customer-" + str(uuid.uuid4())[:4]
    )

    logger.info(
        "Generating token — room: %s, participant: %s",
        room_name,
        participant_name,
    )

    api_key = os.getenv("LIVEKIT_API_KEY")
    api_secret = os.getenv("LIVEKIT_API_SECRET")
    lk_url = os.getenv("LIVEKIT_URL")

    missing = [
        k
        for k, v in {
            "LIVEKIT_API_KEY": api_key,
            "LIVEKIT_API_SECRET": api_secret,
            "LIVEKIT_URL": lk_url,
        }.items()
        if not v
    ]

    if missing:
        logger.error("Missing env vars: %s", ", ".join(missing))
        return jsonify({"error": f"Missing configuration: {', '.join(missing)}"}), 500

    try:
        token = (
            livekit_api.AccessToken(api_key, api_secret)
            .with_identity(participant_name)
            .with_name(participant_name)
            .with_grants(
                livekit_api.VideoGrants(room_join=True, room=room_name)
            )
        )

        jwt_token = token.to_jwt()

        logger.info("Token generated for %s", participant_name)

        return jsonify(
            {
                "token": jwt_token,
                "url": lk_url,
            }
        )

    except Exception as e:
        logger.exception("LiveKit token error")
        return jsonify({"error": f"LiveKit error: {str(e)}"}), 500


# ── Orders ────────────────────────────────────────────────
@app.route("/api/orders", methods=["GET"])
def list_orders():
    try:
        orders = get_db().get_all_orders()

        return jsonify(
            [
                {
                    "bill_id": o.bill_id,
                    "customer_name": o.customer_name,
                    "items": o.order_items,
                    "total_amount": o.total_amount,
                    "timestamp": o.timestamp,
                }
                for o in (orders or [])
            ]
        )

    except Exception as e:
        logger.exception("Error listing orders")
        return jsonify({"error": str(e)}), 500


@app.route("/api/orders", methods=["POST"])
def create_order():
    try:
        data = request.get_json(silent=True) or {}
        customer_name = data.get("customer_name", "Guest")
        order_items = data.get("items", [])

        if not order_items:
            return jsonify({"error": "No items in order"}), 400

        bill_id = f"FC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        timestamp = datetime.now().isoformat()

        db = get_db()
        total_amount = db.calculate_total(order_items)

        result = db.store_food_order(
            customer_name,
            order_items,
            bill_id,
            total_amount,
            timestamp,
        )

        if not result:
            return jsonify({"error": "Failed to store order"}), 500

        logger.info("Order created: %s for %s", bill_id, customer_name)

        return jsonify(
            {
                "message": "Order created successfully",
                "bill_id": bill_id,
                "total_amount": total_amount,
                "timestamp": timestamp,
            }
        ), 201

    except Exception as e:
        logger.exception("Error creating order")
        return jsonify({"error": str(e)}), 500


@app.route("/api/orders/<bill_id>", methods=["GET"])
def get_order(bill_id):
    try:
        order = get_db().get_order_by_bill_id(bill_id)

        if not order:
            return jsonify({"error": "Order not found"}), 404

        return jsonify(
            {
                "bill_id": order.bill_id,
                "customer_name": order.customer_name,
                "items": order.order_items,
                "total_amount": order.total_amount,
                "timestamp": order.timestamp,
            }
        )

    except Exception as e:
        logger.exception("Error fetching order %s", bill_id)
        return jsonify({"error": str(e)}), 500


# ── SPA fallback ──────────────────────────────────────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    full_path = os.path.join(app.static_folder, path)

    if path and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)

    return send_from_directory(app.static_folder, "index.html")


# ── Entry point ───────────────────────────────────────────
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,          # ✅ IMPORTANT
        use_reloader=False,   # ✅ CRITICAL FIX
        threaded=True,
    )