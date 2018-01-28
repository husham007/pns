const express= require('express');
const router = express.Router();

//  including models for db operations
let Student=require('../models/students');
let AttendenceReport=require('../models/attendencereports');
let AssignmentReport=require('../models/assignmentreports');
let TestReport=require('../models/testreports');
let CircularReport=require('../models/circularreports');
let OtherReport=require('../models/otherreports');
let User=require('../models/user')

// sms Rest API initialization
const Nexmo = require('nexmo');
const nexmo = new Nexmo({
  apiKey: '5d4b75e8',
  apiSecret: '51ce1f761d59363f'
});

// Creating attendence route
router.get('/createAttendence', ensureAuthenticated, function(req, res){
  let query = {author:req.user._id}
  Student.find(query, function(err, students){
    if (err){
      console.log(err);
      return;
    }else{
      res.render('createAttendence', {
        title:'Create Attendence Report',
        students:students
      });
    }});
});

// create attendence post request
router.post('/createAttendence', ensureAuthenticated, function(req, res){
  req.checkBody('status', 'Status is required').notEmpty();
  req.checkBody('remarks', 'Remarks is required').notEmpty();

  let errors = req.validationErrors();
  if(errors){
    let query = {author:req.user._id};
    Student.find(query, function(err, students){
      if (err){
        console.log(err);
        return;
      }else{
        res.render('createAttendence', {
          title:'Create Attendence Report',
          errors:errors,
          students:students
        });
      }});
    }
  else{
    Student.findById(req.body.student, function(err, s){
      if (err){
        console.log(err);
        return;
      }else{
        let report =new AttendenceReport();
        let t = 'Name ='+ s.name + ' Roll Number = '+s.rollno+' Class = '+s.class;
        report.date=new Date();
        report.status=req.body.status;
        report.remarks=req.body.remarks;
        report.institution=req.user._id;
        report.student=req.body.student;
        report.tag = t;

        report.save(function(err){
          if (err){
            console.log(err);
            return;
          }else{
            req.flash('success', 'Attendence Report Created');
            res.redirect('/');
          }});
      }});
  }});

// send attendence
router.get('/sendAttendence', ensureAuthenticated, function(req, res){
  let query = {institution:req.user._id}
  AttendenceReport.find(query, function(err, reports){
    if (err){
    console.log(err);
  }else{
    res.render('attendencereports', {
    title:'Attendence Reports',
    reports:reports
    //students: students
    });
  }});
});

//get single report by id
router.get('/attendencereports/:id', function(req, res){
  AttendenceReport.findById(req.params.id, function(err, report){
    Student.findById(report.student, function(err, st){
      res.render('attendencereport', {
        report:report,
        student:st
      });
    });
  });
});

