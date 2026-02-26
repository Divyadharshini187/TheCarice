from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from db_driver import DatabaseDriver
import uuid
import os
from datetime import datetime
import logging
from livekit import api
from dotenv import load_dotenv
import razorpay

# Razorpay Configuration (Placeholders)
RAZORPAY_KEY_ID = "rzp_test_placeholder"
RAZORPAY_KEY_SECRET = "placeholder_secret"
client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# Load environment variables from the backend directory
backend_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(backend_dir, ".env.local")
print(f"Loading env from: {env_path}")
load_dotenv(env_path)
print(f"URL loaded: {os.getenv('LIVEKIT_URL') is not None}")
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
            missing = []
            if not api_key: missing.append("LIVEKIT_API_KEY")
            if not api_secret: missing.append("LIVEKIT_API_SECRET")
            if not lk_url: missing.append("LIVEKIT_URL")
            error_msg = f"Configuration error: Missing environment variables: {', '.join(missing)}"
            logger.error(error_msg)
            return jsonify({"error": error_msg}), 500

        try:
            token = api.AccessToken(
                api_key,
                api_secret
            ).with_identity(participant_name).with_name(participant_name).with_grants(api.VideoGrants(
                room_join=True,
                room=room_name,
            ))
            
            jwt_token = token.to_jwt()
            logger.info("Token generated successfully")
            
            return jsonify({
                "token": jwt_token,
                "url": lk_url
            })
        except Exception as api_err:
            logger.error(f"LiveKit API Error: {str(api_err)}")
            return jsonify({"error": f"LiveKit Service Error: {str(api_err)}"}), 500
    except Exception as e:
        logger.error(f"Unexpected error in get_token: {str(e)}")
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500

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
                "token": result.token,
                "total_amount": total_amount,
                "timestamp": timestamp,
                "status": result.status
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
            "timestamp": order.timestamp,
            "token": order.token,
            "status": order.status
        })
    else:
        return jsonify({"error": "Order not found"}), 404

@app.route('/api/merchant/orders', methods=['GET'])
def get_all_orders():
    try:
        orders = DB.get_all_orders()
        return jsonify(orders)
    except Exception as e:
        logger.error(f"Error fetching all orders: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/merchant/orders/<bill_id>/status', methods=['PUT'])
def update_order_status(bill_id):
    try:
        data = request.json
        status = data.get('status')
        if not status:
            return jsonify({"error": "Status is required"}), 400
        
        success = DB.update_order_status(bill_id, status)
        if success:
            return jsonify({"message": "Status updated successfully", "bill_id": bill_id, "status": status})
        else:
            return jsonify({"error": "Order not found or update failed"}), 404
    except Exception as e:
        logger.error(f"Error updating order status: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu', methods=['GET'])
def get_menu():
    try:
        items = DB.get_all_menu_items()
        return jsonify(items)
    except Exception as e:
        logger.error(f"Error fetching menu: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/merchant/sales-report', methods=['GET'])
def get_sales_report():
    try:
        report = DB.get_sales_report()
        return jsonify(report)
    except Exception as e:
        logger.error(f"Error generating sales report: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu/<int:item_id>/stock', methods=['PATCH'])
def update_stock(item_id):
    try:
        data = request.json
        new_count = data.get('stock_count')
        if new_count is None:
            return jsonify({"error": "Stock count required"}), 400
        
        success = DB.update_stock(item_id, new_count)
        if success:
            return jsonify({"message": "Stock updated successfully"})
        else:
            return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        logger.error(f"Error updating stock: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu', methods=['POST'])
def add_menu_item():
    try:
        data = request.json
        name = data.get('name')
        price = data.get('price')
        category = data.get('category')
        image_url = data.get('image_url', '')

        if not all([name, price, category]):
            return jsonify({"error": "Missing required fields"}), 400

        success = DB.add_menu_item(name, price, category, image_url)
        if success:
            return jsonify({"message": "Item added successfully"}), 201
        else:
            return jsonify({"error": "Failed to add item"}), 500
    except Exception as e:
        logger.error(f"Error adding menu item: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu/<int:item_id>', methods=['DELETE'])
def delete_menu_item(item_id):
    try:
        success = DB.delete_menu_item(item_id)
        if success:
            return jsonify({"message": "Item deleted successfully"})
        else:
            return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        logger.error(f"Error deleting menu item: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/menu/<int:item_id>/availability', methods=['PATCH'])
def update_availability(item_id):
    try:
        data = request.json
        available = data.get('available')
        if available is None:
            return jsonify({"error": "Available status required"}), 400
        
        success = DB.update_menu_item_availability(item_id, available)
        if success:
            return jsonify({"message": "Availability updated successfully"})
        else:
            return jsonify({"error": "Item not found"}), 404
    except Exception as e:
        logger.error(f"Error updating availability: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/payment/create', methods=['POST'])
def create_payment_order():
    try:
        data = request.json
        amount = data.get('amount')
        currency = 'INR'
        
        # Razorpay expects amount in paise (1 INR = 100 paise)
        payment_order = client.order.create({
            'amount': int(amount * 100),
            'currency': currency,
            'payment_capture': 1
        })
        
        return jsonify(payment_order)
    except Exception as e:
        logger.error(f"Error creating Razorpay order: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/payment/verify', methods=['POST'])
def verify_payment():
    try:
        data = request.json
        params_dict = {
            'razorpay_order_id': data.get('razorpay_order_id'),
            'razorpay_payment_id': data.get('razorpay_payment_id'),
            'razorpay_signature': data.get('razorpay_signature')
        }
        
        # This will verify the signature
        client.utility.verify_payment_signature(params_dict)
        return jsonify({"status": "success"})
    except Exception as e:
        logger.error(f"Payment verification failed: {str(e)}")
        return jsonify({"status": "failure", "error": str(e)}), 400


@app.route('/', defaults={'path':''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
