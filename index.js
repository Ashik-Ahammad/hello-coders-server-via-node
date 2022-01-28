const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oas1v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

console.log(uri);

async function run() {
    try{
        await client.connect();
        const database = client.db('hello_coders');
        const memberCollection = database.collection('members');
        const serviceCollection = database.collection('services');
        const courseCollection = database.collection('courses');
        const orderCollection = database.collection('orders');
        const feedbackCollection = database.collection('feedbacks');
        const userCollection = database.collection('users');


        //GET TEAM MEMBER API
        app.get('/members', async(req,res) => {
            const cursor = memberCollection.find({});
            const members = await cursor.toArray();
            res.send(members);
        });

        //GET SERVICES API
        app.get('/services', async(req,res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        //GET COURSES API
        app.get('/courses', async(req,res) => {
            const cursor = courseCollection.find({});
            const courses = await cursor.toArray();
            res.send(courses);
        });

        // GET Orders API
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        });


        // Post or Add orders API
        app.post('/orders',async(req,res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        // Post or Add Feedback API
        app.post('/feedbacks',async(req,res) => {
            const feedback = req.body;
            const result = await feedbackCollection.insertOne(feedback);
            res.json(result);
        });

        // Post USERs API
        app.post('/users',async(req,res) => {
            const user = req.body;
            const result = await userCollection.insertOne(user);
            res.json(result);
        });

        // 
        app.put('/users', async(req,res) => {
            const user = req.body;
            
            const filter = {email: user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        app.put('/users/admin', async(req,res) => {
            const user = req.body;
            const filter = {email: user.email};
            console.log('put',user);
            const updateDoc = {$set: {role: 'admin'}};
            const result = await userCollection.updateOne(filter,updateDoc);
            res.json(result);
        })



    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/',(req,res) => {
    res.send('Hello Coders Server is running now');
});

app.listen(port,() => {
    console.log('Server running at port',port);
});