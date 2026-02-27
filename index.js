const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// User State Store
const userState = {};
const userData = {};

// Generate Order ID
function generateOrderId() {
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `ARV-${random}`;
}

// Main Menu
const mainMenu = {
  reply_markup: {
    keyboard: [
      ["🛍 Products", "💰 Price"],
      ["📦 Order", "ℹ About"]
    ],
    resize_keyboard: true
  }
};

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.trim() : "";

  if (!text) return;

  const lowerText = text.toLowerCase();

  // GLOBAL CANCEL SYSTEM
  if (["cancel", "stop", "nahi", "exit"].includes(lowerText)) {
    delete userState[chatId];
    delete userData[chatId];
    bot.sendMessage(chatId, "❌ Order Cancelled.", mainMenu);
    return;
  }

  // START
  if (text === "/start") {
    delete userState[chatId];
    bot.sendMessage(chatId, "Namaste 🙏 Welcome to Aroveda Bot!", mainMenu);
  }

  // PRODUCTS
  else if (text === "🛍 Products") {
    delete userState[chatId];
    bot.sendMessage(chatId,
      "🌿 Our Products:\n1. Herbal Face Wash\n2. Ayurvedic Hair Oil\n3. Skin Glow Cream",
      mainMenu
    );
  }

  // PRICE
  else if (text === "💰 Price") {
    delete userState[chatId];
    bot.sendMessage(chatId,
      "💰 Price List:\nFace Wash - ₹199\nHair Oil - ₹249\nCream - ₹299",
      mainMenu
    );
  }

  // ABOUT
  else if (text === "ℹ About") {
    delete userState[chatId];
    bot.sendMessage(chatId,
      "🌿 Aroveda is a natural Ayurvedic skincare brand.",
      mainMenu
    );
  }

  // ORDER START
  else if (text === "📦 Order") {
    userState[chatId] = "name";
    userData[chatId] = {};
    bot.sendMessage(chatId, "📦 Please enter your Name:\n(Type 'cancel' to stop)");
  }

  // NAME STEP
  else if (userState[chatId] === "name") {

    if (text.length < 2 || text.length > 30) {
      bot.sendMessage(chatId, "❌ Please enter a valid name.");
      return;
    }

    userData[chatId].name = text;
    userState[chatId] = "address";
    bot.sendMessage(chatId, "🏠 Please enter your Address:");
  }

  // ADDRESS STEP
  else if (userState[chatId] === "address") {

    if (text.length < 5) {
      bot.sendMessage(chatId, "❌ Please enter a valid address.");
      return;
    }

    userData[chatId].address = text;
    userState[chatId] = "phone";
    bot.sendMessage(chatId, "📞 Please enter your 10 digit Phone Number:");
  }

  // PHONE STEP
  else if (userState[chatId] === "phone") {

    if (!/^[0-9]{10}$/.test(text)) {
      bot.sendMessage(chatId, "❌ Invalid phone number. Please enter 10 digit number only.");
      return;
    }

    userData[chatId].phone = text;

    const orderId = generateOrderId();
    userData[chatId].orderId = orderId;

    bot.sendMessage(chatId,
      `✅ Order Confirmed!\n\n🆔 Order ID: ${orderId}\n\nName: ${userData[chatId].name}\nAddress: ${userData[chatId].address}\nPhone: ${userData[chatId].phone}\n\nPlease save your Order ID for future enquiry.`,
      mainMenu
    );

    delete userState[chatId];
  }

  // DEFAULT
  else {
    bot.sendMessage(chatId,
      "Please select an option from menu below 👇",
      mainMenu
    );
  }
});

console.log("Bot is running...");
