const mongoose = require("mongoose");
const Product = require("./models/Product");

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/inventory_auth")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

async function createProducts() {
  await Product.deleteMany({});
  console.log("Cleared existing products");

  await Product.create([
    { name: "Laptop", price: 1200, cost: 800, stock: 15 },
    { name: "Mouse", price: 25, cost: 10, stock: 50 },
    { name: "Keyboard", price: 75, cost: 40, stock: 30 },
    { name: "Monitor", price: 300, cost: 200, stock: 8 },
    { name: "Headphones", price: 100, cost: 50, stock: 45 },
    { name: "Webcam", price: 80, cost: 40, stock: 20 }
  ]);

  console.log("Products created successfully");
  mongoose.disconnect();
}

createProducts();
