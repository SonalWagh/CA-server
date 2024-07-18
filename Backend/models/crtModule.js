const mongoose = require('mongoose');

const crtSchema = new mongoose.Schema({
  type: String,
  content: String,
});

const CRT = mongoose.model('CRT', crtSchema);

module.exports = CRT;