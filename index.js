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

        //GET TEAM MEMBER API
        app.get('/members', async(req,res) => {
            const cursor = memberCollection.find({});
            const members = await cursor.toArray();
            res.send(members);
        })

        //GET SERVICES API
        app.get('/services', async(req,res) => {
            const cursor = serviceCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        //GET COURSES API
        app.get('/courses', async(req,res) => {
            const cursor = courseCollection.find({});
            const courses = await cursor.toArray();
            res.send(courses);
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