//edit single report by id
  router.get('/editattendence/:id', ensureAuthenticated, function(req, res){
    //console.log('hello');
    AttendenceReport.findById(req.params.id, function(err, report){
      if (report.institution!= req.user._id){
        req.flash('danger', 'Not Authorized');
        res.redirect('/');
      }
      //console.log(report.remarks);
      res.render('editAttendenceReport', {
        title:'Edit Report',
        report:report
      });
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

//edit attendence by id post request
router.post('/editattendence/:id', ensureAuthenticated, function(req, res){
  let report ={};
  report.status=req.body.status;
  report.remarks=req.body.remarks;
  let query = {_id:req.params.id};
  AttendenceReport.update(query, report, function(err){
    if (err){
      console.log(err);
      return;
    }else{
      req.flash('success', 'Report updated');
      res.redirect('/');
    }
  });
});

//delete attendence report by id
router.get('/deleteattendence/:id', function(req, res){
if (!req.user._id){
  res.status(500).send();
}
  let query={_id:req.params.id};

  AttendenceReport.findById(req.params.id, function(err, report){
    //console.log(report);
    if (report.institution!=req.user._id){
      res.status(500).send();
    }else{
      AttendenceReport.remove(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash('success', 'Report Deleted');
        res.redirect('/');
      });
    }
  });
});

// send attendence by id
router.get('/sendattendence/:id', ensureAuthenticated, function(req, res){
  let report ={};
  let query = {_id:req.params.id};

  AttendenceReport.findById(req.params.id, function(err, report){
    if (report.institution!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }else{
      Student.findById(report.student, function(error, student){
      sms = 'The student '+report.tag+' was '+report.status+' on date '+report.date+ '. Remarks = '+report.remarks;
      nexmo.message.sendSms(358405394899, student.phoneno, sms, (err, responseData) => {
        if (err) {
          console.log(err);
          req.flash('danger', 'SMS not sent');
          res.redirect('/');
          } else {
            console.dir(responseData);
            report.sentdate = new Date();
            AttendenceReport.update(query, report, function(err){
              if (err){
                console.log(err);
                return;
              }else{
                req.flash('success', 'SMS sent');
                res.redirect('/');
              }});
            }});
          });
      }});
    });

// create assingment report
router.get('/createAssignment', ensureAuthenticated, function(req, res){
  res.render('createAssignment', {
    title:'Create Assignment Report',
    });
});

// create assignment post request
router.post('/createAssignment', function(req, res){

  req.checkBody('startdate', 'Start Date is required').notEmpty();
  req.checkBody('enddate', 'End Date is required').notEmpty();
  req.checkBody('startdate', 'Invalid start date').optional({ checkFalsy: true }).isDate();
  req.checkBody('enddate', 'Invalid end date').optional({ checkFalsy: true }).isDate();
  req.checkBody('class', 'Class is required').notEmpty();
  req.checkBody('subject', 'Subject is required').notEmpty();
  req.checkBody('assignment', 'Assignment Descrption is required').notEmpty();

  let errors = req.validationErrors();
    if(errors){
      res.render('createAssignment', {
          title:'Create assignment',
          errors:errors
        });
      }else{
        let query = {author:req.user._id, class:req.body.class};
        Student.find(query, function(err, students){
          if (err){
            console.log(err);
            return;
          }else{
            let report =new AssignmentReport();
            report.startdate=req.body.startdate;
            report.enddate=req.body.enddate;
            report.class=req.body.class;
            report.subject=req.body.subject;
            report.institution=req.user._id;
            report.students=students;
            report.assignment = req.body.assignment;

            report.save(function(err){
              if (err){
                console.log(err);
                return;
              }else{
                req.flash('success', 'Report Created');
                res.redirect('/');
              }
            });
          }});
        }});

//send assingment
router.get('/sendAssignment', ensureAuthenticated, function(req, res){

  let query = {institution:req.user._id};
  AssignmentReport.find(query, function(err, reports){
      if (err){
      console.log(err);
    }else{
      res.render('assignmentreports', {
      title:'Assignment Reports',
      reports:reports
    });
  }});
});

//view assignment report by id
router.get('/assignmentreports/:id', function(req, res){
  AssignmentReport.findById(req.params.id, function(err, report){
    res.render('assignmentreport', {
    assignment:report
    });
  });
});

//edit assingment by id
router.get('/editassignment/:id', ensureAuthenticated, function(req, res){
  //console.log('hello');
  AssignmentReport.findById(req.params.id, function(err, report){
    if (report.institution!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    //console.log(report.remarks);
    res.render('editAssignmentReport', {
      title:'Edit Report',
      report:report
    });
  });
});

// edit assignment by id
router.post('/editassignment/:id', ensureAuthenticated, function(req, res){

  req.checkBody('startdate', 'Invalid start date').optional({ checkFalsy: true }).isDate();
  req.checkBody('enddate', 'Invalid end date').optional({ checkFalsy: true }).isDate();
  req.checkBody('class', 'Class is required').notEmpty();
  req.checkBody('subject', 'Subject is required').notEmpty();
  req.checkBody('assignment', 'Assignment Description is required').notEmpty();

  let errors = req.validationErrors();
  if(errors){
    AssignmentReport.findById(req.params.id, function (err, repor){
      if (err){
        console.log(err);
        return;
      }else{
        res.render('editAssignmentReport', {
            title:'Create assignment',
          errors:errors,
          report:repor
        });
      }});
    }
    else{
      let query = {author:req.user._id, class:req.body.class};
      Student.find(query, function(err, students){
        if (err){
          console.log(err);
          return;
        }else{
          let report ={};
          report.class=req.body.class;
          report.subject=req.body.subject;
          report.startdate=req.body.startdate;
          report.enddate=req.body.enddate;
          report.assignment=req.body.assignment;
          report.students=students;

          let query2 = {_id:req.params.id}
          AssignmentReport.update(query2, report, function(err){
            if (err){
              console.log(err);
              return;
            }else{
              req.flash('success', 'Report updated');
              res.redirect('/');
            }});
        }});
      }});

// delete assignment
router.get('/deleteassignment/:id', function(req, res){
if (!req.user._id){
  res.status(500).send();
}
  let query={_id:req.params.id};

  AssignmentReport.findById(req.params.id, function(err, report){
    console.log(report);
    if (report.institution!=req.user._id){
      res.status(500).send();
    }else{
      AssignmentReport.remove(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash('success', 'Report Deleted');
        res.redirect('/');
      });
    }
  })
});

//sending sms by id
router.get('/sendassignment/:id', ensureAuthenticated, function(req, res){
  //let report ={};
  let query = {_id:req.params.id};

  AssignmentReport.findById(req.params.id, function(err, report){
    if (report.institution!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    else{
      for (let i =0; i<report.students.length; i++){
          Student.findById(report.students[i], function(error, student){
            sms = 'The assignment is issued to student '+student.name+'of subject '+report.subject+'. Deadline is '+report.enddate;
            nexmo.message.sendSms(358405394899, student.phoneno, sms, (err, responseData) => {
              if (err) {
                console.log(err);
                req.flash('danger', 'SMS not sent');
                res.redirect('/');
                return;
              } else {
              //console.dir(responseData);
                report.sentdate = new Date();
                AssignmentReport.update(query, report, function(err){
                  if (err){
                    req.flash('danger', 'SMS not sent');
                    res.redirect('/');
                    return;
                  }
                });
              }});
            });
        }
          req.flash('success', 'SMS sent');
          res.redirect('/');
    }});
  });

//create test
router.get('/createTest', ensureAuthenticated, function(req, res){
  let query = {author:req.user._id}
  Student.find(query, function(err, students){
    if (err){
      console.log(err);
      return;
    }else{
      res.render('createTest', {
        title:'Create Test Report',
        students:students
      });
    }});
});

//post request create test
router.post('/createTest', function(req, res){

  req.checkBody('subject', 'Subject is required').notEmpty();
  req.checkBody('testdate', 'Test Date is required').notEmpty();
  req.checkBody('testdate', 'Invalid test date').optional({ checkFalsy: true }).isDate();
  req.checkBody('totalmarks', 'Total Marks is required').notEmpty();
  req.checkBody('obtainedmarks', 'Obtained marks is required').notEmpty();
  req.checkBody('remarks', 'Remarks is required').notEmpty();

  let errors = req.validationErrors();
  if(errors){
    let query = {author:req.user._id};
    Student.find(query, function(err, students){
    res.render('createTest', {
        title:'Create Test',
        students:students,
      errors:errors
    });
  });
}else{
    Student.findById(req.body.student, function(err, s){
      let report =new TestReport();
      let t = 'Name ='+ s.name + ' Roll Number = '+s.rollno+' Class = '+s.class;
      report.testdate=req.body.testdate;
      report.subject=req.body.subject;
      report.totalmarks=req.body.totalmarks;
      report.obtainedmarks=req.body.obtainedmarks;
      report.remarks=req.body.remarks;
      report.institution=req.user._id;
      report.student=req.body.student;
      report.tag = t;
    //  console.log(report.testdate);
      report.save(function(err){
        if (err){
          console.log(err);
          return;
        }else{
          req.flash('success', 'Report Created');
          res.redirect('/');
        }
      });
  });
}});

router.get('/sendTest', ensureAuthenticated, function(req, res){
  let query = {institution:req.user._id}
  TestReport.find(query, function(err, reports){
      if (err){
      console.log(err);
    }
    else{
      res.render('testreports', {
      title:'Test Reports',
      reports:reports
        //students: students
      });
    }});
  });

  //get single test report by id
router.get('/testreports/:id', function(req, res){
  TestReport.findById(req.params.id, function(err, report){
    Student.findById(report.student, function(err, st){
      res.render('testreport', {
        report:report,
        student:st
      });
    });
  });
});

// edit test report by id
router.get('/edittest/:id', ensureAuthenticated, function(req, res){
  //console.log('hello');
  TestReport.findById(req.params.id, function(err, report){
    if (report.institution!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }else{
      res.render('editTestReport', {
        title:'Edit Report',
        report:report
      });
    }});
});

router.post('/edittest/:id', ensureAuthenticated, function(req, res){
  let report ={};
  report.subject=req.body.subject;
  report.testdate=req.body.testdate;
  report.totalmarks=req.body.totalmarks;
  report.obtainedmarks=req.body.obtainedmarks;
  report.remarks=req.body.remarks;

  let query = {_id:req.params.id}
  TestReport.update(query, report, function(err){
    if (err){
      console.log(err);
      return;
    }else{
      req.flash('success', 'Report updated');
      res.redirect('/');
    }});
});

router.get('/deletetest/:id', function(req, res){
  if (!req.user._id){
    res.status(500).send();
  }
  let query={_id:req.params.id};
  TestReport.findById(req.params.id, function(err, report){
    console.log(report);
    if (report.institution!=req.user._id){
      res.status(500).send();
    }else{
      TestReport.remove(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash('success', 'Report Deleted');
        res.redirect('/');
      });
    }});
});

// send test report
router.get('/sendtest/:id', ensureAuthenticated, function(req, res){
  let report ={};
  let query = {_id:req.params.id};

  TestReport.findById(req.params.id, function(err, report){
    if (report.institution!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    else{
      Student.findById(report.student, function(error, student){
        sms = 'Test Report for '+student.name+' on date '+report.testdate+ '. Marks = '+report.obtainedmarks+'/'+report.totalmarks;
        nexmo.message.sendSms(358405394899, student.phoneno, sms, (err, responseData) => {
          if (err) {
            console.log(err);
            req.flash('danger', 'SMS not sent');
            res.redirect('/');
          } else {
            console.dir(responseData);
            report.sentdate = new Date();
            TestReport.update(query, report, function(err){
              if (err){
                console.log(err);
                return;
              }else{
                req.flash('success', 'SMS sent');
                res.redirect('/');
              }});
            }});
          });
        }});
      });

//create circular report
router.get('/createCircular', ensureAuthenticated, function(req, res){
  res.render('createCircular', {
    title:'Create Circular Report',
  });
});

// create circular report post
router.post('/createCircular', function(req, res){

  req.checkBody('date', 'Invalid date').optional({ checkFalsy: true }).isDate();
  req.checkBody('date', 'Date is required').notEmpty();
  req.checkBody('remarks', 'Remarks is required').notEmpty();
  req.checkBody('matter', 'Matter is required').notEmpty();

  let errors = req.validationErrors();
  if(errors){
        res.render('createCircular', {
        title:'Create Circular',
      errors:errors
    });
  }
  else {
    let report =new CircularReport();

    report.date=req.body.date;
    report.matter=req.body.matter;
    report.remarks=req.body.remarks;
    report.institution=req.user._id;

  //  console.log(report.testdate);
    report.save(function(err){
      if (err){
        console.log(err);
        return;
      }else{
        req.flash('success', 'Report Created');
        res.redirect('/');
      }
    });
}});

// send circular
router.get('/sendCircular', ensureAuthenticated, function(req, res){
  let query = {institution:req.user._id}
  CircularReport.find(query, function(err, reports){
      if (err){
      console.log(err);
    }
    else{
      res.render('circularreports', {
      title:'Circular Reports',
      reports:reports
      //students: students
      });
    }});
  });

  //get single report
router.get('/circularreports/:id', function(req, res){
  CircularReport.findById(req.params.id, function(err, report){
    res.render('circularreport', {
    report:report
    });
  });
});

// edit circular report
router.get('/editcircular/:id', ensureAuthenticated, function(req, res){
  //console.log('hello');
  CircularReport.findById(req.params.id, function(err, report){
    if (report.institution!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    //console.log(report.remarks);
    res.render('editCircularReport', {
      title:'Edit Report',
      report:report
    });
  });
});

// Edit circular report by id
router.post('/editcircular/:id', ensureAuthenticated, function(req, res){

  let report ={};
  report.matter=req.body.matter;
  report.date=req.body.date;
  report.remarks=req.body.remarks;

  let query = {_id:req.params.id};

  CircularReport.update(query, report, function(err){
    if (err){
      console.log(err);
      return;
    }else{
      req.flash('success', 'Report updated');
      res.redirect('/');
    }
  });
});

router.get('/deletecircular/:id', function(req, res){
if (!req.user._id){
  res.status(500).send();
}
  let query={_id:req.params.id};
  CircularReport.findById(req.params.id, function(err, report){
    console.log(report);
    if (report.institution!=req.user._id){
      res.status(500).send();
    }else{
      CircularReport.remove(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash('success', 'Report Deleted');
        res.redirect('/');
      });
  }});
});

// send circular report sms by id
router.get('/sendcircular/:id', ensureAuthenticated, function(req, res){
//let report ={};
  let query = {_id:req.params.id};

  CircularReport.findById(req.params.id, function(err, report){
    if (report.institution!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    else{
      Student.find({author:report.institution}, function (er, students){
        for (let i =0; i<students.length; i++){
          sms = 'Circular Report dated: '+report.date+' of matter '+report.matter+'. Message '+report.remarks;
          nexmo.message.sendSms(358405394899, students[i].phoneno, sms, (err, responseData) => {
            if (err) {
              console.log(err);
              req.flash('danger', 'SMS not sent');
              res.redirect('/');
            } else {
              //console.dir(responseData);
              report.sentdate = new Date();
              CircularReport.update(query, report, function(err){
                if (err){
                  req.flash('danger', 'SMS not sent');
                  res.redirect('/');
                  return;
                }
              });
            }});
          }
        req.flash('success', 'SMS sent');
        res.redirect('/');
      });
  }})});

// create other report
router.get('/createOther', ensureAuthenticated, function(req, res){
  let query = {author:req.user._id}
  Student.find(query, function(err, students){
    if (err){
      console.log(err);
      return;
    }else{
      res.render('createOther', {
        title:'Create Other Report',
        students:students
      });
    }});
});

//create other report
router.post('/createOther', function(req, res){

  //req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('date', 'Date is required').notEmpty();
  req.checkBody('date', 'Invalid date').optional({ checkFalsy: true }).isDate();
  //req.checkBody('class', 'Class is required').notEmpty();
  req.checkBody('remarks', 'Remarks is required').notEmpty();

  let errors = req.validationErrors();
  if(errors){
    Student.find({author:req.user._id}, function(err, students){
      if (err){
        console.log(err);
        return;
      }else{
        res.render('createOther', {
          title:'Create Other Report',
          students:students,
          errors:errors
        });
      }});
    }else{
      Student.findById(req.body.student, function(err, s){
        let report =new OtherReport();
        let t = 'Name ='+ s.name + ' Roll Number = '+s.rollno+' Class = '+s.class;
        report.date=req.body.date;
        report.remarks=req.body.remarks;
        report.institution=req.user._id;
        report.student=req.body.student;
        report.tag = t;

        report.save(function(err){
          if (err){
            console.log(err);
            return;
          }else{
            req.flash('success', 'Report Created');
            res.redirect('/');
          }});
        });
  }});

// create send other report
router.get('/sendOther', ensureAuthenticated, function(req, res){
  let query = {institution:req.user._id}
  OtherReport.find(query, function(err, reports){
      if (err){
      console.log(err);
    }
    else{
      res.render('otherreports', {
      title:'Other Reports',
      reports:reports
        //students: students
      });
    }});
  });


//get other report by id
router.get('/otherreports/:id', function(req, res){
  OtherReport.findById(req.params.id, function(err, report){
    Student.findById(report.student, function(err, st){
      res.render('otherreport', {
        report:report,
        student:st
      });
    });
  });
});

// edit other report by id
router.get('/editother/:id', ensureAuthenticated, function(req, res){
  //console.log('hello');
  OtherReport.findById(req.params.id, function(err, report){
    if (report.institution!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    //console.log(report.remarks);
    res.render('editOtherReport', {
      title:'Edit Report',
      report:report
    });
  });
});

// edit other report by id
router.post('/editother/:id', ensureAuthenticated, function(req, res){
  let report ={};
  report.date=req.body.date;
  report.remarks=req.body.remarks;
  let query = {_id:req.params.id};
  OtherReport.update(query, report, function(err){
    if (err){
      console.log(err);
      return;
    }else{
      req.flash('success', 'Report updated');
      res.redirect('/');
    }
  });
});

//delete other report
router.get('/deleteother/:id', function(req, res){
if (!req.user._id){
  res.status(500).send();
}
  let query={_id:req.params.id};

  OtherReport.findById(req.params.id, function(err, report){
    //console.log(report);

    if (report.institution!=req.user._id){
      res.status(500).send();
    }else{
      OtherReport.remove(query, function(err){
        if(err){
          console.log(err);
        }
        req.flash('success', 'Report Deleted');
        res.redirect('/');
      });
    }});
});

// send other report
router.get('/sendother/:id', ensureAuthenticated, function(req, res){
  let report ={};
  let query = {_id:req.params.id};

  OtherReport.findById(req.params.id, function(err, report){
    if (report.institution!= req.user._id){
      req.flash('danger', 'Not Authorized');
      res.redirect('/');
    }
    else{
          Student.findById(report.student, function(error, student){
          sms = 'The student '+report.tag+' , report is '+report.remarks;
          nexmo.message.sendSms(358405394899, student.phoneno, sms, (err, responseData) => {
            if (err) {
              console.log(err);
              req.flash('danger', 'SMS not sent');
              res.redirect('/');
            } else {
              //console.dir(responseData);
              report.sentdate = new Date();
              OtherReport.update(query, report, function(err){
                if (err){
                  req.flash('danger', 'SMS not sent');
                  //req.flash('danger', responseData);
                  res.redirect('/');
                  return;
                }else{
                  req.flash('success', 'SMS sent');
                  res.redirect('/');
                }});
        }});
      });
    }});
  });

module.exports=router;
