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

        //GET TEAM MEMBER API
        app.get('/members', async(req,res) => {
            const cursor = memberCollection.find({});
            const members = await cursor.toArray();
            res.send(members);
        })
    }
    finally{
        // await client.close();
    }
}

run().catch(console.dir);


app.get('/',(req,res) => {
    res.send('Hello Coders Server is running');
});

app.listen(port,() => {
    console.log('Server running at port',port);
});