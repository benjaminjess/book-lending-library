const mongoose = require('mongoose');

const { Schema } = mongoose;

const personSchema = new Schema({
  Name: {
    type: String,
    required: true,
  },
  email: String,
  password: String,
}, {
  timestamps: true,
});

const Person = mongoose.model('Person', personSchema);

module.exports = Person;