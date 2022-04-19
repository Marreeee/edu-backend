const mongoose = require("mongoose");

const Like = mongoose.model(
    "like",
    new mongoose.Schema({
        likes: Boolean,

    })
);

module.exports = Like;