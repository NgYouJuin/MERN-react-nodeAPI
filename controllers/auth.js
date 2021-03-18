const User = require("../models/user");
require('dotenv').config()
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const expressJwt = require("express-jwt");

//db connection
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
var db;
MongoClient.connect(process.env.MONGO_URI, 
    { 
        useNewUrlParser: true ,
        useUnifiedTopology: true 
    }, (err, database) => {
    if (err) return console.log(err);
    db = database.db('MERN');
    console.log("DB for auth route Connected")
});

exports.signup = async (req, res) => {
    const userExists = await db.collection('users').findOne({email: req.body.email})
    if(userExists) return res.status(403).json({
        error: "Email is taken!"
    })
    const user = await new User(req.body)
    await db.collection('users').save(user)
    res.status(200).json({message: "Signup success! Please login."});
}

exports.signin = (req, res) => {
    // find the user based on email
    console.log(req.body)
    const {email, password} = req.body
    db.collection('users').findOne({email}, (err, user) => {
        // if err or no user
        // console.log(user2.authenticate(password))
        if(err || !user) {
            return res.status(401).json({
                error: "User with that email does not exist. Please signin"
            })
        }
        const userData = new User(user)
        // if user is found make sure that email and password match
        // create authentication method in model and use here
        if(!userData.authenticate(password)) {
            return res.status(401).json({
                error: "Email and password do not match"
            })
        }
        hashedNewPassword = crypto
                            .createHmac("sha1", user.salt)
                            .update(password)
                            .digest("hex");
        if(user.hashed_password != hashedNewPassword) {
            return res.status(401).json({
                error: "Email and password do not match"
            })
        }
        // generate a token with user id and secret
        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
        // persist the token as 't' in cookie with expiry date
        res.cookie("t", token, {expire: new Date() + 9999})
        //return response with user and token
        const {_id, name} = user
        return res.json({ token, user: {_id, email, name}});
    });
}

exports.signout = (req, res) => {
    res.clearCookie("t")
    return res.json({message: "Signout success"});
}

exports.requireSignin = expressJwt({
    // if the token is valid, express jwt appends the verified users id
    // in an auth key to the request object
    secret: process.env.JWT_SECRET,
    algorithms: ["HS256"], // added later
    userProperty: "auth"
  });