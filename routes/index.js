var express = require('express');
const req = require('express/lib/request');
var router = express.Router();
const stripe = require('stripe')('sk_test_51KjgUzD5tz1gBs2njvjiuYy06W58EnELFa8FoWduzXAj9NyoOb9Xx400DwpB9g3TrWIfsRz1TE3lm3bgwzTYhfRo0025zGmMma')

var dataBike = [
  {name:"BIK045", url:"/images/bike-1.jpg", price:679},
  {name:"ZOOK07", url:"/images/bike-2.jpg", price:999},
  {name:"TITANS", url:"/images/bike-3.jpg", price:799},
  {name:"CEWO", url:"/images/bike-4.jpg", price:1300},
  {name:"AMIG039", url:"/images/bike-5.jpg", price:479},
  {name:"LIK099", url:"/images/bike-6.jpg", price:869},
]

// var dataCardBike = [];

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.session.dataCardBike);

  res.render('index', {dataBike:dataBike});
});


router.get('/shop', function(req, res, next) {

  if (!req.session.dataCardBike) {
    req.session.dataCardBike = []
   }; 

   let isExist = false;

   for (var i = 0; i < req.session.dataCardBike.length; i++){
    if (req.session.dataCardBike[i].name === req.query.name) { 
     req.session.dataCardBike[i].quantity++
     isExist = true
    }
   }

   if (!isExist){
    req.session.dataCardBike.push({ name: req.query.name, url: req.query.url, price: parseInt(req.query.price), quantity: '1'});
   }
  
  console.log(req.session.dataCardBike);
  res.render('shop', {dataCardBike:req.session.dataCardBike});
});

router.get('/delete-shop', function(req, res, next) {
  req.session.dataCardBike.splice(req.query.id,1);
  console.log(req.query.id);

  res.render('shop', {dataCardBike:req.session.dataCardBike});
});

router.post('/update-shop', function(req, res, next) {
  console.log(req.body);
  req.session.dataCardBike[req.body.position].quantity = req.body.quantity
  res.render('shop', {dataCardBike:req.session.dataCardBike});
});

router.get('/success', function(req, res, next) {
  
  res.render('success');

});
router.get('/cancel', function(req, res, next) {
  
  res.render('cancel');
});



router.post('/create-checkout-session', async (req, res) => {
  var line_items = [];

  
  for (var i = 0; i < req.session.dataCardBike.length; i++){
    line_items.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: req.session.dataCardBike[i].name,
        },
        unit_amount: req.session.dataCardBike[i].price*100,
      },
      quantity: req.session.dataCardBike[i].quantity,
    });} 

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: 'https://bike-shop-fr.herokuapp.com/success',
    cancel_url: 'https://bike-shop-fr.herokuapp.com/cancel',
  });
 
  res.redirect(303, session.url);
 });


module.exports = router;
