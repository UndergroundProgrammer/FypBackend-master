const { id } = require('@hapi/joi/lib/base');
const express = require('express');
const router = express.Router();
const {verifyToken} =   require("../../middlewares/authenticate")
const User = require("../../models/User");

router.get("/patients/:id",verifyToken,async (req, res) => {
    try{
        const doctor = await User.findById(req.params.id);
        if(doctor && doctor.userType=="doctor"){
           const patients = doctor.doctorCustomers;
           console.log(patients)
           if(patients.length > 0){
             res.status(200).send(patients)
           }else{
            res.status(200).send([])
           }
        }else{
          res.status(422).send({message:"There  is no Doctor with this ID"})
        }
      }catch(err){
            console.log(err)
            res.status(500).send({message:"There is some Error "+err.message})
      }
});


router.get('/acceptedPatients/:id', verifyToken,async (req, res) => {
    try{
        const doctor = await User.findById(req.params.id);
        if(doctor && doctor.userType=="doctor"){
           const patients = doctor.doctorAccepts;
           console.log(patients)
           if(patients.length > 0){
             const records = await User.find().where('_id').in(patients).exec();
             console.log(records)
             res.status(200).send(records)
           }else{
            res.status(422).send({message:"No Request Accepted by the current Doctor"})
           }
        }else{
          res.status(422).send({message:"There  is no Doctor with this ID"})
        }
      }catch(err){
            console.log(err)
            res.status(500).send({message:"There is some Error "+err.message})
      }
})

router.post("/accept/:id",verifyToken, async (req, res)=>{

    try{
        const doctor = await User.findById(req.params.id);
        const patientId = req.body;
        
        let isExist = false;
        const doctorCustomers = doctor.doctorCustomers;
        await doctorCustomers.map((value)=>{
            console.log("ss"+value.id);
            console.log("pp"+patientId._id);
            if(value.id  == patientId._id){
                isExist = true;
                return;
            }
        })

        if(!isExist){
            return res.status(422).send({message:"There is no Request From given Patient to current Doctor"})
        }else 
        if(doctor && doctor.userType=="doctor"){
           const patients = doctor.doctorAccepts;
           
             patients.push(patientId);
            await User.findByIdAndUpdate(patientId,{$pull:{doctors:{_id: req.params.id}}}).exec();
            await User.findByIdAndUpdate(doctor,{$pull:{doctorCustomers:{_id: patientId._id}}}).exec();
            
            doctor.doctorAccepts = patients;
            await doctor.save();
            res.status(200).send(doctor);
        }else{
          res.status(422).send({message:"There  is no Doctor with this ID"})
        }
      }catch(err){
            console.log(err)
            res.status(500).send({message:"There is some Error "+err.message})
      }
     
});

router.get('/:id', verifyToken,async (req, res) => {
    try {
        const doctor = await User.findById(req.params.id);
        if(doctor){
            res.status(200).send(doctor);
        }else{
            res.status(422).send({message:"There  is no Doctor with this ID."});
        }
    } catch (error) {
        res.status(500).send(error.message);
    }
});
module.exports = router;