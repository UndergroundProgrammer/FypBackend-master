const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const Product = require("../../models/Product")
const jwt = require('jsonwebtoken')

router.post('/login',async (req, res)=>{
  try{
    if(process.env.admin_username == req.body.username && process.env.admin_password == req.body.password){
       const token = jwt.sign({username: req.body.username,
                                password: req.body.password,
                                isAdmin :true},process.env.ADMIN_SEC)
      return res.status(200).json({accessToken:token});
    }else{
      return res.status(200).send({message:"Username or password incorrect"});
    }
  }catch(err){
      return res.status(500).send({message:"This product is invalid"});
  }
})

router.get("/doctors", async (req, res) => {
  try {
    let doctors = await User.find({userType:"doctor"},{username:1,email:1,img:1,specialization:1,city:1,phone:1,doctorTime:1,fee:1});
    if (doctors.length > 0) {
      res.status(200).send(doctors);
    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    res.status(422).send(error.message);
  }
});



router.get("/respondant", async (req, res) => {
  try {
    let respondant = await User.find({userType:"respondant"},{username:1,email:1,img:1,city:1,phone:1});
    if (respondant.length > 0) {
      res.status(200).send(respondant);
    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});


router.get("/patients",async (req, res) => {
  try {
    let patient = await User.find({userType:"patient"},{username:1,email:1,img:1,city:1,phone:1});
    if (patient.length > 0) {
      res.status(200).send(patient);
    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/user/:id",  async (req, res) => {
  try {
    let user = await User.findByIdAndDelete(req.params.id);
    if (user) {
      res.status(200).send({ message: "user deleted successfully" });
    } else {
      res.status(200).send({ message: "user is not available" });
    }
  } catch (error) {
    res.status(400).send(error.message);
  }
});

  //====================
  router.get('/products', async (req, res) => { 
    try{
    let product = await Product.find();
    if(product.length == 0){
      return res.status(200).send([])
    }else
    res.status(200).send(product);
    console.log("requested");
    }catch(e){
      res.status(400).send({message: e.message});
    }
});

router.get('/products/:id', async (req, res) => {
  try{
    let id =  req.params.id;
    let product  = await Product.findById(id);
    if(product){
        res.status(200).send(product);
    }else{
      res.status(200).send("Product with this id is not found");
    }
  }catch(e){
    res.status(400).send({message: e.message});
  }
});


router.put("/products/:id",  async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
    res.status(200).send(updatedProduct);
  } catch (err) {
    res.status(500).send(err.message);
  }
});


router.delete("/products/:id",  async function (req, res) {

    try {
    let id = req.params.id;
    let product = await Product.findByIdAndDelete(id);
    if(!product){
      res.status(200).send({message: "This product is not available"});
    }
    return res.send(product);
    }catch (err) {
     return res.status(404).send({message:"Id is not a valid"});
    }
});

router.post('/products',async (req, res)=>{

    try{
      console.log(req.body);
        let product = new Product(req.body);
        await product.save();
        return res.status(200).send(product);
    }catch(err){
        return res.status(500).send({message:"This product is invalid"});
    }
});



module.exports = router;