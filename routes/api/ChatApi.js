const express = require("express");
const router = express.Router();
const Chat =  require("../../models/Chat");

router.post('/userChat/:roomId', async (req, res)=>{
    try{
    const roomId = req.params.roomId;
    const data = req.body;
    let chat  = await Chat.findOne({roomId: roomId});
    if(chat){
        const chatHistory = chat.chatHistory;
        chatHistory.push(data);
        await chat.save(); 
        res.status(200).send({message:"Successfully Saved in chat history"});
    }else{
        let chatObj  = {
            roomId: req.params.roomId,
            chatHistory:[
                { 
                    room: data.room,
                    message: data.message,
                    author: data.author,
                    time: data.time,
                  }
            ]
        }

         chat  = new Chat(chatObj);
         await chat.save();
        res.status(200).send(chat);
    }}
    catch(err){
        res.status(422).send({message: err.message});
    }
});

router.get('/userChat/:roomId', async (req, res) => {
    try{
        const roomId = req.params.roomId;
        const chat  = await Chat.findOne({roomId: roomId});
        if(chat){
            const chatHistory = chat.chatHistory;
            res.status(200).send(chatHistory);
        }else{
            res.status(422).send({message: "Room Id is wrong"});
        }
    }catch(err){

    }
})

module.exports = router;