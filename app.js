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
const chatRouter = require("./routes/api/ChatApi");
var debug = require("debug")("fypbackend:server");
const User = require("./models/User");
var http = require("http");
const { Server } = require("socket.io");
var app = express();
app.use(cors({ origin: true, credentials: true }));

var server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  socket.on("send_message", async (data) => {
    console.log("sending....");
    socket.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected", socket.id);
  });
});

var port = "3000";
/**
 * Create HTTP server.
 */

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(process.env.PORT || 3000);
server.on("error", onError);
server.on("listening", onListening);

const dotenv = require("dotenv");

dotenv.config();
// view engine setup
// app.set("views", path.join(__dirname, "views"));
// app.set("view engine", "jade");
app.get("/", (req, res) => {
  res.send("server is running");
});

app.use(logger("dev"));
app.use("/api/checkout/webhook", express.raw({ type: "*/*" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
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
app.use("/api/chat", chatRouter);

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
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  debug("Listening on " + bind);
}
module.exports = app;
