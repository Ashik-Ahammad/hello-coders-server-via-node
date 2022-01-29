const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();
const admin = require("firebase-admin");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


// Admin SDK Firebase
const serviceAccount = require('./hello-coders-ff9c1-firebase-adminsdk-zw23u-9b2199591d.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.oas1v.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri);

async function verifyToken  (req,res,next) {
    if(req.headers?.authorization.startsWith('Bearer')){
       const token = req.headers.authorization.split(' ')[1]; 

       try{
           const decodedUser = await admin.auth().verifyIdToken(token);
           req.decodedEmail = decodedUser.email;
       }
       catch{

       }
    }


    next();
}

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
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.json(orders);
        });

        // GET users email
        app.get('/users/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email};
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if(user?.role === 'admin'){
                isAdmin = true;
            }
            res.json({admin: isAdmin});
        })


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

        // POST SERVICES FROM ADMIN
        app.post('/services',async(req,res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.json(result);
        });

        // POST COURSES FROM ADMIN
        app.post('/courses',async(req,res) => {
            const course = req.body;
            const result = await courseCollection.insertOne(course);
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

        app.put('/users/admin',verifyToken, async(req,res) => {
            const user = req.body;
            const requester = req.decodedEmail;
            if(requester){
                const requesterAccount = await userCollection.findOne({email : requester});
                if(requesterAccount.role === 'admin'){
                    const filter = {email: user.email};
                    const updateDoc = {$set: {role: 'admin'}};
                    const result = await userCollection.updateOne(filter,updateDoc);
                    res.json(result);
                }
            }
            else{
                res.status(403).json({message: 'You do not have access to make admin.Thank you!'})
            }

            
            
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