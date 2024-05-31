const express = require("express");
const router = express.Router();
const User = require("../models/user");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

router.use(express.json());

router.post("/signup", async (req, res) => {
    const newUser = new User({
        email: req.body.email,
        password: CryptoJS.AES.encrypt (
            req.body.password,
            process.env.PASS_SEC
        ).toString(),
    });

    const existingEmail = await User.findOne({email: req.body.email});
    if(existingEmail){
        return res.status(400).json({error: "This Email is already register !!"});
    }

    try {
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    }
    catch(err){
        res.status(500).json(err);
    }
})


router.post("/login", async (req, res) => {
    try{
        const {email, password} = req.body;
        const user = await User.findOne({email});

        if(!user){
            return res.status(401).json({error: "Email not Found"});
        }

        const bytes = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
        const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

        if(originalPassword !== password){
            return res.status(401).json({error: "Wrong Password"});
        }

        const accessToken = jwt.sign({
            id: user._id,
            email: user.email
        }, process.env.JWT_SEC, {expiresIn: "3d"});

        const {password: userPassword, ...userData} = user._doc;

        res.status(200).json({user: userData, accessToken});

    }
    catch(err){
        console.error(err);
        res.status(500).json({error: "Internal Server Error"});
    }
})



module.exports = router;