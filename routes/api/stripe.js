const express = require("express");
const router = require("express").Router();
const bodyParser = require("body-parser");
const stripe = require("stripe")(
  "sk_test_51KuvSGJ5s3GMFY7xzIibr4HHaFgEAiugF9pNWKZA7nrt2rdSemuLfgooccBNZ6PySxnnhkEEfUt5kCruaM6RtD9i00b31o46cp"
);
const endpointSecret = "whsec_kCLrcl7FJDOAeolDegmfdbFXMsJ80X8v";

router.post("/create-checkout", async (req, res) => {
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
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (request, response) => {
    const sig = request.headers["stripe-signature"];
    const payLoad = request.body;
    console.log("webhook called");
    console.log(sig);

    console.log(endpointSecret);

    console.log(payLoad);

    let event;
    try {
      event = await stripe.webhooks.constructEvent(
        payLoad,
        sig,
        endpointSecret
      );
      console.log(event);
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
        const paymentIntent = event.data.object;
        console.log("payment successfully");
        console.log(paymentIntent);
        // Then define and call a function to handle the event payment_intent.succeeded
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    response.send();
  }
);

module.exports = router;
