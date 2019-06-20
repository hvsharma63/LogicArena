let mongoose = require("mongoose");
let passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    createdAt: { type: Date, default: Date.now }
})

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);