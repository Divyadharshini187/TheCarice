from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from db_driver import DatabaseDriver
import uuid
import os
from datetime import datetime
import logging
from livekit import api
from dotenv import load_dotenv

# Load environment variables from the backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(backend_dir, ".env.local"))
# Define paths relative to backend directory
project_root = os.path.dirname(backend_dir)
static_folder = os.path.join(project_root, 'frontend', 'dist')

app = Flask(__name__, static_folder=static_folder, template_folder=static_folder)

CORS(app)  # Enable CORS for all routes

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("food-court-api")

DB = DatabaseDriver()

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "food-court-api"})

@app.route('/api/get-token', methods=['GET'])
def get_token():
    try:
        room_name = request.args.get('room', 'food-court-room')
        participant_name = request.args.get('participant', 'customer-' + str(uuid.uuid4())[:4])
        
        logger.info(f"Generating token for room: {room_name}, participant: {participant_name}")
        
        api_key = os.getenv('LIVEKIT_API_KEY')
        api_secret = os.getenv('LIVEKIT_API_SECRET')
        lk_url = os.getenv('LIVEKIT_URL')
        
        if not api_key or not api_secret or not lk_url:
            logger.error("Missing LiveKit credentials in .env.local")
            return jsonify({"error": "Configuration error: Missing LiveKit credentials"}), 500

        token = api.AccessToken(
            api_key,
            api_secret
        ).with_identity(participant_name).with_name(participant_name).with_grants(api.VideoGrants(
            room_join=True,
            room=room_name,
        ))
        
        return jsonify({
            "token": token.to_jwt(),
            "url": lk_url
        })
    except Exception as e:
        logger.error(f"Error generating token: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders', methods=['POST'])
def create_order():
    try:
        data = request.json
        customer_name = data.get('customer_name', 'Guest')
        order_items = data.get('items', [])
        
        if not order_items:
            return jsonify({"error": "No items in order"}), 400

        # Generate Bill ID
        bill_id = f"FC-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8]}"
        timestamp = datetime.now().isoformat()
        
        # Calculate Total
        total_amount = DB.calculate_total(order_items)
        
        # Store in DB
        result = DB.store_food_order(customer_name, order_items, bill_id, total_amount, timestamp)
        
        if result:
            logger.info(f"Order created: {bill_id} for {customer_name}")
            return jsonify({
                "message": "Order created successfully",
                "bill_id": bill_id,
                "total_amount": total_amount,
                "timestamp": timestamp
            }), 201
        else:
            return jsonify({"error": "Failed to store order"}), 500

    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/orders/<bill_id>', methods=['GET'])
def get_order(bill_id):
    order = DB.get_order_by_bill_id(bill_id)
    if order:
        return jsonify({
            "bill_id": order.bill_id,
            "customer_name": order.customer_name,
            "items": order.order_items,
            "total_amount": order.total_amount,
            "timestamp": order.timestamp
        })
    else:
        return jsonify({"error": "Order not found"}), 404

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory(app.static_folder,path)

@app.route('/', defaults={'path':''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
