const express = require('express');
const {signup, signin, signout} = require('../controllers/auth');
const {userById} = require('../controllers/user');
const {userSignupValidator} = require('../validator/index')

const router = express.Router();

router.post("/signup", userSignupValidator, signup);

router.post("/signin", signin);

router.get("/signout", signout);

// any route containing :userId, our app will fist execute userByID()
router.param("userId", userById);

// exports.getPosts = (req, res) => {
//     // res.send("Hello world from node js")
// }

module.exports = router;