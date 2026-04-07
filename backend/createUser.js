const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function seedUsers() {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected for seeding");

    await User.deleteMany({});

    const users = [
      {
        name: "Admin",
        email: "admin@gmail.com",
        password: await bcrypt.hash("12345678", 10),
        role: "admin"
      },

      {
        name: "Staff One",
        email: "staff1@gmail.com",
        password: await bcrypt.hash("staffone", 10),
        role: "staff"
      },

      {
        name: "Staff Two",
        email: "staff2@gmail.com",
        password: await bcrypt.hash("stafftwo", 10),
        role: "staff"
      },

      {
        name: "Staff Three",
        email: "staff3@gmail.com",
        password: await bcrypt.hash("staffthree", 10),
        role: "staff"
      }
    ];

    await User.insertMany(users);

    console.log("Users inserted successfully");

    process.exit();

  } catch (err) {

    console.error(err);
    process.exit(1);

  }
}

seedUsers();