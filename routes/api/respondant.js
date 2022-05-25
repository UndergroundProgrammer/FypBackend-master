const { id } = require('@hapi/joi/lib/base');
const express = require('express');
const router = express.Router();
const User = require("../../models/User");
const {verifyToken}  = require('../../middlewares/authenticate')

router.get("/patients/:id",verifyToken,async (req, res) => {
    try{
        const respondant = await User.findById(req.params.id);
        if(respondant && respondant.userType=="respondant"){
           const patients = respondant.requests;
           if(patients.length > 0){
             res.status(200).send(patients)
           }else{
            res.status(200).send([])
           }
        }else{
          res.status(422).send({message:"There  is no respondant with this ID"})
        }
      }catch(err){
            res.status(500).send({message:"There is some Error "+err.message})
      }
});


router.get('/acceptedPatients/:id',verifyToken, async (req, res) => {
    try{
        const respondant = await User.findById(req.params.id);
        if(respondant && respondant.userType=="respondant"){
           const patients = respondant.respondantAccepts;
           console.log(patients)
           if(patients.length > 0){
             res.status(200).send(patients)
           }else{
            res.status(200).send([])
           }
        }else{
          res.status(422).send({message:"There is no respondant with this ID"})
        }
      }catch(err){
            console.log(err)
            res.status(500).send({message:"There is some Error "+err.message})
      }
})



router.post("/reject/:id", verifyToken,async (req, res)=>{

  try{
    const respondant = await User.findById(req.params.id);
    const patientId = req.body;
    console.log(patientId.patientId);
    let isExist = false;
    const respondantRequests = respondant.requests;
    await respondantRequests.map((value)=>{
      console.log(value.patientId);
        if(value.patientId  == patientId.patientId){
            isExist = true;
            
            return;
        }
    })

    if(!isExist){
        return res.status(421).send({message:"There is no Request From given Patient to current Respondant"})
    }else 
    if(respondant && respondant.userType=="respondant"){
        await User.findByIdAndUpdate({_id: patientId.patientId},{$pull:{respondants:{_id: req.params.id}}}).exec();
        await User.findByIdAndUpdate({_id:respondant._id},{$pull:{requests:{patientId: patientId.patientId}}}).exec();
       
        res.status(200).send(respondant);
    }else{
      res.status(422).send({message:"There  is no respondant with this ID"})
    }
  }catch(err){
        console.log(err)
        res.status(423).send({message:"There is some Error "+err.message})
  }
   
});


router.post("/accept/:id", verifyToken,async (req, res)=>{

    try{
        const respondant = await User.findById(req.params.id);
        const patientId = req.body;
        console.log(patientId.patientId);
        let isExist = false;

        let data = {};
        const respondantRequests = respondant.requests;
        await respondantRequests.map((value)=>{
          console.log(value.patientId);
            if(value.patientId  == patientId.patientId){
                isExist = true;
                data = value;
                
                return;
            }
        })

        if(!isExist){
            return res.status(421).send({message:"There is no Request From given Patient to current Respondant"})
        }else 
        if(respondant && respondant.userType=="respondant"){
           const patients = respondant.respondantAccepts;
           console.log("______________________________")
             console.log(data)
             patients.push(data);
            await User.findByIdAndUpdate({_id: patientId.patientId},{$pull:{respondants:{_id: req.params.id}}}).exec();
            await User.findByIdAndUpdate({_id:respondant._id},{$pull:{requests:{patientId: patientId.patientId}}}).exec();
            
            respondant.respondantAccepts = patients;
            await respondant.save();
            res.status(200).send(respondant);
        }else{
          res.status(422).send({message:"There  is no respondant with this ID"})
        }
      }catch(err){
            console.log(err)
            res.status(423).send({message:"There is some Error "+err.message})
      }
     
});

router.get('/:id',verifyToken, async (req, res) => {
    try {
        const respondant = await User.findById(req.params.id);
        if(respondant){
            res.status(200).send(respondant);
        }else{
            res.status(422).send({message:"There  is no respondant with this ID."});
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;