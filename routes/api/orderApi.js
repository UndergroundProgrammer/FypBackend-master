const express = require('express');
const router = express.Router();
const Order = require('../../models/Order');
const User= require('../../models/User');

router.get('/',async (req, res) => { 
    let orders = await Order.find();
    res.send(orders);
});

router.get('/:userid',async (req, res) => {
    let id =  req.params.userid;
    let order  = await Order.findOne({userid: id});
    res.send(order);
});
router.put("/:id", async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).send(updatedOrder);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.delete("/:id", async function (req, res) {

    try {
    let id = req.params.id;
    let order = await Order.findByIdAndDelete(id);
    if(!order){
      res.status(404).send({message: "This product is not available"});
    }
    return res.send(order);
    }catch (err) {
     return res.status(404).send({message:"Id is not a valid"});
    }
});

router.post('/',async (req, res)=>{

    try{
        let order = new Order(req.body);
        console.log(order);
        await order.save();
        return res.send(order);
    }catch(err){
        return res.status(500).send({message:"This product is invalid"});
    }
});

router.get('/stats/income', async (req, res) => {
    const orders = await Order.find();

    if(orders.length > 0) {
    let sum = 0;
    orders.map(order=>{
       sum = sum + order.amount;
    });
    console.log(sum);
    res.status(200).send({total:sum});
    }else{
        res.status(404).send({message:"No orders"})
    }
});

router.get("/userorder/:id",async (req, res)=>{

       try{
          let orderId = req.params.id;
          let order = await Order.findById(orderId);
          if(order){
          let userId =  order.userId;
          let user  = await User.findById(userId);
          res.status(200).send(user);
          }else{
            res.status(404).send({message:"Invalid Id"});
          }
       }catch(err){
         res.status(400).send({message:"Some Problem Occur:"+err});
       }
          
})
module.exports = router;