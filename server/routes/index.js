const express = require("express");

const router = express.Router();

const { dbName } = require("../controllers/users");

const adminUsers = dbName.collection("admin");
const users = dbName.collection("users");
const keys = dbName.collection("api-keys");

router.route("/telegram-users").get(async (req, res) => {
  const telegramUsers = await users.find({}).toArray();
  res.json({ userArray: telegramUsers });
});

router.route("/auth").post(async (req, res) => {
  const email = req.body.email;
  const userName = req.body.userName;
  const authProvider = req.body.authProvider;

  const user = await adminUsers.findOne({ email: email });

  if (user) {
    console.log("User alrady exists");
    return;
  }

  await adminUsers.insertOne({
    email: email,
    userName: userName,
    authProvider: authProvider,
    isAdmin: false,
  });

  console.log(email, userName);
  return;
});

router.route("/auth/get-user").post(async (req, res) => {
  const email = req.body.email;

  const user = await adminUsers.findOne({ email: email });

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json({ isAdmin: user.isAdmin });
});

router.route("/auth/set-block").post(async (req, res) => {
  const telegramId = req.body.telegramId;
  const blockStatus = req.body.isBlocked;

  const response = await users.findOneAndUpdate(
    { telegramId: telegramId },
    { $set: { isBlocked: !blockStatus } },
    { returnDocument: "after" }
  );

  if (response) {
    console.log("User blocked:", response);
    res.json(response);
  } else {
    console.log("User not found");
    res.status(404);
  }
});

router.route("/get-weather-api").get(async (req, res) => {
  const weatherApi = await keys.findOne({ keyType: "weather" });
  const weatherApiKey = await weatherApi.key;

  res.json({ key: weatherApiKey });
});

router.route("/update-weather-api").post(async (req, res) => {
  const newKey = req.body.key;

  const respose = await keys.findOneAndUpdate(
    { keyType: "weather" },
    {
      $set: {
        key: newKey,
      },
    }
  );

  console.log("Key updated successfully");

  res.json(respose).status(200);
});

module.exports = router;
