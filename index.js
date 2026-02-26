const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  if (text === "hi" || text === "hello") {
    bot.sendMessage(chatId, "Namaste 🙏 Welcome to Aroveda!\nType 'product' to see products.");
  }

  else if (text === "product") {
    bot.sendMessage(chatId, "🌿 Our Products:\n1. Herbal Face Wash\n2. Ayurvedic Hair Oil\n3. Skin Glow Cream");
  }

  else if (text === "price") {
    bot.sendMessage(chatId, "💰 Price List:\nFace Wash - ₹199\nHair Oil - ₹299\nCream - ₹249");
  }

  else {
    bot.sendMessage(chatId, "Please type:\n'hi' \n'product' \n'price'");
  }
});
