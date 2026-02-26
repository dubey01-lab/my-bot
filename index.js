const TelegramBot = require('node-telegram-bot-api');

const token = process.env.TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on("message", (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.toLowerCase() : "";

    if (text.includes("hi") || text.includes("hello")) {
        bot.sendMessage(chatId, "Namaste 🙏 Welcome to Aroveda Bot!\nAap kya dekhna chahte hain?\n\n1️⃣ Products\n2️⃣ Price\n3️⃣ Order");
    }

    else if (text.includes("product")) {
        bot.sendMessage(chatId, "🌿 Hamare Products:\n\n1️⃣ Herbal Face Wash\n2️⃣ Aloe Vera Gel\n3️⃣ Ayurvedic Hair Oil");
    }

    else if (text.includes("price")) {
        bot.sendMessage(chatId, "💰 Price List:\n\nFace Wash - ₹199\nAloe Vera Gel - ₹149\nHair Oil - ₹249");
    }

    else if (text.includes("order")) {
        bot.sendMessage(chatId, "📦 Order karne ke liye apna naam aur address bhejiye.");
    }

    else {
        bot.sendMessage(chatId, "Please valid option likhiye:\nProduct / Price / Order");
    }
});

console.log("Bot is running...");
