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

// Main Menu Keyboard
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

  if (text === "/start") {
    bot.sendMessage(chatId, "Namaste 🙏 Welcome to Aroveda Bot!", mainMenu);
  }

  else if (text === "🛍 Products") {
    bot.sendMessage(chatId, 
      "🌿 Our Products:\n\n1. Herbal Face Wash\n2. Ayurvedic Hair Oil\n3. Skin Glow Cream",
      mainMenu
    );
  }

  else if (text === "💰 Price") {
    bot.sendMessage(chatId, 
      "💰 Price List:\n\nFace Wash - ₹199\nHair Oil - ₹249\nCream - ₹299",
      mainMenu
    );
  }

  else if (text === "📦 Order") {
    bot.sendMessage(chatId, 
      "📦 Please type your Name to place an order.",
      mainMenu
    );
  }

  else if (text === "ℹ About") {
    bot.sendMessage(chatId, 
      "🌿 Aroveda is a natural Ayurvedic skincare brand.",
      mainMenu
    );
  }

  else {
    bot.sendMessage(chatId, 
      "Please select an option from menu below 👇",
      mainMenu
    );
  }
});

console.log("Bot is running...");
