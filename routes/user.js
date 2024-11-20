const router = require("express").Router()
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const {authenticateToken} = require("./userAuth")
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Order = require("../models/order");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ayushi7453gupta@gmail.com',
        pass: "esbp kwzy mugf zgtn"
    }
});

// Generate OTP
function generateOTP() {
    return crypto.randomBytes(3).toString('hex'); // Generates a 6-character OTP
}

//signup
router.post("/signup",async(req,res)=>{
    try{
       const {username,email,password,address}=req.body

       //username validation
    
       if(username.length < 4){
        return res.status(400).json({message:"username should be length more than 4"})
       }

       //email validation

       if (!emailPattern.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

       //checking username alredy exist

       const existuser = await User.findOne({username:username})
       if(existuser){
        return res.status(400).json({message:"user exist already"})
       }

        //checking email alredy exist

       const existemail = await User.findOne({email:email})
       if(existemail){
        return res.status(400).json({message:"email exist already"})
       }

       //password validation

       if (!passwordPattern.test(password)) {
        return res.status(400).json({ message: "Password must be at least 6 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character" });
       }
       
       // Generate OTP
       const otp = generateOTP();

       // Send OTP email
       const mailOptions = {
           from: 'ayushi7453gupta@gmail.com',
           to: email,
           subject: 'Email Verification OTP',
           text: `Your OTP for email verification is ${otp}`
       };

       transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).json({ message: "Error sending OTP email" });
        } else {
            const hashPass = bcrypt.hashSync(password, 10);
            const newUser = new User({
                username: username,
                email: email,
                password: hashPass,
                address: address,
                otp: otp, // Save OTP with user
                isVerified: false // Mark user as not verified
            });

            newUser.save().then(() => {
                return res.status(200).json({ message: "Signup successful. Please verify your email." });
            }).catch((error) => {
                return res.status(500).json({ message: "Error saving user" });
            });
        }
    });
    }catch(error){
        res.status(500).json({message:"internal server error"});
    }
})

// Verify email
router.post("/verifyemail", async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({ email: email });

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.otp === otp) {
            user.isVerified = true;
            user.otp = null; // Clear the OTP
            await user.save();
            return res.status(200).json({ message: "Email verified successfully" });
        } else {
            return res.status(400).json({ message: "Invalid OTP" });
        }
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});


//signin
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Email validation
        if (!emailPattern.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if (!existingUser.isVerified) {
            return res.status(400).json({ message: "Email not verified. Please check your inbox." });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (isPasswordValid) {
            const authClaims = {
                id: existingUser._id,
                role: existingUser.role,
            };
            const token = jwt.sign(authClaims, "bookStore123", { expiresIn: "30d" });
            res.status(200).json({
                id: existingUser._id,
                role: existingUser.role,
                token: token,
            });
        } else {
            res.status(400).json({ message: "Invalid email or password" });
        }

    } catch (error) {
        console.error('Error during sign-in:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});



//get-user-information
router.get("/getuserinformation",authenticateToken,async(req,res)=>{
    try{
       const {id} =req.headers;
       const data = await User.findById(id).select('-password')
       if (!data) {
        return res.status(404).json({ message: "User not found" });
    }
       return res.status(200).json(data)
    }
    catch(error){
        return res.status(500).json("internal server error ")
    }
})


//update address
router.put("/updateaddress",authenticateToken,async(req,res)=>{
    try{
        const {id} =req.headers;
        const {address} = req.body
        await User.findByIdAndUpdate(id,{ address: address })
        return res.status(200).json({ message :"address updated successfully"})
    }
    catch(error){
        return res.status(500).json("Internal server error")
    }
})


//fetch all users

router.get("/allusers", authenticateToken, async (req, res) => {
    try {
        const users = await User.find().populate("orders");
        const usersWithOrderCount = users.map(user => ({
            username: user.username,
            email: user.email,
            orderCount: user.orders.length
        }));

        return res.json({
            status: "Success",
            data: usersWithOrderCount
        });
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
});
    

module.exports = router;