const router = require("express").Router()
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const Book = require("../models/books")
const {authenticateToken} = require("./userAuth")


//add book
router.post("/addbook", authenticateToken, async(req,res)=>{
     try{
        const {id} = req.headers;
        const user = await User.findById(id)
        if(user.role !== "admin"){
            return res.status(400).json({message:"you are not an admin.only admin could add book"})

        }

        const book = new Book({
            url: req.body.url,
            title: req.body.title,
            price: req.body.price,
            author: req.body.author,
            desc: req.body.desc,
            language: req.body.language,
        })
        await book.save()
        return res.status(200).json({message:"Book added successfully"})
     }
     catch(error){
        return res.status(500).json({message: "internal server error"})
     }
})

//update book

router.put("/updatebook", authenticateToken, async (req, res) => {
    try {
      const { bookid } = req.headers;
  
      if (!bookid) {
        return res.status(400).json({ message: "Book ID is required" });
      }
  
      const updateResult = await Book.findByIdAndUpdate(
        bookid,
        {
          url: req.body.url,
          title: req.body.title,
          price: req.body.price,
          author: req.body.author,
          desc: req.body.desc,
          language: req.body.language,
        },
        { new: true } // Return the updated document
      );
  
      if (!updateResult) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      return res.status(200).json({ message: "Book updated successfully", book: updateResult });
    } catch (error) {
      return res.status(500).json({ message: "Internal server error" });
    }
  })


//deletebook

router.delete("/deletebook", authenticateToken, async(req,res)=>{
    try{
       const {bookid} = req.headers;
       await Book.findByIdAndDelete(bookid);
       return res.status(200).json({
        message:"book deleted successfully"
       })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
})



//getallbooks
router.get("/getallbooks", authenticateToken, async(req,res)=>{
    try{
        const books = await Book.find().sort({createdAt: -1 })
        return res.json({
            status: "Sucess",
            data : books
        })
    }
    catch(error){
        return res.status(500).json({
          message:"internal server error"
        })
    }
})



//getrecentbooks
router.get("/recentbooks",async(req,res)=>{
    try{
        const books = await Book.find().sort({createdAt: -1 }).limit(20)
        return res.json({
            status: "Success",
            data : books
        })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
})

//get book by title
router.get("/getbookbyid/:id", async(req,res)=>{
    try{
       const {id} = req.params
       const book = await Book.findById(id);
        if (!book) {
          return res.status(404).json({ message: "Book not found" });
        }
       return res.json({
        status:"Success",
        data:book
       })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
})

module.exports = router