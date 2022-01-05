const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");

require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const stripe = require("stripe")(process.env.STRIPE_SECRET);

const app = express();
const port = process.env.PORT || 5000;

//**********middleware****************
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qow90.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

//*********server run korle mongodb running dekhabe********
console.log(uri);


async function run() {
  try {
    await client.connect();
    const database = client.db("deliveryhut");
    const serviceCollection = database.collection("services");
    const blogCollection = database.collection("blogs");
    const orderCollection = database.collection("orders");
    const teamCollection = database.collection("team_members");
    const messageCollection = database.collection("messages");

    //***********GET Services API****************
    app.get("/services", async (req, res) => {
      const cursor = serviceCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    //**********GET single service api***************
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.findOne(query);
      res.send(result);
    });

    //*****************Get Blogs Api*******************
    app.get("/blogs", async (req, res) => {
      const cursor = blogCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    //*************Get single blog api***************
    app.get("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await blogCollection.findOne(query);
      res.send(result);
    });

    //*******************GET All Order API**************
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });
    //***********GET single Order api*****************
    app.get("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.findOne(query);
      res.send(result);
    });

    app.get("/team", async (req, res) => {
      const cursor = teamCollection.find({});
      const result = await cursor.toArray();
      res.send(result);
    });

    //*************GET orders by email***************
    app.post("/orders/byEmail", async (req, res) => {
      const email = req.body;
      const query = { userEmail: { $in: email } };
      const orders = await orderCollection.find(query).toArray();
      res.json(orders);
    });

    app.post("/services", async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.json(result);
    });

    //***********POST a order API*******************
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    //****************update order for payment*****************
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const payment = req.body;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          payment: payment,
        },
      };
      const result = await orderCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    //**************Stripe payment****************
    app.post("/create-payment-intent", async (req, res) => {
      const paymentInfo = req.body;
      const amount = paymentInfo.price * 100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "usd",
        payment_method_types: ["card"],
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    });

    //***********POST a message api**************
    app.post("/message", async (req, res) => {
      const message = req.body;
      const result = await messageCollection.insertOne(message);
      res.json(result);
    });

    //**********PUT / Update orders status api***********
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const updatedOrder = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: updatedOrder.status,
        },
      };
      const result = await orderCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    //*************DELETE my order api**************
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });
  } finally {
    //***********await client.close()***************
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Deliver-products server running");
});

app.listen(port, () => {
  console.log(`Deliver-products app listening at http://localhost:${port}`);
});

//***********************HappY Coding*****************************