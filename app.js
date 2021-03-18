const express = require('express');
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const expressValidator = require('express-validator');
const fs = require('fs');
const cors = require('cors');
// import mongoose
const mongoose = require('mongoose');
// load env variables
const dotenv = require('dotenv');
dotenv.config()

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
    console.log("DB Connected")
});
// mongoose.connect(
//     process.env.MONGO_URI,
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true
//     }
//   )
//   .then(() => console.log('DB Connected'))
   
//   mongoose.connection.on('error', err => {
//     console.log(`DB connection error: ${err.message}`)
//   });

// bring in routes
const postRoutes = require('./routes/post');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');

//apiDocs
app.get('/', (req, res) => {
    fs.readFile('docs/apiDocs.json', (err, data) => {
        if(err) {
            res.status(400).json({
                error: err
            })
        }
        const docs = JSON.parse(data)
        res.json(docs);
    });
});

const myOwnMiddleware = (req, res, next) => {
    console.log("middleware applied!!!");
    next();
}

// middleware
app.use(morgan('dev'));
// app.use(myOwnMiddleware);
app.use(bodyParser.json())
app.use(expressValidator())
app.use(cookieParser())
app.use(cors());
 
app.use("/", postRoutes);
app.use("/", authRoutes);
app.use("/", userRoutes);

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({error: 'Unauthorized'});
    }
  });

const port = 8080
app.listen(port, () => {
    console.log(`A Node Js API is listening on port: ${port}`)
});