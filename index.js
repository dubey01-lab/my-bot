const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

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
  const text = msg.text;

  // START
  if (text === "/start") {
    bot.sendMessage(chatId, "Namaste 🙏 Welcome to Aroveda Bot!", mainMenu);
  }

  // PRODUCTS
  else if (text === "🛍 Products") {
    bot.sendMessage(chatId,
      "🌿 Our Products:\n1. Herbal Face Wash\n2. Ayurvedic Hair Oil\n3. Skin Glow Cream",
      mainMenu
    );
  }

  // PRICE
  else if (text === "💰 Price") {
    bot.sendMessage(chatId,
      "💰 Price List:\nFace Wash - ₹199\nHair Oil - ₹249\nCream - ₹299",
      mainMenu
    );
  }

  // ORDER START
  else if (text === "📦 Order") {
    userState[chatId] = "name";
    bot.sendMessage(chatId, "📦 Please enter your Name:");
  }

  // NAME STEP
  else if (userState[chatId] === "name") {
    userData[chatId] = { name: text };
    userState[chatId] = "address";
    bot.sendMessage(chatId, "🏠 Please enter your Address:");
  }

  // ADDRESS STEP
  else if (userState[chatId] === "address") {
    userData[chatId].address = text;
    userState[chatId] = "phone";
    bot.sendMessage(chatId, "📞 Please enter your Phone Number:");
  }

  // PHONE STEP
  else if (userState[chatId] === "phone") {
    userData[chatId].phone = text;
    userState[chatId] = null;

    bot.sendMessage(chatId,
      `✅ Order Confirmed!\n\nName: ${userData[chatId].name}\nAddress: ${userData[chatId].address}\nPhone: ${userData[chatId].phone}`,
      mainMenu
    );
  }

  // ABOUT
  else if (text === "ℹ About") {
    bot.sendMessage(chatId,
      "🌿 Aroveda is a natural Ayurvedic skincare brand.",
      mainMenu
    );
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
