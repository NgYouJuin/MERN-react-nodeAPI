const express = require('express');
const {userById} = require('../controllers/user');
const {postById, getPosts, createPost, postsByUser, isPoster, updatePost, deletePost} = require('../controllers/posts');
const {requireSignin} = require('../controllers/auth');
const validator = require('../validator/index')

const router = express.Router();

router.get("/posts", getPosts)

router.post(
    "/post/new/:userId", 
    requireSignin, 
    createPost, 
    validator.createPostValidator
)

router.get("/posts/by/:userId", postsByUser)

router.delete('/post/:postId', requireSignin, isPoster, deletePost)

router.put('/post/:postId', requireSignin, isPoster, updatePost)

// exports.getPosts = (req, res) => {
//     // res.send("Hello world from node js")
// }

router.param("userId", userById);

router.param("postId", postById);

module.exports = router;