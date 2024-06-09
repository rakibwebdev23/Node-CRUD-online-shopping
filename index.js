const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.712mjau.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();

        const productsCollection = client.db('productDB').collection('product');

        const userCollection = client.db('productDB').collection('users');

        app.get('/products', async(req, res) =>{
            const cursor = productsCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/products/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {_id: new ObjectId(id)}
            const result = await productsCollection.findOne(query);
            res.send(result);
        })

       app.post('/products', async(req, res) =>{
        const product = req.body;
        const result = await productsCollection.insertOne(product);
        res.json(result);
       });

       app.put('/products/:id', async(req, res) =>{
        const id = req.params.id;
        const user = req.body;
        const filter = {_id: new ObjectId(id)}
        const options = { upsert: true };
        const productUpdate = {
            $set: {
                name: user.name, 
                category: user.category, 
                supplier: user.supplier, 
                details: user.details, 
                quantity: user.quantity, 
                photo: user.photo
            }
        }
        const result = await productsCollection.updateOne(filter, productUpdate, options);
        res.send(result);
       })

    //    user signin and signup 

       app.patch('/users', async(req, res) =>{
        const user = req.body;
        const filter = {email: user.email}
        const updatedDoc = {
            $set: {
                lastLoggedAt: user.lastLoggedAt
            }
        }
        const result = await userCollection.updateOne(filter, updatedDoc);
        res.send(result);
       })

       app.delete('/products/:id', async(req, res) =>{
            const id = req.params.id;
            console.log(id);
            const query = {_id: new ObjectId(id)}
            const result = await productsCollection.deleteOne(query);
            res.send(result);
       })


    //    user data get

    app.get('/users', async(req, res) =>{
        const cursor = userCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    //    user connect to MongoDB

       app.post('/users', async(req, res) =>{
        const user = req.body;
        const result = await userCollection.insertOne(user);
        res.send(result);
       })

       app.delete('/users/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)}
        const result = await userCollection.deleteOne(query);
        res.send(result);
       })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('This is my Online shop server');
});

app.listen(port, () => {
    console.log(`Online shop product server ${port}`);
})