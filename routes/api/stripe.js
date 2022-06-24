const express = require("express");
const router = require("express").Router();
const bodyParser = require("body-parser");
const Product = require("../../models/Product");
const res = require("express/lib/response");
const { redirect } = require("express/lib/response");
const stripe = require("stripe")(
  "sk_test_51KuvSGJ5s3GMFY7xzIibr4HHaFgEAiugF9pNWKZA7nrt2rdSemuLfgooccBNZ6PySxnnhkEEfUt5kCruaM6RtD9i00b31o46cp"
);
const endpointSecret = "whsec_kCLrcl7FJDOAeolDegmfdbFXMsJ80X8v";
var orderedItems = [];
router.post("/create-checkout", async (req, res) => {
  orderedItems = req.body;
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: req.body.map((item) => {
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
          },
          unit_amount: item.price,
        },
        quantity: item.orderQuantity,
      };
    }),

    mode: "payment",
    success_url: `${process.env.SERVER_URL}success`,
    cancel_url: `${process.env.SERVER_URL}cancel`,
  });
  res.status(200).send(session);
});

router.post("/payment", (req, res) => {
  stripe.charges.create(
    {
      source: req.body.tokenId,
      amount: req.body.amount,
      currency: "usd",
    },
    (stripeErr, stripeRes) => {
      if (stripeErr) {
        res.status(500).json(stripeErr);
      } else {
        res.status(200).json(stripeRes);
      }
    }
  );
});

router.post("/webhook", async (request, response) => {
  const sig = request.headers["stripe-signature"];
  const payLoad = request.body;

  let event;
  try {
    event = await stripe.webhooks.constructEvent(payLoad, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    console.log("webhook failed");
    return;
  }
  // Handle the event
  switch (event.type) {
    case "payment_intent.payment_failed":
      const paymentIntent1 = event.data.object;
      // Then define and call a function to handle the event payment_intent.payment_failed
      break;
    case "payment_intent.succeeded":
      orderedItems.map(async (item) => {
        let product = await Product.findById(item._id);
        product.quantity = product.quantity - item.orderQuantity;
        await product.save();
      });

      // Then define and call a function to handle the event payment_intent.succeeded
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }
  response.clearCookie("cart");
  response.status(200);
  // Return a 200 response to acknowledge receipt of the event
});

module.exports = router;
