var express = require("express");
var router = express.Router();
const axios = require("axios");

router.get("/success/:id", async function (req, res, next) {
  let cart = [];
  if (req.cookies.cart) cart = req.cookies.cart;

  let filterCart = await cart.filter((item) => {
    return item.userId != req.params.id;
  });
  await res.cookie("cart", filterCart, {
    sameSite: "None",
    secure: true,
    httpOnly: true,
  });
  res.render("index", { title: "Congratulations! Payment Success" });
});

router.get("/cancel", function (req, res, next) {
  res.render("index", { title: "Payment is Canceled!!!!" });
});

module.exports = router;
