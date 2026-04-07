const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

async function createUsers() {
  await User.deleteMany({});
  console.log("Cleared existing users");
  const adminPassword = await bcrypt.hash("12345678", 10);
  const staff1Password = await bcrypt.hash("staffone", 10);
  const staff2Password = await bcrypt.hash("stafftwo", 10);
  const staff3Password = await bcrypt.hash("staffthree", 10);

  await User.create({
    name: "Admin",
    email: "admin@gmail.com",
    password: adminPassword,
    role: "admin"
  });

  await User.create({
    name: "Staff One",
    email: "staff1@gmail.com",
    password: staff1Password,
    role: "staff"
  });

  await User.create({
    name: "Staff Two",
    email: "staff2@gmail.com",
    password: staff2Password,
    role: "staff"
  });

  await User.create({
    name: "Staff Three",
    email: "staff3@gmail.com",
    password: staff3Password,
    role: "staff"
  });

  console.log("Users created successfully");
  mongoose.disconnect();
}

createUsers();
