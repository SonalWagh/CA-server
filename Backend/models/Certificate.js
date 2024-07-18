const { Int32 } = require('bson');
const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  name: String,
  content: String,
});

module.exports = mongoose.model('Certificate', certificateSchema);
