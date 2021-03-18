const express = require('express');
const {userById, allUsers, getUser, updateUser, deleteUser, 
    hasAuthorization, userPhoto} = require('../controllers/user');
const {requireSignin} = require('../controllers/auth');

const router = express.Router();

router.get("/users", allUsers);

router.get("/user/:userId", requireSignin, getUser);

router.put("/user/:userId", requireSignin, hasAuthorization, updateUser);

router.delete("/user/:userId", requireSignin, hasAuthorization, deleteUser);

router.get('/user/photo/:userId', userPhoto);

// any route containing :userId, our app will fist execute userByID()
router.param("userId", userById);

// exports.getPosts = (req, res) => {
//     // res.send("Hello world from node js")
// }

module.exports = router;