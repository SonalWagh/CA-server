// /routes/csrRoutes.js

const express = require('express');
const fs = require('fs');
const router = express.Router();
const path = require('path');
const CSR = require('../models/csrModule');

const csrPath=path.join(__dirname, '..', '.csr', 'client.csr');

// Route to save the CSR to the database
router.post('/save-csr', async (req, res) => {
  try {
    const csrPath = path.join(__dirname, '..', '.csr', 'client.csr');
    const csrContent = fs.readFileSync(csrPath);

    const newCSR = new CSR({
      type: 'client',
      content: csrContent,
    });

    await newCSR.save();

    res.status(201).send('CSR saved to database');
  } catch (error) {
    console.error('Error saving CSR to database:', error);
    res.status(500).send('Error saving CSR to database');
  }
});
router.get('/list-csrs', async (req, res) => {
  try {
     const csrList = await CSR.find({}, 'type');
    // const csrList=path.join(__dirname, '..', '.csr', 'client.csr');
    if (!fs.existsSync(csrPath)) { 
      console.log("csr not found");
      return res.status(404).json({ error: 'CSR not found' });
    }
    res.status(200).json(csrList);
    // res.send(csrList)
  } catch (error) {
    console.error('Error fetching CSR list:', error);
    res.status(500).send('Error fetching CSR list');
  }
});

module.exports = router;
