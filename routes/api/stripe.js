const router = require('express').Router();
const stripe =  require('stripe')("sk_test_51KuvSGJ5s3GMFY7xzIibr4HHaFgEAiugF9pNWKZA7nrt2rdSemuLfgooccBNZ6PySxnnhkEEfUt5kCruaM6RtD9i00b31o46cp");

router.post('/create-checkout',async (req, res)=>{
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: req.body.map( (item)=>{
            return{ 
                price_data:{
                    currency: 'usd',
                    product_data:{
                        name:item.title,
                        
                    },
                    unit_amount: item.price
                },
                quantity:item.quantity  
            }
      }) ,
      mode:"payment",
    success_url:`${process.env.SERVER_URL}/payment/success`,
    cancel_url:`${process.env.SERVER_URL}/payment/cancel`,
  });
  res.status(200).send(session);
});

router.post("/payment", (req, res) => {

    stripe.charges.create({ 
        source:req.body.tokenId, 
        amount:req.body.amount, 
        currency:"usd",
    },
    (stripeErr,stripeRes)=>{
        if(stripeErr){
            res.status(500).json(stripeErr);
        }else{
            res.status(200).json(stripeRes);
        }
    })
});

module.exports = router;