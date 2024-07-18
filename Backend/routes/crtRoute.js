const express = require('express');
const router = express.Router();
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const multer=require('multer');
const CRT = require('../models/crtModule');
const CSR = require('../models/csrModule');
const Certificate = require('../models/Certificate'); // Adjust the path as needed

router.post('/generateCertificate', async (req, res) => {
  try {
    const keyPath = path.join(__dirname, '..', '.certificates', 'ca.key');
    const crtPath = path.join(__dirname, '..', '.certificates', 'ca.crt');
    const commonName = 'SDV';
    const organization = "FEV";
    const country = "IN";
    const state = "MAH";
    const locality = "PUNE";
    const email = "SDV@FEV";

    const genKeyCmd = `openssl genrsa -out ${keyPath} 2048`;
    exec(genKeyCmd, async (err, stdout, stderr) => {
      if (err) {
        console.error("Error creating ca.key", err);
        return res.status(500).json({ message: 'Error creating ca.key' });
      } else {
        console.log('Key created:', keyPath);
        const keyContent = fs.readFileSync(keyPath);
        const keyDocument = new Certificate({ name: 'ca.key', content: keyContent });
        await keyDocument.save();

        const genCrtCmd = `openssl req -new -x509 -days 30 -key ${keyPath} -out ${crtPath} -subj "/C=${country}/ST=${state}/L=${locality}/O=${organization}/CN=${commonName}/emailAddress=${email}"`;
        exec(genCrtCmd, async (err, stdout, stderr) => {
          if (err) {
            console.error("Error creating ca.crt", err);
            return res.status(500).json({ message: 'Error creating ca.crt' });
          } else {
            console.log('Certificate created:', crtPath);
            const crtContent = fs.readFileSync(crtPath);
            const crtDocument = new Certificate({ name: 'ca.crt', content: crtContent });
            await crtDocument.save();

            res.status(200).send('Key and Certificate saved to database');
          }
        });
      }
    });
  } catch (error) {
    res.send('Error: ' + error.message);
  }
});

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
router.post('/generate-and-save-client-cert', async (req, res) => {
  try {
    const clientKeyPath = path.join(__dirname, '../.certificates/ca.key');
    const clientCertPath = path.join(__dirname, '../.certificates/ca.crt');
    const clientCsrPath = path.join(__dirname, '../.csr/client.csr');
    const clientCertOutPath = path.join(__dirname, '../.crt/client.crt');

    if (!fs.existsSync(clientCsrPath)) {
      console.log("CSR not found");
      return res.status(404).json({ error: 'CSR not found' });
    }

    // OpenSSL command to generate client certificate
    const opensslCommand = `openssl x509 -req -in ${clientCsrPath} -CA ${clientCertPath} -CAkey ${clientKeyPath} -CAcreateserial -out ${clientCertOutPath} -days 365`;

    // Execute OpenSSL command
    exec(opensslCommand, async (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating client certificate: ${stderr}`);
        return res.status(500).json({ error: 'Failed to generate client certificate' });
      }

      console.log('Client certificate generated successfully');

      try {
        const crtContent = fs.readFileSync(clientCertOutPath);
        const newCSR = new CRT({
          type: 'client-crt',
          content: crtContent,
        });

        await newCSR.save();

        console.log('Client certificate saved to database');
        res.status(201).send('Client certificate generated and saved to database');
      } catch (error) {
        console.error('Error saving CRT to database:', error);
        res.status(500).send('Error saving CRT to database');
      }
    });
  } catch (error) {
    console.error('Error in generating client certificate:', error);
    res.status(500).send('Error in generating client certificate');
  }
});

module.exports = router;

router.post('/list-crts', async (req, res) => {
  try {
    const crtList = await CRT.find({}, 'type content');
    res.status(200).json(crtList);
  } catch (error) {
    console.error('Error fetching CRT list:', error);
    res.status(500).send('Error fetching CRT list');
  }
});
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './.received_csr'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
 
const upload = multer({ storage: storage });

// Route for file upload
router.post('/upload-csr', upload.single('csr'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send('File uploaded successfully.');
  console.log('Received CSR:', req.file.path);
});

module.exports = router;
