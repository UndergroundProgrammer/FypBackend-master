var express = require("express");
var router = express.Router();

router.get("/success", function (req, res, next) {
  res.clearCookie("cart");
  res.render("index", { title: "Congradulations! Payment Success" });
  res.redirect("https://ar-medicare.vercel.app/");
});

router.get("/cancel", function (req, res, next) {
  res.render("index", { title: "Payment is Canceled!!!!" });
});

module.exports = router;
