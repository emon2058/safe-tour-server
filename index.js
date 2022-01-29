const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT ||5000;
// middleware 
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.l2twi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
async function run(){
    try{
        await client.connect();
        const database = client.db('safeTour');
        const servicesCollection = database.collection('services');
        const blogsCollection = database.collection('blogs');
        const usersCollection = database.collection('users');
        const testimonialCollection = database.collection('testimonial');
        const bookingCollection = database.collection('booking');
        // GET SERVICES API 
        app.get('/services',async(req,res)=>{
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })
        // GET SINGLE SERVICES API 
        app.get('/services/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)}
            const service = await servicesCollection.findOne(query);
            res.send(service);
        })
        // GET API FOR BOOKING 
        app.get('/booking', async(req,res)=>{
            const cursor = bookingCollection.find({});
            const booking = await cursor.toArray();
            res.send(booking);
        })
        app.get('/blogs', async(req,res)=>{
            const cursor = blogsCollection.find({});
            // console.log(req.query)
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const count = await cursor.count();
            let blogs;
            if(page){
                blogs = await cursor.skip(page*size).limit(size).toArray()
            }
            else{
                blogs = await cursor.toArray();
            }
            res.send({
                count,
                blogs})
        })
        app.get('/blogs/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const blog = await blogsCollection.findOne(query);
            res.send(blog);
        })
        app.post('/blogs',async(req,res)=>{
            const blog = req.body;
            const result = await blogsCollection.insertOne(blog);
            res.json(result); 
        })
        app.put('/blogs/:id',async(req,res)=>{
            const id = req.params.id;
            const updateBlog = req.body;
            const filter = {_id: ObjectId(id)};
            const options = {upsert: true};
            const updateDoc = {
                $set:{
                    img: updateBlog.img,
                    title: updateBlog.title,
                    name: updateBlog.name,
                    description: updateBlog.description,
                    category: updateBlog.category,
                    price: updateBlog.price,
                    location: updateBlog.location
                }
            }
            const result = await blogsCollection.updateOne(filter,updateDoc,options)
            console.log('update',id);
            res.json(result)
            // res.send('updating')


        })
        app.delete('/blogs/:id',async(req,res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await blogsCollection.deleteOne(query);
            res.json(result)
        })

        // find single user 
        app.get('/users/:email',async(req,res)=>{
            const email = req.params.email;
            const query = {email:email}
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if(user?.role==='admin'){
                isAdmin=true;
            }
            res.json({admin:isAdmin})
        })
        // add user to the database 
        app.post('/users',async(req,res)=>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result)
        })

        app.put('/users',async(req,res)=>{
            const user = req.body;
            const filter={email:user.email};
            const updateDoc = {$set:user};
            const options = {upsert:true};
            const result = await usersCollection.updateOne(filter,updateDoc,options);
            res.json(result)
        })
        // make user an admin
        app.put('/users/admin',async(req,res)=>{
            const email = req.body.email;
            const filter = {email:email};
            const updateDoc = {$set:{role:'admin'}};
            const result = await usersCollection.updateOne(filter,updateDoc);
            res.json(result)
        })

        // GET TESTIMONIAL API
        app.get('/testimonial',async(req,res)=>{
            const cursor = testimonialCollection.find({});
            const testimonial = await cursor.toArray();
            res.send(testimonial);
        }) 
        // POST API FOR ADDING SERVICE
        app.post('/services', async(req,res)=>{
            const service = req.body;
            const result = await servicesCollection.insertOne(service);
            res.json(result);
        })
        // POST API FOR ADDING BOOKING 
        app.post('/booking',async (req,res)=>{
            const booking = req.body;
            const result = await bookingCollection.insertOne(booking);
            res.json(result);
            console.log('add book',booking);
        })
        // DELETE API FOR BOOKING 
        app.delete('/booking/:id', async(req,res)=>{
            const id = req.params.id;
            const query = {_id:id};
            const result = await bookingCollection.deleteOne(query);
            console.log('delete',result,query,id);
            res.json(result);
        })
    }
    finally{
        // await client.close();
    }
}
run().catch(console.dir);
app.get('/',(req,res)=>{
    res.send('working hh');
})
app.listen(port,()=>{
    console.log("running server",port);
})