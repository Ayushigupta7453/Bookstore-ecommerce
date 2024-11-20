const express = require("express")
const app = express();
require("dotenv").config();
app.use(express.json())
require("./conn/conn")
const cors = require("cors")
app.use(cors())

//routes
const user = require("./routes/user")
app.use("/api/v1/",user)

const books = require("./routes/books")
app.use("/api/v1/",books)

const favourites = require("./routes/favourites")
app.use("/api/v1/",favourites)

const cart = require("./routes/cart")
app.use("/api/v1/",cart)

const order = require("./routes/order")
app.use("/api/v1/",order)

//creating port
app.listen(process.env.PORT,()=>{
    console.log(`server started at port ${process.env.PORT}`)
})

app.get("/",(req,res)=>{
    res.send("hello from backend")
})