let mongoose = require ('mongoose');

// Student Schema
let studentSchema = mongoose.Schema({

  rollno:{
    type: String,
    required: true
  },
  name:{
    type: String,
    required: true
  },
  address:{
    type: String,
    required: true
  },
  dob:{
    type: String,
    required: true
  },
  class:{
    type: String,
    required: true
  },
  parentname:{
    type: String,
    required: true
  },
  phoneno:{
    type: String,
    required: true
  },
  author:{
    type: String,
    required: true
  }
});

let Student = module.exports = mongoose.model('students', studentSchema );
