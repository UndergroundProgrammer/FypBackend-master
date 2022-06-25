var express = require("express");
var router = express.Router();
const axios = require("axios");

router.get("/success/:id", async function (req, res, next) {
  let response = await axios.get(
    "https://ar-medicare-backend.herokuapp.com/api/products/cart/remove/user/" +
      req.params.id
  );
  console.log(response);
  res.render("index", { title: "Congratulations! Payment Success" });
});

router.get("/cancel", function (req, res, next) {
  res.render("index", { title: "Payment is Canceled!!!!" });
});

module.exports = router;
