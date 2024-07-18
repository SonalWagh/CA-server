const express = require('express');
const { exec } = require('child_process');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const CRT = require('../models/crtModule');

// Endpoint to generate client certificate
router.get('/generate-client-cert',(req, res) => {
    const clientKeyPath = path.join(__dirname,'../.certificates/ca.key');
    const clientCertPath = path.join( __dirname,'../.certificates/ca.crt');
    const clientCsrPath = path.join(__dirname, '../.csr/client.csr');
    const clientCertOutPath = path.join(__dirname,'../.crt/client.crt');

    if (!fs.existsSync(clientCsrPath)) { 
      console.log("csr not found");
      return res.status(404).json({ error: 'CSR not found' });
    }

    // OpenSSL command to generate client certificate
    const opensslCommand = `openssl x509 -req -in ${clientCsrPath} -CA ${clientCertPath} -CAkey ${clientKeyPath} -CAcreateserial -out ${clientCertOutPath} -days 365`;

    // Execute OpenSSL command
    exec(opensslCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error generating client certificate: ${stderr}`);
            return res.status(500).json({ error: 'Failed to generate client certificate' });
        }

        console.log('Client certificate generated successfully');
        return res.status(200).json({ message: 'Client certificate generated successfully' });
        
    });
});

// Route to save the CRT to the database
router.post('/save-client-crt', async (req, res) => {
    try {
      const csrPath = path.join(__dirname, '..', '.crt', 'client.crt');
      const csrContent = fs.readFileSync(csrPath);
  
      const newCSR = new CRT({
        type: 'client-crt',
        content: csrContent,
      });
  
      await newCSR.save();
  
      res.status(201).send('CRT saved to database');
    } catch (error) {
      console.error('Error saving CRT to database:', error);
      res.status(500).send('Error saving CRT to database');
    }
  });
  router.post('/list-crts', async (req, res) => {
    try {
      const crtList = await CRT.find({},'type content');
      res.status(200).json(crtList);
    } catch (error) {
      console.error('Error fetching CRT list:', error);
      res.status(500).send('Error fetching CRT list');
    }
  });


module.exports = router;
