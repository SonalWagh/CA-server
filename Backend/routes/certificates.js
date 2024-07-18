const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const Certificate = require('../models/Certificate');


router.post('/save', async (req, res) => {
   // res.send("test")
  try {
    const keyPath = path.join(__dirname, '../.certificates/ca.key');
    const crtPath = path.join(__dirname, '../.certificates/ca.crt');

    const keyContent = fs.readFileSync(keyPath);
    const crtContent = fs.readFileSync(crtPath);

    const keyDocument = new Certificate({ name: 'ca.key', content: keyContent });
    const crtDocument = new Certificate({ name: 'ca.crt', content: crtContent });

    await keyDocument.save();
    await crtDocument.save();

    res.status(200).send('Certificates saved to database');
  } catch (err) {
    res.status(500).send('Error saving certificates to database');
  }
});
module.exports = router;
