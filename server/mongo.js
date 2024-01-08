const { MongoClient, ServerApiVersion } = require("mongodb");
const uri =
  "mongodb+srv://dushyant:pant1727@weather-bot.96hvuo2.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  await client.connect();
  // Send a ping to confirm a successful connection
  await client.db("weather-bot").command({ ping: 1 });
  console.log("Pinged your deployment. You successfully connected to MongoDB!");
}

module.exports = { run, client };
