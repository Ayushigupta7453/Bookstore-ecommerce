const router = require("express").Router()
const User = require("../models/user")
const {authenticateToken} = require("./userAuth")


//add book to favourites

router.put("/addbooktofav", authenticateToken, async(req,res)=>{
    try{
       const {bookid, id} = req.headers
       const userdata = await User.findById(id)
       const isbookfav = userdata.favourites.includes(bookid)
       if(isbookfav){
        return res.status(200).json({message:"book is already in favourites"})
       }
       await User.findByIdAndUpdate(id,{
        $push:{ favourites : bookid }
       })
       return res.status(200).json({message:"book added in favourites"})
    }  
    catch(error){
        return res.status(500).json("internal server error")
    }
})

//remove from fav

router.put("/delbookfromfav", authenticateToken, async(req,res)=>{
    try{
       const {bookid, id} = req.headers
       const userdata = await User.findById(id)
       const isbookfav = userdata.favourites.includes(bookid)
       if(isbookfav){
        await User.findByIdAndUpdate(id,{
            $pull:{ favourites : bookid }
           })
       }
     
       return res.status(200).json({message:"book removed from favourites"})
    }  
    catch(error){
        return res.status(500).json("internal server error")
    }
})


// get fav book of a particular user
router.get("/getbookofuser", authenticateToken, async(req,res)=>{
    try{
       const {id} = req.headers
       const userdata = await User.findById(id).populate("favourites")
       const favbooks = userdata.favourites
     
       return res.status(200).json({status:"Success",data:favbooks})
    }  
    catch(error){
        return res.status(500).json("internal server error")
    }
})

module.exports = router