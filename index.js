const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// middleware

app.use(cors());
app.use(express.json());

const dbUser = process.env.MONGO_USER;
const dbPassword = process.env.MONGO_PASSWORD;

const uri = `mongodb+srv://${dbUser}:${dbPassword}@cluster0.kdwhpbt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const userCollection = client.db("coffeeDB").collection("user");
    // Read Data
    app.get("/coffee", async (req, res) => {
      const cursor = coffeeCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    // get one data
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    // Post Data
    app.post("/coffee", async (req, res) => {
      const coffee = req.body;
      const result = await coffeeCollection.insertOne(coffee);
      res.send(result);
    });

    // update data
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const coffee = req.body;
      console.log(coffee);
      const filter = { _id: new ObjectId(id) };
      const option = { upsert: true };
      const updatedCoffee = {
        $set: {
          name: coffee.name,
          quantity: coffee.quantity,
          supplier: coffee.supplier,
          taste: coffee.taste,
          category: coffee.category,
          details: coffee.details,
          photoURL: coffee.photoURL,
        },
      };
      const result = await coffeeCollection.updateOne(
        filter,
        updatedCoffee,
        option
      );

      res.send(result);
    });

    // delete data
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // ---------------------------
    // user related APIs
    //----------------------------

    // get user data

    app.get("/user", async (req, res) => {
      const cursor = await userCollection.find().toArray();
      res.send(cursor);
    });

    // post user data
    app.post("/user", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    // user deleting
    app.delete(`/user/:id`, async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Coffee store server is running");
});

app.listen(port, () => {
  console.log(`Coffee store server is running port on ${port}`);
});
