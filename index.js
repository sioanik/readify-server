const express = require('express')
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')


const app = express()
const port = process.env.PORT || 5000



// middleware
const corsOptions = {
    origin: ['http://localhost:5173',],
    credentials: true,
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser())



// mongodb

const uri = `mongodb+srv://${process.env.READIFY_USER}:${process.env.READIFY_KEY}@cluster0.cczhmev.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
        

        // collections 
        const catColl = client.db('readifyDB').collection('categories')
        const booksColl = client.db('readifyDB').collection('books')
        const borrowedColl = client.db('readifyDB').collection('borrowed')


        // jwt related 
        app.post('/jwt', async(req, res) =>{
            const user = req.body
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1h'})
            console.log(user);
            res.send(token)
        })






        // categories api
        app.get('/categories', async (req, res) => {
            const result = await catColl.find().toArray()
            res.send(result)
        })


        // all category items api 
        app.get('/cat-items/:category', async (req, res) => {
            // console.log(req.params.category);
            const result = await booksColl.find({ category: req.params.category }).toArray()
            res.send(result)
        })


        // Book details api 
        app.get('/book-details/:id', async (req, res) => {
            // console.log(req.params.id);
            const result = await booksColl.findOne({ _id: new ObjectId(req.params.id) })
            // console.log(result);
            res.send(result)
        })


        // Book update get api 
        app.get('/update-book/:id', async (req, res) => {
            // console.log(req.params.id);
            const result = await booksColl.findOne({ _id: new ObjectId(req.params.id) })
            // console.log(result);
            res.send(result)
        })


        // book post api 
        app.post('/books', async (req, res) => {
            const newBook = req.body
            // console.log(newBook)
            const result = await booksColl.insertOne(newBook)
            res.send(result)
        })


        // Borrowed book post api 
        app.post('/borrowed-books', async (req, res) => {
            const borrowedBook = req.body
            const refidNum = borrowedBook.refid
            // console.log(typeof refidNum)
            const result = await borrowedColl.insertOne(borrowedBook)


            const query = { _id: new ObjectId(refidNum) }
            // console.log(query)
            const result2 = await booksColl.updateOne(query, { $inc: { quantity: -1 } });
            // console.log(result2);
            res.send(result)
        })





        // Book get api 
        app.get('/books', async (req, res) => {
            const result = await booksColl.find().toArray()
            // console.log(result);
            res.send(result)
        })

        // categories api
        app.get('/categories', async (req, res) => {
            const result = await catColl.find().toArray()
            res.send(result)
        })


        // Update book Api 
        app.put('/update-book/:id', async (req, res) => {
            // console.log(req.params.id);
            const query = { _id: new ObjectId(req.params.id) }
            const data = {
                $set: {
                    name: req.body.name,
                    author: req.body.author,
                    image: req.body.image,
                    rating: req.body.rating,
                    quantity: req.body.quantity,
                    description: req.body.description,
                    contents: req.body.contents,
                    category: req.body.category,

                }
            }
            const result = await booksColl.updateOne(query, data)
            // console.log(result);
            res.send(result)
        })


        // my borrowed books 
        app.get('/my-borrowed-books/:email', async (req, res) => {
            // console.log(req.params.email);
            const result = await borrowedColl.find({ borrowerEmail: req.params.email }).toArray()
            res.send(result)
        })



        // delete api 
        app.delete('/delete/:id', async (req, res) => {

            const id = req.params.id
            console.log(id);
            
            const result = await borrowedColl.deleteOne({ refid: req.params.id })
            res.send(result)
            
            const query = { _id: new ObjectId(id) }
            // const query = { _id: new ObjectId(refidNum) }
            // console.log(query)
            const result2 = await booksColl.updateOne(query, { $inc: { quantity: +1 } });
            // console.log(result2);

        })







        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
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
    res.send('Hello Readify!')
})

app.listen(port, () => {
    console.log(`Readify app listening on port ${port}`)
})