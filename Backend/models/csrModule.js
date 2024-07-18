// /models/csrModel.js

const mongoose = require('mongoose');

const csrSchema = new mongoose.Schema({
  type: String,
  content: String,
});

const CSR = mongoose.model('CSR', csrSchema);

module.exports = CSR;
