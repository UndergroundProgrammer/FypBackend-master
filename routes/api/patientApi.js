const express = require("express");
const res = require("express/lib/response");
const router = express.Router();
const User = require("../../models/User");
const axios = require("axios");
const { verifyToken } = require("../../middlewares/authenticate");

router.post("/request/respondant/:id", verifyToken, async (req, res) => {
  let patient = await User.findById(req.params.id, {
    _id: 1,
    username: 1,
    email: 1,
    respondants: 1,
    img: 1,
  });
  let respondant = await User.findById(req.body.respondantId, {
    _id: 1,
    username: 1,
    email: 1,
    requests: 1,
    img: 1,
  });
  if (patient && respondant) {
    var check = 0;
    await patient.respondants.forEach((value, index) => {
      if (value.id == respondant.id) {
        check = 1;
        return;
      }
    });

    if (check == 0)
      await respondant.requests.forEach((value, index) => {
        if (value.id == respondant.id) {
          check = 2;
          return;
        }
      });

    if (check === 1) {
      return res.status(422).send({
        message: "This Respondant is already Requested by current User",
      });
    } else if (check === 2) {
      return res
        .status(422)
        .send({ message: "This Patient is already Requested" });
    }
    patient.respondants.push(respondant.id);
    let obj = {
      patientId: patient.id,
      username: patient.username,
      email: patient.email,
      img: patient.img,
      data: req.body.data,
    };
    respondant.requests.push(obj);

    await patient.save();
    await respondant.save();
    return res.status(200).send({ Patient: patient, Respondant: respondant });
  } else {
    return res
      .status(422)
      .send({ message: "Patient or Respondant Id is not correct" });
  }
});

router.get("/doctors/:id", verifyToken, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (patient && patient.userType == "patient") {
      const doctors = patient.doctors;
      if (doctors.length > 0) {
        const records = await User.find().where("_id").in(doctors).exec();
        res.status(200).send(records);
      } else {
        res.status(422).send({
          message: "There  is no Doctor Appointed by current Patient",
        });
      }
    } else {
      res.status(422).send({ message: "There  is no Patient with this ID" });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/respondant/:id", verifyToken, async (req, res) => {
  try {
    const patient = await User.findById(req.params.id);
    if (patient && patient.userType == "patient") {
      const respondants = patient.respondants;
      console.log(respondants);
      if (respondants.length > 0) {
        const records = await User.find().where("_id").in(respondants).exec();
        console.log(records);
        res.status(200).send(records);
      } else {
        res.status(422).send({
          message: "There  is no Respondant Appointed by current Patient",
        });
      }
    } else {
      res.status(422).send({ message: "There  is no Patient with this ID" });
    }
  } catch (err) {
    res.status(422).send({ message: "There is an error " + err.message });
  }
});

router.get("/:id", verifyToken, async (req, res) => {
  const patient = await User.findById(req.params.id);
  if (patient) {
    res.status(200).send(patient);
  } else {
    res.status(422).send({ message: "There  is no Patient with this ID" });
  }
});

router.post("/request/doctor/:id", verifyToken, async (req, res) => {
  console.log(req.body);
  try {
    let patient = await User.findById(req.params.id, {
      _id: 1,
      username: 1,
      email: 1,
      doctors: 1,
      img: 1,
    });
    let doctor = await User.findById(req.body.doctorId, {
      _id: 1,
      username: 1,
      email: 1,
      doctorCustomers: 1,
      img: 1,
    });
    if (patient && doctor) {
      var check = 0;
      await patient.doctors.forEach((value, index) => {
        if (value.id == doctor.id) {
          check = 1;
          return;
        }
      });

      await doctor.doctorCustomers.forEach((value, index) => {
        if (value.id == patient.id) {
          check = 2;
          return;
        }
      });
      if (check === 1) {
        return res.status(422).json({
          message: "This Doctor is already Appointed by current Patient",
        });
      } else if (check === 2) {
        return res.status(422).json({
          message: "This Customer is already in contact with current doctor",
        });
      }

      const object = {
        patientId: req.params.id,
        username: patient.username,
        email: patient.email,
        img: patient.img,
        data: req.body.data,
      };

      patient.doctors.push(doctor.id);
      doctor.doctorCustomers.push(object);
      await doctor.save();
      await patient.save();

      const response = await axios.post(
        "http://localhost:3000/api/checkout/payment",
        {
          tokenId: req.body.tokenId,
          amount: req.body.amount,
        }
      );
      return res
        .status(200)
        .json({ Patient: patient, Doctor: doctor, Response: response });
    } else {
      return res
        .status(422)
        .json({ message: "Patient or doctor Id is incorrect" });
    }
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
});

router.post("/checkdoctor/availability/:id", verifyToken, async (req, res) => {
  console.log(req.body);
  try {
    console.log(req.body);
    let patient = await User.findById(req.params.id, {
      _id: 1,
      username: 1,
      email: 1,
      doctors: 1,
      img: 1,
    });

    let doctor = await User.findById(req.body.doctorId, {
      _id: 1,
      username: 1,
      email: 1,
      doctorCustomers: 1,
      img: 1,
    });

    console.log(doctor);
    if (patient && doctor) {
      var check = 0;
      await patient.doctors.forEach((value, index) => {
        if (value.id == doctor.id) {
          check = 1;
          return;
        }
      });
      console.log(req.body.data.timing);
      await doctor.doctorCustomers.forEach((value, index) => {
        console.log(value.data.timing);
        if (value.id == patient.id) {
          check = 2;
          return;
        } else if (
          value.data.timing == req.body.data.timing &&
          value.data.date == req.body.data.date
        ) {
          console.log("docotor is not available for this slot");
          check = 3;
          return;
        }
      });

      if (check === 1) {
        return res.status(422).json({
          message: "This Doctor is already Appointed by current Patient",
        });
      } else if (check === 2) {
        return res.status(422).json({
          message: "This Customer is already in contact with current doctor",
        });
      } else if (check === 3) {
        return res.status(422).json({
          message: "This doctor is already booked for the current slot",
        });
      }

      return res
        .status(200)
        .json({ Patient: patient, Doctor: doctor, Response: response });
    } else {
      return res
        .status(422)
        .json({ message: "Patient or doctor Id is incorrect" });
    }
  } catch (err) {
    return res.status(500).json({ Message: err.message });
  }
});
module.exports = router;
