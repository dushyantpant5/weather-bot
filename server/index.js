const express = require("express");
const app = express();
const port = 3001;
const cors = require("cors");
const cron = require("node-cron");

const bodyParser = require("body-parser");

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(cors());

const TelegramBot = require("node-telegram-bot-api");
const token = "6586885387:AAFdIwongSAJXmr-aqFZUp8t1cUU7WhmDGs";

const { handleUser, getUser, getAllUsers } = require("./controllers/users");
const { getCurrentWeather } = require("./controllers/weather.js");
// mongoose
//   .connect("mongodb://127.0.0.1:27017/weather-bot")
//   .then(() => console.log("Successfully conntected to mongoose"))
//   .catch((error) => console.error(error));

const { run } = require("./mongo.js");

run();

const bot = new TelegramBot(token, { polling: true });

bot.onText(/start/, async (msg, match) => {
  const userData = {
    telegramId: msg.from.id,
    username: msg.from.username,
  };

  const city = "Delhi"; //Default City

  await handleUser(userData);

  const { currentTemperature, currentWeather } = await getCurrentWeather(city);

  const user = await getUser(msg.from.id);
  console.log("User status is:", user.isBlocked);

  if (user.isBlocked === false) {
    bot.sendMessage(
      msg.from.id,
      `Current Weather in ${city} is : ${currentWeather}`
    );
    bot.sendMessage(
      msg.from.id,
      `Current Temperatue in ${city} is : ${currentTemperature} °C`
    );
  } else {
    bot.sendMessage(msg.from.id, `You are blocked.`);
  }
});

const sendUpdate = async () => {
  try {
    const allowedUsers = await getAllUsers();

    await Promise.all(
      allowedUsers.map(async (user) => {
        const city = user.defaultLocation;

        const { currentTemperature, currentWeather } = await getCurrentWeather(
          city
        );

        await bot.sendMessage(
          user.telegramId,
          `This is your regular 9 AM weather update.`
        );

        await bot.sendMessage(
          user.telegramId,
          `Current Weather in ${city} is: ${currentWeather}`
        );
        await bot.sendMessage(
          user.telegramId,
          `Current Temperature in ${city} is: ${currentTemperature} °C`
        );
      })
    );

    console.log("Messages sent successfully to all users.");
  } catch (error) {
    console.error("Error sending messages:", error.message);
  }
};

cron.schedule("0 9 * * *", () => {
  sendUpdate();
});

const router = require("./routes/index.js");

app.use("/api", router);

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
