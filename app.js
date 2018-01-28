const express = require ('express');
const path = require ('path');
const bodyParser = require('body-parser');
const app = express();
const expressValidator=require('express-validator');
const flash = require('connect-flash');
const session= require('express-session');
const passport=require('passport');
const config=require('./config/database');



let Student = require('./models/students');
const mongoose = require('mongoose');

mongoose.connect(config.database);

let db = mongoose.connection;
db.once('open', function (){
  console.log('Connected to MongoDB');
});

db.on('error', function(err){
  console.log(err);
});


app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug' );


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


//passport config

require('./config/passport')(passport);
//passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req, res, next){
  res.locals.user=req.user || null;
  next();
});

// home page route
app.get('/', function (req, res){
  res.render('index');
});




let articles =require('./routes/articles');
app.use('/articles', articles);

let students =require('./routes/students');
app.use('/students', students);

let reports =require('./routes/reports');
app.use('/reports', reports);


let users =require('./routes/users');
app.use('/users', users);

app.listen(3013, function (){
  console.log('Server started on port 3013...');
});
