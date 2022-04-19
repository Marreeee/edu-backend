const cors = require("cors")
const express = require("express")
const bodyParser = require('body-parser')
const req = require("express/lib/request")
const mongoose = require("mongoose");

const dotenv = require('dotenv');
var dotenvExpand = require('dotenv-expand')
var env = dotenv.config()
dotenvExpand.expand(env)


const CONNECTION_STRING = process.env.CONNECTION_STRING
const PORT = process.env.PORT || 3001


mongoose.connect(CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const Thread = require("./model/threads");
const Reply = require("./model/replies");
const Like = require("./model/likes");
const User = require("./model/users");
const { response } = require("express");

const app = express()


app.use('/healthcheck', require('./routes/healthcheck.js'));
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use(bodyParser.json());

app.get("/", (request ,response)=>{
    response.set("http_status",200 )
    response.set("cache-control", "no-cache")
    response.set('Content-Type', 'application/json');
    body={"status": "available"}
    response.status(200).send(body)
    
    User.create
})

app.get("/threads", async (request, response) => {
    const threads = Thread.find().then( (threads) => {
        response.json(threads)
    })
})

app.post("/threads", async (request, response) => {
    let thread = new Thread(request.body)
    thread.save()
    response.status(200).json(thread)
})

app.get("/threads/:id", async (request, response) => {
    let thread 
    try{
        thread = await Thread.findById(request.params.id)
    } catch (e) {
        response.status(400).send("Bad request")
    }
    if(thread){
        response.status(200).json(thread)
    }else{
        response.status(404).send("Thread not found!")
    }
})

app.get("/threads/:id/replies", async (request, response)=> {
    let reply
    try{
    reply = await Thread.findById(request.params.id)
    }catch(e){
       response.status(400).send("Bad Request")
    }
    if(reply){
       response.status(200).json(request.body)
    }else{
       response.status(404).send("Replies not found!")
    }
 })

app.post("/threads/:id/replies", async (request, response) => {
    let thread 
    try{
        thread = await Thread.findById(request.params.id)
    } catch (e) {
        response.status(400).send("Bad request")
    }

    if (thread) {
        request.body.time = new Date();
        const reply = new Reply(request.body);
        thread.replies.push(reply);
        await reply.save();
        await thread.save();
        response.status(201).end();
    } else {
        response.status(404).send("Not found")
    }
})

app.post("/threads/:threadId/replies/:replyId/like", (request, response) => {
    let replies;
    try {
        replies = await Reply.findById(request.paramds.replyId)
        if(replies) {
            const likes = new Like({ like: true })
            await likes.save()
            replies.likes.push(likes)
            await replies.save()
            response.status(200).send(likes)
        } else {
            response.status(404).send("Not found")
        }
    } catch (e) {
        response.status(404).send("Bad request " + e)
    }
})

app.delete("users/:id", (request, response)=>{
    try{
        User.deleteOne({ _id: request.params.id});
    } catch(e) {
        response.status(400).send("Bad request")
    }
    response.status(200).end();
})

app.delete("/threads/:threadId/replies/:replyId/likeId",
async (request, response) => {
    try {
        await Like.deleteOne({ _id: request.params.likeId});
        response.status(200).send("Success liked deleted");
    } catch (e) {
        response.status(400).send("Bad request");
    }
    response.status(200).end()
})

app.post("/users", (request, response) => {
    console.log(request.body)
    let user = new User(request.body)
    user.save()
    response.status(200).send(request.body)
})

app.get("/users/:id", (request, response)=> {
    console.log(request.params.id)
    User.findById(request.params.id, (err, user) => {
        console.log(user)
        if (err) throw error;
        if (user) {
            response.status(200).json(user)
        } else {
            response.status(404).send("Not found")
        }
    })
})

app.listen(PORT , ()=>{
    console.log(`STARTED LISTENING ON PORT ${PORT}`)
})