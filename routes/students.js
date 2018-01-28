const express= require('express');
const router = express.Router();

// Student model db
let Student=require('../models/students');

//User model
let User=require('../models/user');

//Add student route
router.get('/add', ensureAuthenticated, function(req, res){
  res.render('add_student', {
    title:'add students'
  });
});

// view students route
router.get('/view', ensureAuthenticated, function(req, res){
  Student.find({author:req.user._id}, function(err, students){
    if (err){
      console.log(err);
    }else
    {
      res.render('students', {
      students:students
  });
}});
});

//get single student by id
router.get('/:id', function(req, res){
  Student.findById(req.params.id, function(err, student){
    User.findById(student.author, function(err, user){
      res.render('student', {
        student:student,
        author:user.name
      });
    })

  });
});

//access control
function ensureAuthenticated(req,res,next){
  if (req.isAuthenticated()){
    return next();
  }else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

// edit student with id
router.get('/edit/:id', ensureAuthenticated, function(req, res){
  Student.findById(req.params.id, function(err, student){
    if (student.author!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    res.render('edit_student', {
      title:'Edit Student',
      student:student
    });
  });
});

// post route for adding a student
router.post('/add', function(req, res){

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('rollno', 'Roll Number is required').notEmpty();
  req.checkBody('rollno', 'Roll Number should be number').isNumeric();
  req.checkBody('address', 'Address is required').notEmpty();
  req.checkBody('class', 'Class is required').notEmpty();
  req.checkBody('parentname', 'Parent Name is required').notEmpty();
  req.checkBody('phoneno', 'Phone Number is required').notEmpty();
  req.checkBody('dob', 'Date of birth is required').notEmpty();
  req.checkBody('phoneno', 'Enter valid Phone').isMobilePhone("fi-FI");
  //req.checkBody('author', 'Author is required').notEmpty();


  let errors = req.validationErrors();
  if(errors){
    res.render('add_student', {
        title:'add students',
      errors:errors
    });
  }
  else{
    let student =new Student();
    student.name=req.body.name;
    student.rollno=req.body.rollno;
    student.address=req.body.address;
    student.parentname=req.body.parentname;
    student.phoneno=req.body.phoneno;
    student.dob=req.body.dob;
    student.class=req.body.class;
    student.author=req.user._id;


    student.save(function(err){
      if (err){
        console.log(err);
        return;
      }else{
        req.flash('success', 'Student Added');
        res.redirect('/');
      }
    });
  }
});

//post route for edit student
router.post('/edit/:id', function(req, res){
  let student ={};
  student.name=req.body.name;
  student.rollno=req.body.rollno;
  student.address=req.body.address;
  student.parentname=req.body.parentname;
  student.phoneno=req.body.phoneno;
  student.dob=req.body.dob;
  student.class=req.body.class;
  student.author=req.user._id;

  let query = {_id:req.params.id}
  Student.update(query, student, function(err){
    if (err){
      console.log(err);
      return;
    }else{
      req.flash('success', 'Student updated');
      res.redirect('/');
    }
  });
});

//deteteing a student with id
router.delete('/:id', function(req, res){
if (!req.user._id){
  res.status(500).send();
}
  let query={_id:req.params.id};

  Student.findById(req.params.id, function(err, student){
    console.log(student);
    if (student.author!=req.user._id){
      res.status(500).send();
    }else{
      Student.remove(query, function(err){
        if(err){
          console.log(err);
        }
        res.send('Success');
      });
    }
  })
});

module.exports=router;
