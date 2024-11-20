const router = require("express").Router()
const User = require("../models/user")
const {authenticateToken} = require("./userAuth")
const Book = require("../models/books")
const Order = require("../models/order")

//place order
router.post("/placeorder", authenticateToken, async(req,res)=>{
    try{
        const {id} = req.headers
        const {order} = req.body
        for(const orderdata of order){
            const neworder = new Order({user:id,book:orderdata._id})
            const orderdatafromdb = await neworder.save()
            //saving order in user model
            await User.findByIdAndUpdate(id,{
                $push:{orders:orderdatafromdb._id},
            })
            //clearing cart
            await User.findByIdAndUpdate(id,{
                $pull : {cart:orderdatafromdb._id},
            })
        }
        return res.json({
            status:"Success",
            message:"order placed successfully"
        })
    }
    catch(error){
        return res.status(500).json({message:"internal seerver errror"})
    }
})


//get order history of particular user
router.get("/getorderhistory",authenticateToken,async(req,res)=>{
    try{
       const {id}= req.headers
       const userdata = await User.findById(id).populate({
        path:"orders",
        populate:{path:"book"},
       })
       const orderdata = userdata.orders.reverse()
       return res.json({
        status:"Success",
        data: orderdata
       })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
})

//cancel order within 1 day
router.put("/cancelorder/:id", authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.headers.id;

        const order = await Order.findById(id).populate("book");
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        const timeDifference = Date.now() - new Date(order.createdAt).getTime();
        const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

        if (timeDifference > oneDayInMilliseconds) {
            return res.status(400).json({ message: "Cancellation period has expired" });
        }

        await Order.findByIdAndDelete(id);
        await User.findByIdAndUpdate(userId, {
            $pull: { orders: id },
        });

        return res.json({ status: "Success", message: "Order canceled successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});


//getallordersfor admin
router.get("/getallorders",authenticateToken,async(req,res)=>{
    try{
      const userdata = await Order.find()
      .populate({
        path:"book",
      })
      .populate({
        path:"user"
      })
      .sort({createdAt: -1})
      return res.json({
        status:"success",
        data:userdata
      })
    }
    catch(error){
        return res.status(500).json({message:"internal server error"})
    }
})

//update order by admin
router.put("/updatestatus/:id", authenticateToken,async(req,res)=>{
    try{
        const {id}=req.params
    await Order.findByIdAndUpdate(id,{
        status: req.body.status
    })
    return res.json({
        status:"success",
        message:"status updated successfully"
    })
    }
    catch(error){
        return res.status(500).json({
            message:"internal server error"
        })
    }
})
module.exports = router