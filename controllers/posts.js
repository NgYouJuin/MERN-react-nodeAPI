const _ = require('lodash')
const Post = require("../models/post")
const formidable = require('formidable')
const fs = require('fs')

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
    console.log("DB for post route Connected")
});

exports.postById = (req, res, next, id) => {
  db.collection('posts').findOne({_id: ObjectId(id)})
  .then(post => {
    if (post) {
      req.post = post;
      next();
    } else {
      res.status(400).json({ error: "Post " + ObjectId(id) + " is not found!" });
    }
  })
  .catch(error => {
      return res.status(400).json({
          error: error
      })
  });
}

exports.getPosts = (req, res) => {
    db.collection('posts').find()
    .toArray((err, results) => {
      res.status(200).json({
        message: 'Posts fetched successfully!',
        posts: results
      });
    });
}

exports.createPost = (req, res, next) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, (err, fields, files) => {
      if(err) {
        return res.status(500).json({
          error: "Image could not be uploaded"
        });
      }
      let post = new Post(fields);
      req.profile.hashed_password = undefined;
      req.profile.salt = undefined;
      post.postedBy = req.profile;
      if(files.photo) {
        post.photo.data = fs.readFileSync(files.photo.path)
        post.photo.contentType = files.photo.type
      }
      db.collection('posts').save(post)
        .then(result => {
         console.log('saved to database');
        res.status(201).json({
           message: "Post created!",
           body: post,
           result: result
        });
        })
        .catch(err => {
          console.log(err)
          res.status(500).json({
            message: "Invalid authentication credentials!",
            error: err
          });
        });
      })
}

exports.postsByUser = (req, res) => {
  db.collection('posts').find({postedBy: req.profile._id})
  .sort({ _created: 1 })
  .toArray( (err, results) => {
    if(err){
      return res.status(500).json({
        error: err
      });
    }
    res.status(200).json({
      message: 'Posts fetched successfully!',
      posts: results
    });
  });
}

exports.isPoster = (req, res, next) => {
  let isPoster = req.post && req.auth && req.post.postedBy.toString() === req.auth._id.toString()
  if(!isPoster){
    return res.status(403).json({
      error: "User is not authorized"
    });
  }
  next();
}

exports.updatePost = (req, res, next) => {
  let post = req.post;
  post = _.extend(post, req.body)
  db.collection('posts').updateOne({"_id": ObjectId(post._id.toString())}, {
    $set: post })
    .then(result => {
        res.status(200).json({ 
            message: "Update successful!",
            post
        });
    })
    .catch(error => {
      console.log(error)
      res.status(400).json({
        error: "You are not authorized to perform this action"
      });
    });
}

exports.deletePost = (req, res) => {
  let post = req.post;
  db.collection('posts').deleteOne({ "_id": post._id})
    .then(result => {
        res.status(200).json({ 
            message: "Delete successful!",
            post
        });
    })
    .catch(error => {
      res.status(400).json({
        error: error
      });
    });
}

