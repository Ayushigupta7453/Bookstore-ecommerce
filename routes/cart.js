const router = require("express").Router()
const User = require("../models/user")
const {authenticateToken} = require("./userAuth")


//add book to cart
router.put("/addtocart", authenticateToken , async(req,res)=>{
    try{
      const {bookid , id} = req.headers;
      const userdata = await User.findById(id)
      const isbookincart = userdata.cart.includes(bookid)
      if(isbookincart){
        return res.json({status:"Success",message:"book is already in cart"})
      }
      await User.findByIdAndUpdate(id,{
        $push : {cart:bookid},
      })
      return res.json({
        status:"success",
        message:"book added to cart"
      })
    }
    catch(error){
        return res.status(500).json({message:"Internal server error"})
    }
})

//remove book from cart

router.put("/removefromcart/:bookid",authenticateToken,async(req,res)=>{
    try{
       const {bookid} = req.params;
       const {id} = req.headers;
       await User.findByIdAndUpdate(id,{
        $pull : {cart : bookid},
       })
       return res.json({
        status:"success",
        message:"book removed from cart"
       })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
})


// get cart of a particular user
router.get("/getusercart", authenticateToken, async(req,res)=>{
    try{
       const {id} = req.headers
       const userdata = await User.findById(id).populate("cart")
       const cart = userdata.cart.reverse()

       return res.json({
        status:"success",
        data:cart,
       })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
})


module.exports = router;