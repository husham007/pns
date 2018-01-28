const express= require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

let User=require('../models/user');

//register form
router.get('/register', function(req,res){
  res.render('register');
});

//Registration process
router.post('/register', function(req,res){

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is in wrong format').isEmail();
  req.checkBody('address', 'Address is required').notEmpty();
  req.checkBody('username', 'Username is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Confirm password is required').equals(req.body.password);
  req.checkBody('phoneno', 'Enter valid Phone').isMobilePhone('fi-FI');


let errors = req.validationErrors();

if(errors){
  res.render('register', {
    errors:errors
  });
} else{
    const name=req.body.name;
    const email=req.body.email;
    const address=req.body.address;
    const username=req.body.username;
    const phoneno=req.body.phoneno;
    const password=req.body.password;
    const password2=req.body.password2;

    let newUser=new User({
      name:name,
      email:email,
      address:address,
      username:username,
      phoneno:phoneno,
      password:password
  });

//  password hash and saving the user
  bcrypt.genSalt(10, function(err,salt){
    bcrypt.hash(newUser.password, salt, function(err,hash){
      if(err){
        console.log(err);
      }
      newUser.password=hash;
      newUser.save(function(err){
        if (err){
          console.log(err);
          return;
        }else{
          req.flash('success', 'You are now registered and now can login');
          res.redirect('/users/login');
        }
      });
    });
  });
}
})

//login form
router.get('/login', function(req,res){
  res.render('login');
})

//login process
router.post('/login', function(req, res, next){
  passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/users/login',
    failureFlash:true
  })(req,res,next);
});

//logout process
router.get('/logout', function(req, res){
  req.logout();
  req.flash('success', 'You are logged out');
  res.redirect('/users/login');

})
module.exports=router;
