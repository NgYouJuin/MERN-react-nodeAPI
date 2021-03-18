const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true, 
        required: true
    },
    email: {
        type: String, 
        trim: true, 
        required: true
    },
    hashed_password: {
        type: String, 
        trim: true, 
        required: true
    },
    salt: String,
    created: {
        type: Date, 
        default: Date.now
    },
    updated: Date,
    photo: {
        data: Buffer,
        contentType: String
    },
    about: {
        type: String,
        trim: true
    }
})

// virtual field
userSchema.virtual('password')
.set(function(password) {
    // create temporary variable called _password
    this._pasword = password
    // generate a timestamp
    this.salt = uuidv4()
    // encryptePassword()
    this.hashed_password = this.encryptPassword(password)
})
.get(function() {
    return this._pasword
})

// methods
userSchema.methods = {
    authenticate: function(plainText) {
        return this.encryptPassword(plainText) === this.hashed_password;
    },

    encryptPassword: function(password) {
        if (!password) return "";
        try {
            return crypto
                .createHmac("sha1", this.salt)
                .update(password)
                .digest("hex");
        } catch (err) {
            return "";
        }
    }
};

module.exports = mongoose.model("User", userSchema)