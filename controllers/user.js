const _ = require('lodash')
const User = require("../models/user");
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
    console.log("DB for user route Connected")
});


exports.userById = (req, res, next, id) => {
    // db.collection('users').findOne({_id: ObjectId(id)}).exec((err, userData) => {
    //     if(err || ! userData){
    //         return res.status(400).json({
    //             error: "User not found"
    //         })
    //     }
    //     user = new User(userData)
    //     req.profile = user // adds profile object in req with user info
    //     next();
    // })
    db.collection('users').findOne({_id: ObjectId(id)})
    .then(user => {
      if (user) {
        req.profile = user // adds profile object in req with user info
        next();
      } else {
        res.status(404).json({ error: "User " + ObjectId(id) + " is not found!" });
      }
    })
    .catch(error => {
        return res.status(400).json({
            error: "User not found"
        })
    });
}

exports.hasAuthorization = (req, res, next) => {
    const authorized = req.profile && req.auth && req.profile._id == req.auth._id
    if(!authorized){
        return res.status(403).json({
            error: "User is not authorized to perform this action"
        })
    }
    next()
};

exports.allUsers = (req, res) => {
    db.collection('users').find()
    .toArray((err, users) => {
        if(err) {
            return res.status(400).json({
                error: err
            })
        }
        var i;
        for (i = 0; i < users.length; i++) {
            users[i].hashed_password = undefined;
            users[i].salt = undefined;
        }
      res.json({
        users
      });
    }).select("name email updated created")
};

exports.getUser = (req, res) => {
    req.profile.hashed_password = undefined;
    req.profile.salt = undefined;
    return res.json(req.profile)
};

// exports.updateUser = (req, res, next) => {
//     // console.log(req.body)
//     let user = new User(req.profile) 
//     user = _.extend(user, req.body) // extend - mutate the source object
//     user.updated = new Date(Date.now())
//     db.collection('users').updateOne({"_id": ObjectId(user._id.toString())}, {
//         $set: user })
//         .then(result => {
//             user.hashed_password = undefined;
//             user.salt = undefined;
//             res.status(200).json({ 
//                 message: "Update successful!",
//                 user
//             });
//         })
//         .catch(error => {
//           console.log(error)
//           res.status(400).json({
//             error: "You are not authorized to perform this action"
//           });
//         });
// }

exports.updateUser = (req, res, next) => {
    let form = new formidable.IncomingForm();
    // console.log("incoming form data: ", form);
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: 'Photo could not be uploaded'
            });
        }
        // save user
        let user = req.profile;
        // console.log("user in update: ", user);
        user = _.extend(user, fields);

        user.updated = Date.now();
        // console.log("USER FORM DATA UPDATE: ", user);

        if (files.photo) {
            user.photo.data = fs.readFileSync(files.photo.path);
            user.photo.contentType = files.photo.type;
        }
        db.collection('users').updateOne({"_id": ObjectId(user._id.toString())}, {
        $set: user })
        .then(result => {
            user.hashed_password = undefined;
            user.salt = undefined;
            res.status(200).json({ 
                message: "Update successful!",
                user
            });
        })
        .catch(error => {
          res.status(400).json({
            error: error
          });
        });
    })
}

exports.userPhoto = (req, res, next) => {
    if (req.profile.photo.data) {
        res.set(('Content-Type', req.profile.photo.contentType));
        return res.send(req.profile.photo.data);
    }
    next();
  };


exports.deleteUser = (req, res, next) => {
    let user = req.profile;
    db.collection('users').deleteOne({ "_id": ObjectId(user._id.toString())})
    .then(result => {
        user.hashed_password = undefined;
        user.salt = undefined;
        res.status(200).json({ 
            message: "Delete successful!",
            user
        });
    })
    .catch(error => {
      console.log(error)
      res.status(400).json({
        error: "You are not authorized to perform this action"
      });
    });
}