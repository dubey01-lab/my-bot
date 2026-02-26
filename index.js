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

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.toLowerCase() : "";

  if (text.includes("hi") || text.includes("hello")) {
    bot.sendMessage(chatId, "Namaste 🙏 Welcome to Aroveda Bot!");
  } 
  else if (text.includes("product")) {
    bot.sendMessage(chatId, "🌿 Our Products:\n1. Herbal Face Wash\n2. Ayurvedic Hair Oil\n3. Skin Glow Cream");
  } 
  else if (text.includes("price")) {
    bot.sendMessage(chatId, "💰 Price List:\nFace Wash - ₹199\nHair Oil - ₹249\nCream - ₹299");
  } 
  else {
    bot.sendMessage(chatId, "Please type: hi / product / price");
  }
});

console.log("Bot is running...");
