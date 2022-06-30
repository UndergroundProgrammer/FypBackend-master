const mongoose = require("mongoose");

const chatSchema = mongoose.Schema(
  {
    roomId : { type: String},
    chatHistory:[
        { 
          room: { type: String },
          message: { type: String },
          author: { type: String },
          time: { type: String },
        }
      ],
  },
);
const chat = mongoose.model('Chat',chatSchema);
module.exports =  chat;