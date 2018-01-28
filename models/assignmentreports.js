let mongoose = require ('mongoose');

// Assignment report schema
let assignmentReportsSchema = mongoose.Schema({

  startdate:{
    type: Date,
    required: true
  },
  enddate:{
    type: Date,
    required: true
  },
  assignment:{
    type: String,
    required: true
      },
  institution:{
    type: String,
    required: true
  },
  class:{
    type: String,
    required: true
  },
  subject:{
    type: String,
    required: true
  },
  students:{
  },
  sentdate:{
    type: Date,
    }
});

let AssignmentReport = module.exports = mongoose.model('assignmentReports', assignmentReportsSchema );
