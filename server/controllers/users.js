const { MongoClient } = require("mongodb");
const { client } = require("../mongo.js");

const dbName = client.db("weather-bot");
const collection = dbName.collection("users");

async function handleUser(userData) {
  const user = await collection.findOne({ telegramId: userData.telegramId });

  if (user) {
    console.log("User already exists.");
    return;
  }

  await collection.insertOne({
    ...userData,
    defaultLocation: "Delhi",
    isBlocked: false,
  });

  console.log("User added succesfully.");
}

async function getUser(telegramId) {
  const user = await collection.findOne({ telegramId: telegramId });

  if (!user) {
    console.log("User not found");
    return;
  }

  return user;
}

async function getAllUsers() {
  const telegramUsers = await collection.find({}).toArray();

  const allowedUsers = telegramUsers.filter((user) => {
    return user.isBlocked === false;
  });

  return allowedUsers;
}

module.exports = { dbName, handleUser, getUser, getAllUsers };
