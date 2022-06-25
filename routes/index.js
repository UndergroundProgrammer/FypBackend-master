var express = require("express");
var router = express.Router();
const axios = require("axios");

router.get("/success/:id", async function (req, res, next) {
  // let response = await axios.get(
  //   "https://ar-medicare-backend.herokuapp.com/api/products/cart/remove/user/" +
  //     req.params.id
  // );
  let cart = [];
  if (req.cookies.cart) cart = req.cookies.cart;
  console.log(cart);
  let filterCart = await cart.filter((item) => {
    console.log("item ermoved");
    return item.userId != req.params.id;
  });
  console.log(filterCart);
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
