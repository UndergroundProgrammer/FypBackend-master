const express = require("express");
const router = require("express").Router();
const stripe = require("stripe")(
  "sk_test_51KuvSGJ5s3GMFY7xzIibr4HHaFgEAiugF9pNWKZA7nrt2rdSemuLfgooccBNZ6PySxnnhkEEfUt5kCruaM6RtD9i00b31o46cp"
);

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
  express.raw({ type: "application/json" }),
  (request, response) => {
    const sig = request.headers["stripe-signature"];
    const endpointSecret = "whsec_9boLhlLo6qUfpweygBFIXGbghpxuFEqW";
    console.log("webhook called");
    let event;

    try {
      event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
      response.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.async_payment_failed":
        const session1 = event.data.object;
        console.log("payment failed");
        console.log(session1);
        // Then define and call a function to handle the event checkout.session.async_payment_failed
        break;
      case "checkout.session.async_payment_succeeded":
        const session = event.data.object;
        console.log("payment succeed");
        console.log(session);

        // Then define and call a function to handle the event checkout.session.async_payment_succeeded
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
