const mongoose = require("mongoose");

const Thread = mongoose.model(
    "thread",
    new mongoose.Schema({
        title: String,
        content: String,
        replies: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'reply'
        }]

    })
);

module.exports = Thread;