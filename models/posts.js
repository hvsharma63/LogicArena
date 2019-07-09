const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    answers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Answer",
    }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", postSchema);