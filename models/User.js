const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    userType: { type: String, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    img: { type: String, required: true },
    isAdmin: { type: Boolean },
    respondants: [
      {
        respondantId: { type: String },
      },
    ],
    specialization: { type: String },
    requests: [
      {
        patientId: { type: String },
        username: { type: String },
        email: { type: String },
        img: { type: String },
        data: { type: Object },
      },
    ],
    doctors: [
      {
        doctorId: { type: String },
      },
    ],
    doctorCustomers: [
      {
        patientId: { type: String },
        username: { type: String },
        email: { type: String },
        img: { type: String },
        data: { type: Object },
      },
    ],
    doctorAccepts: [
      {
        patientId: { type: String },
      },
    ],
    respondantAccepts: [
      {
        patientId: { type: String },
        username: { type: String },
        email: { type: String },
        img: { type: String },
        data: { type: Object },
      },
    ],
    doctorsAppointmentHistory: [
      {
        patientId: { type: String },
        username: { type: String },
        age: { type: Number },
        dateTime: { type: String },
        symptoms: { type: String },
        diagnosis: { type: String },
        rescheduleVisit: { type: String },
        prescription: { type: String },
      },
    ],
    doctorTime: { type: String },
    customerTime: [{ type: String }],
    fee: { type: Number },
  },
  { timestamps: true }
);
const user = mongoose.model("User", userSchema);
module.exports = user;
