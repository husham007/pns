let mongoose = require ('mongoose');

// Circular reports schema
let circularReportsSchema = mongoose.Schema({

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
  matter:{
    type: String,
    required: true
  },
  sentdate:{
    type: Date
    }
});

let CircularReport = module.exports = mongoose.model('circularReports', circularReportsSchema );
