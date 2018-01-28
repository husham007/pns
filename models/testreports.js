let mongoose = require ('mongoose');

//Test Report Schema
let testReportsSchema = mongoose.Schema({


  remarks:{
    type: String,
    required: true
      },
  institution:{
    type: String,
    required: true
  },
  student:{
    type: String,
    required: true
  },
  subject:{
    type: String,
    required: true
  },
  testdate:{
    type: Date,
    required: true
  },
  totalmarks:{
    type: String,
    required: true
  },
  obtainedmarks:{
    type: String,
    required: true
  },
  tag:{
    type: String
  },
  sentdate:{
    type: Date
    }
});

let TestReport = module.exports = mongoose.model('testReports', testReportsSchema );
