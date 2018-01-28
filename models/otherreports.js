let mongoose = require ('mongoose');

// Other report schema
let otherReportsSchema = mongoose.Schema({

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
  tag:{
    type: String
  },
  sentdate:{
    type: Date
    }
});

let OtherReport = module.exports = mongoose.model('otherReports', otherReportsSchema );
