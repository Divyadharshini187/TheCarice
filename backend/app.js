/**********************
 * GLOBAL DATA
 **********************/
let foods = [
    { name: "Dosa", price: 60, available: true },
    { name: "Chicken Biryani", price: 100, available: true },
    { name: "Noodles", price: 50, available: true }
];

let order = [];
let allOrders = [];
let recognition;

/**********************
 * UI RENDER
 **********************/
function renderFoods() {
    const grid = document.getElementById("foodGrid");
    grid.innerHTML = "";

    foods.forEach((food, index) => {
        const card = document.createElement("div");
        card.className = "food-card";

        card.innerHTML = `
      <h3>${food.name}</h3>
      <p>₹${food.price}</p>
      <button onclick="toggleFood(${index})">
        ${food.available ? "Food Over" : "Unavailable"}
      </button>
      <button onclick="deleteFood(${index})">Delete</button>
    `;

        if (!food.available) card.style.opacity = "0.5";
        grid.appendChild(card);
    });
}

function renderOrder() {
    const list = document.getElementById("orderList");
    list.innerHTML = "";
    order.forEach(item => {
        const li = document.createElement("li");
        li.innerText = `${item.name} - ₹${item.price}`;
        list.appendChild(li);
    });
}

/**********************
 * FOOD CONTROL
 **********************/
function addFood() {
    const name = fname.value.trim();
    const price = Number(fprice.value);

    if (!name || !price) return;

    foods.push({ name, price, available: true });
    renderFoods();

    fname.value = "";
    fprice.value = "";
}

function deleteFood(index) {
    foods.splice(index, 1);
    renderFoods();
}

function toggleFood(index) {
    foods[index].available = !foods[index].available;
    renderFoods();
}

/**********************
 * ORDER CONTROL
 **********************/
function addToOrder(food) {
    order.push(food);
    renderOrder();
}

function generateOrderId() {
    return "ORD-" + Math.floor(1000 + Math.random() * 9000);
}

function finishOrder() {
    if (order.length === 0) {
        speak("No items in order");
        return;
    }

    const total = order.reduce((sum, i) => sum + Number(i.price), 0);
    const orderId = generateOrderId();

    allOrders.push({
        orderId,
        items: [...order],
        total,
        time: new Date().toLocaleString()
    });

    speak(
        "Order completed. Order ID " +
        orderId +
        ". Total amount rupees " +
        total
    );

    order = [];
    renderOrder();
}

/**********************
 * CAMERA
 **********************/
async function startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
}

/**********************
 * VOICE
 **********************/
function speak(text) {
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = "en-IN";
    window.speechSynthesis.speak(msg);
}

function startVoice() {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "en-IN";
    recognition.continuous = true;

    recognition.onresult = (e) => {
        document.getElementById("humanStatus").innerText = "Customer detected";

        const text = e.results[e.results.length - 1][0].transcript
            .toLowerCase()
            .replace(/[^a-z\s]/g, "")
            .trim();

        console.log("Heard:", text);

        if (text.includes("over")) {
            finishOrder();
            return;
        }


        if (text.includes("hello")) {
            speak("Hello. What would you like to order?");
            return;
        }

        let matched = false;

        foods.forEach(food => {
            const foodName = food.name.toLowerCase();

            if (text.includes(foodName)) {
                matched = true;

                if (food.available) {
                    addToOrder(food);
                    speak(food.name + " added to your order");
                } else {
                    speak(food.name + " is not available now");
                }
            }
        });

        if (!matched && text.length > 3) {
            speak("Sorry, this item is not available in the menu");
        }
    };

    recognition.start();
}

/**********************
 * SIDEBAR NAV
 **********************/
function hideAll() {
    homeSection.style.display = "none";
    loadFoodSection.style.display = "none";
    ordersSection.style.display = "none";
}

function showHome() {
    hideAll();
    homeSection.style.display = "block";
}

function showLoadFood() {
    hideAll();
    loadFoodSection.style.display = "block";
}

function showOrders() {
    hideAll();
    ordersSection.style.display = "block";

    ordersList.innerHTML = "";

    allOrders.forEach(o => {
        const li = document.createElement("li");

        const itemsText = o.items.map(i => i.name).join(", ");

        li.innerHTML = `
      <strong>${o.orderId}</strong><br>
      Items: ${itemsText}<br>
      Total: ₹${o.total}<br>
      Time: ${o.time}
      <hr>
    `;

        ordersList.appendChild(li);
    });
}

/**********************
 * INIT
 **********************/
window.onload = () => {
    renderFoods();
    renderOrder();
    showHome();
    startCamera();
    startVoice();
};