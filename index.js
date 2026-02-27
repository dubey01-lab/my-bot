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

// =====================
// MEMORY STORES
// =====================
const userState = {};
const userData = {};
const userAttempts = {};
const orders = {}; // orderId storage

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
// MESSAGE HANDLER
// =====================
bot.on("message", (msg) => {

  const chatId = msg.chat.id;
  const text = msg.text ? msg.text.trim() : "";

  if (!text) return;
  const lowerText = text.toLowerCase();

  // =====================
  // GLOBAL CANCEL
  // =====================
  if (["cancel", "stop", "exit", "nahi"].includes(lowerText)) {
    delete userState[chatId];
    delete userData[chatId];
    delete userAttempts[chatId];
    bot.sendMessage(chatId, "❌ Order Cancelled.", mainMenu);
    return;
  }

  // =====================
  // START
  // =====================
  if (text === "/start") {
    delete userState[chatId];
    bot.sendMessage(chatId, "Namaste 🙏 Welcome to Aroveda Bot!", mainMenu);
  }

  // =====================
  // PRODUCTS
  // =====================
  else if (text === "🛍 Products") {
    bot.sendMessage(chatId,
      "🌿 Our Products:\n1. Herbal Face Wash\n2. Ayurvedic Hair Oil\n3. Skin Glow Cream",
      mainMenu
    );
  }

  // =====================
  // PRICE
  // =====================
  else if (text === "💰 Price") {
    bot.sendMessage(chatId,
      "💰 Price List:\nFace Wash - ₹199\nHair Oil - ₹249\nCream - ₹299",
      mainMenu
    );
  }

  // =====================
  // ABOUT
  // =====================
  else if (text === "ℹ About") {
    bot.sendMessage(chatId,
      "🌿 Aroveda is a natural Ayurvedic skincare brand.",
      mainMenu
    );
  }

  // =====================
  // ORDER STATUS CHECK
  // =====================
  else if (text === "📦 Order Status") {
    userState[chatId] = "checkOrder";
    bot.sendMessage(chatId, "Please enter your Order ID:");
  }

  else if (userState[chatId] === "checkOrder") {

    if (orders[text]) {
      bot.sendMessage(chatId,
        `📦 Order Found!\n\n🆔 ${text}\nName: ${orders[text].name}\nStatus: Confirmed ✅`,
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
  userAttempts[chatId] = 0;

  bot.sendMessage(chatId, "🛍 Please select a product:", {
    reply_markup: {
      keyboard: [
        ["Herbal Face Wash"],
        ["Ayurvedic Hair Oil"],
        ["Skin Glow Cream"],
        ["Cancel"]
      ],
      resize_keyboard: true
    }
  });
}

// =====================
// PRODUCT SELECTION
// =====================
else if (userState[chatId] === "selectProduct") {

  const products = [
    "Herbal Face Wash",
    "Ayurvedic Hair Oil",
    "Skin Glow Cream"
  ];

  if (!products.includes(text)) {
    bot.sendMessage(chatId, "❌ Please select product from buttons only.");
    return;
  }

  userData[chatId].product = text;
  userState[chatId] = "quantity";

  bot.sendMessage(chatId, "🔢 Enter quantity (1-5):");
}

// =====================
// QUANTITY STEP
// =====================
else if (userState[chatId] === "quantity") {

  const qty = parseInt(text);

  if (isNaN(qty) || qty < 1 || qty > 5) {
    bot.sendMessage(chatId, "❌ Enter valid quantity between 1 to 5.");
    return;
  }

  userData[chatId].quantity = qty;
  userState[chatId] = "name";

  bot.sendMessage(chatId, "📛 Enter your Name:");
}
  
  // =====================
  // NAME STEP
  // =====================
  else if (userState[chatId] === "name") {

    if (!/^[A-Za-z ]{2,30}$/.test(text)) {
      userAttempts[chatId]++;

      if (userAttempts[chatId] >= 3) {
        delete userState[chatId];
        bot.sendMessage(chatId, "❌ Too many invalid attempts. Order cancelled.", mainMenu);
        return;
      }

      bot.sendMessage(chatId, "❌ Enter valid name (letters only).");
      return;
    }

    userData[chatId].name = text;
    userState[chatId] = "address";
    userAttempts[chatId] = 0;

    bot.sendMessage(chatId, "🏠 Please enter your Address:");
  }

  // =====================
// ADDRESS STEP (STRONG VALIDATION)
// =====================
else if (userState[chatId] === "address") {

  // Only letters, numbers, space, comma, dash, slash allowed
  const addressRegex = /^[A-Za-z0-9 ,\-\/]{10,100}$/;

  if (!addressRegex.test(text)) {
    userAttempts[chatId]++;

    if (userAttempts[chatId] >= 3) {
      delete userState[chatId];
      delete userAttempts[chatId];
      bot.sendMessage(chatId, "❌ Too many invalid attempts. Order cancelled.", mainMenu);
      return;
    }

    bot.sendMessage(chatId, 
      "❌ Invalid address.\nUse letters, numbers, comma or dash only.\nMinimum 10 characters."
    );
    return;
  }

  userData[chatId].address = text;
  userState[chatId] = "phone";
  userAttempts[chatId] = 0;

  bot.sendMessage(chatId, "📞 Enter 10 digit Indian Phone Number:");
}

 // =====================
// PHONE STEP
// =====================
 else if (userState[chatId] === "phone") {


  if (!/^[6-9][0-9]{9}$/.test(text)) {
    userAttempts[chatId] = (userAttempts[chatId] || 0) + 1;

    if (userAttempts[chatId] >= 3) {
      delete userState[chatId];
      delete userAttempts[chatId];
      bot.sendMessage(chatId, "❌ Too many invalid attempts. Order cancelled.");
      return;
    }

    bot.sendMessage(chatId, "❌ Invalid phone. Must start with 6-9 and be 10 digits.");
    return;
  }

  // ✅ VALID PHONE
  userData[chatId].phone = text;

  // ✅ Calculate delivery date
  const today = new Date();
  today.setDate(today.getDate() + 5);
  const deliveryDate = today.toDateString();
  userData[chatId].deliveryDate = deliveryDate;

  // ✅ Generate Order ID
  const orderId = generateOrderId();
  userData[chatId].orderId = orderId;

  // ✅ Save Order
  orders[orderId] = {
    product: userData[chatId].product,
    quantity: userData[chatId].quantity,
    name: userData[chatId].name,
    address: userData[chatId].address,
    phone: userData[chatId].phone,
    deliveryDate: userData[chatId].deliveryDate
  };

  // ✅ Send Confirmation
  bot.sendMessage(chatId,
`✅ Order Confirmed!

🆔 Order ID: ${orderId}

🛍 Product: ${userData[chatId].product}
🔢 Quantity: ${userData[chatId].quantity}

👤 Name: ${userData[chatId].name}
🏠 Address: ${userData[chatId].address}
📞 Phone: ${userData[chatId].phone}

📅 Expected Delivery: ${deliveryDate}

Please save your Order ID.`,
  mainMenu
  );

  delete userState[chatId];
  delete userAttempts[chatId];
}

// =====================
// SMART AUTO REPLY
// =====================
else if (lowerText.includes("kab ayega") || 
         lowerText.includes("kab aayega") ||
         lowerText.includes("delivery") ||
         lowerText.includes("order kab")) {

  bot.sendMessage(chatId,
    "📦 Delivery usually takes 3-5 working days.\n\nTo check exact status, click '📦 Order Status' and enter your Order ID.",
    mainMenu
  );
}
  
  // =====================
  // DEFAULT
  // =====================
  else {
    bot.sendMessage(chatId,
      "Please select an option from menu below 👇",
      mainMenu
    );
  }

});

console.log("Bot is running...");
