const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const crypto = require('crypto');
const axios = require("axios");
const cron = require("node-cron");

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Aroveda Bot is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// 🔐 ADMIN TELEGRAM ID
const ADMIN_ID = 7370757451;

// =====================
// MEMORY STORES
// =====================
const userState = {};
const userData = {};
const userAttempts = {};
const orders = {};

// =====================
// GENERATE ORDER ID
// =====================
function generateOrderId() {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ARV-${random}`;
}

// =====================
// MAIN MENU
// =====================
const mainMenu = {
  reply_markup: {
    keyboard: [
      ["🛍 Products", "💰 Price"],
      ["📦 Order", "📦 Order Status"],
      ["ℹ About"]
    ],
    resize_keyboard: true
  }
};

// =====================
// START COMMAND
// =====================
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId,
`🌿 Namaste! Welcome to AROVEDA

Your trusted Ayurvedic skincare brand.

Use the menu below to explore our products.`,
  mainMenu);
});

// =====================
// MESSAGE HANDLER
// =====================
bot.on("message", (msg) => {

  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.trim() : "";

  if (!text) return;
  const lowerText = text.toLowerCase();

  // =====================
  // CANCEL
  // =====================
  if (["cancel", "stop", "exit", "nahi"].includes(lowerText)) {
    delete userState[chatId];
    delete userData[chatId];
    delete userAttempts[chatId];
    bot.sendMessage(chatId, "❌ Order Cancelled.", mainMenu);
    return;
  }

  // =====================
  // PRODUCTS
  // =====================
  else if (text === "🛍 Products") {
    bot.sendMessage(chatId,
`🌿 AROVEDA PRODUCT CATALOG

1️⃣ Night Repair Cream
2️⃣ Vitamin C Glow Serum
3️⃣ Kumkumadi Face Oil
4️⃣ Herbal Ubtan Face Wash
5️⃣ Pure Aloe Vera Gel

Use 📦 Order to place your order.`,
    mainMenu
    );
  }

  // =====================
  // PRICE
  // =====================
  else if (text === "💰 Price") {
    bot.sendMessage(chatId,
`💰 AROVEDA PRICE LIST

Night Repair Cream — ₹399
Vitamin C Glow Serum — ₹449
Kumkumadi Face Oil — ₹499
Herbal Ubtan Face Wash — ₹299
Pure Aloe Vera Gel — ₹249`,
    mainMenu
    );
  }

  // =====================
  // ABOUT
  // =====================
  else if (text === "ℹ About") {
    bot.sendMessage(chatId,
`🌿 About AROVEDA

Aroveda is a natural Ayurvedic skincare brand focused on herbal beauty solutions.

✔ Natural Ingredients
✔ Chemical Free
✔ Skin Friendly

Made with traditional Ayurvedic formulas.`,
    mainMenu
    );
  }

  // =====================
  // ORDER STATUS
  // =====================
  else if (text === "📦 Order Status") {
    userState[chatId] = "checkOrder";
    bot.sendMessage(chatId, "Please enter your Order ID:");
  }

  else if (userState[chatId] === "checkOrder") {

    if (orders[text]) {
      bot.sendMessage(chatId,
`📦 Order Found!

🆔 ${text}
Product: ${orders[text].product}
Name: ${orders[text].name}

Status: ${orders[text].status}
Delivery: ${orders[text].deliveryDate}`,
      mainMenu
      );
    } else {
      bot.sendMessage(chatId, "❌ Order ID not found.", mainMenu);
    }

    delete userState[chatId];
  }

  // =====================
  // ORDER START
  // =====================
  else if (text === "📦 Order") {

    userState[chatId] = "selectProduct";
    userData[chatId] = {};

    bot.sendMessage(chatId, "🛍 Please select product:", {
      reply_markup: {
        keyboard: [
          ["Night Repair Cream"],
          ["Vitamin C Glow Serum"],
          ["Kumkumadi Face Oil"],
          ["Herbal Ubtan Face Wash"],
          ["Pure Aloe Vera Gel"],
          ["Cancel"]
        ],
        resize_keyboard: true
      }
    });
  }

  // =====================
  // PRODUCT SELECT
  // =====================
  else if (userState[chatId] === "selectProduct") {

    const products = [
      "Night Repair Cream",
      "Vitamin C Glow Serum",
      "Kumkumadi Face Oil",
      "Herbal Ubtan Face Wash",
      "Pure Aloe Vera Gel"
    ];

    if (!products.includes(text)) {
      bot.sendMessage(chatId, "❌ Please select product from buttons.");
      return;
    }

    userData[chatId].product = text;
    userState[chatId] = "quantity";

    bot.sendMessage(chatId, "🔢 Enter quantity (1-5):");
  }

  // =====================
  // QUANTITY
  // =====================
  else if (userState[chatId] === "quantity") {

    const qty = parseInt(text);

    if (isNaN(qty) || qty < 1 || qty > 5) {
      bot.sendMessage(chatId, "❌ Enter quantity between 1-5.");
      return;
    }

    userData[chatId].quantity = qty;
    userState[chatId] = "name";

    bot.sendMessage(chatId, "👤 Enter your Name:");
  }

  // =====================
  // NAME
  // =====================
  else if (userState[chatId] === "name") {

    userData[chatId].name = text;
    userState[chatId] = "address";

    bot.sendMessage(chatId, "🏠 Enter your Address:");
  }

  // =====================
  // ADDRESS
  // =====================
  else if (userState[chatId] === "address") {

    userData[chatId].address = text;
    userState[chatId] = "phone";

    bot.sendMessage(chatId, "📞 Enter 10 digit phone number:");
  }

  // =====================
  // PHONE
  // =====================
  else if (userState[chatId] === "phone") {

    if (!/^[6-9][0-9]{9}$/.test(text)) {
      bot.sendMessage(chatId, "❌ Invalid phone number.");
      return;
    }

    userData[chatId].phone = text;

    const today = new Date();
    today.setDate(today.getDate() + 5);
    const deliveryDate = today.toDateString();

    const orderId = generateOrderId();

    orders[orderId] = {
      product: userData[chatId].product,
      quantity: userData[chatId].quantity,
      name: userData[chatId].name,
      address: userData[chatId].address,
      phone: userData[chatId].phone,
      deliveryDate: deliveryDate,
      status: "Confirmed ✅"
    };

    bot.sendMessage(chatId,
`✅ Order Confirmed!

Order ID: ${orderId}

Product: ${userData[chatId].product}
Quantity: ${userData[chatId].quantity}

Delivery: ${deliveryDate}

Please save your Order ID.`,
    mainMenu
    );

    bot.sendMessage(ADMIN_ID,
`🆕 NEW ORDER

Order ID: ${orderId}

Product: ${userData[chatId].product}
Qty: ${userData[chatId].quantity}

Name: ${userData[chatId].name}
Phone: ${userData[chatId].phone}

Delivery: ${deliveryDate}`
    );

    delete userState[chatId];
  }

  else {
    bot.sendMessage(chatId,
      "Please select option from menu 👇",
      mainMenu
    );
  }

});

console.log("Aroveda Bot running...");
