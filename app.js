var createError = require("http-errors");
var cors = require("cors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var indexRouter = require("./routes/index");
const adminRouter = require("./routes/api/adminApi");
const authRouter = require("./routes/api/auth");
const productRouter = require("./routes/api/productApi");
const doctorRouter = require("./routes/api/doctorApi");
const patientRouter = require("./routes/api/patientApi");
const respondantRouter = require("./routes/api/respondant");
const orderRouter = require("./routes/api/orderApi");
const paymentRouter = require("./routes/api/stripe");

const dotenv = require("dotenv");

var app = express();

app.use(cors({ origin: true, credentials: true }));
dotenv.config();
// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use("/api/checkout/webhook", express.raw({ type: "*/*" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/admin", adminRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/doctor", doctorRouter);
app.use("/api/respondant", respondantRouter);
app.use("/api/patient", patientRouter);
app.use("/api/order", orderRouter);
app.use("/api/checkout", paymentRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

mongoose.connect(process.env.DB_Connect, () => {
  console.log("Connected");
});

module.exports = app;
