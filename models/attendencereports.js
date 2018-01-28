let mongoose = require ('mongoose');

//Attendence report schema 
let attendenceReportsSchema = mongoose.Schema({

  date:{
    type: Date,
    required: true
  },
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
  status:{
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

let AttendenceReport = module.exports = mongoose.model('attendenceReports', attendenceReportsSchema );
