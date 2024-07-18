const express = require('express');
const router = express.Router();
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
 
 
router.post('/createKey', async(req, res, next) => {
    try {
        const keyPath = path.join(__dirname, '..','.certificates', 'ca.key');
        const cmd = `openssl genrsa -out ${keyPath} 2048`;
        exec(cmd, async (err, stdout, stderr) => {
            if (err) {
                console.error("error creating ca.key", err);
                return res.status(500).json({ message: 'Error creating ca.key' });
            } else {
                console.log('CSR created:', keyPath);
            }
        });
    } catch (error) {
        res.send("error:"  + error.message);
    }
});
 
router.post('/createCRT', async(req, res) => {
    try {
        const commonName = 'SDV';
        const organization = "FEV";
        const country = "IN";
        const state = "MAH"
        const locality = "PUNE";
        const email = "SDV@FEV";
 
        const crtPath = path.join(__dirname, '..','.certificates', 'ca.crt');
        const keyPath = path.join(__dirname, '..','.certificates', 'ca.key');
        const cmd = `openssl req -new -x509 -days 30 -key ${keyPath} -out ${crtPath} -subj "/C=${country}/ST=${state}/L=${locality}/O=${organization}/CN=${commonName}/emailAddress=${email}"`;
        exec(cmd, async (err, stdout, stderr) => {
            if (err) {
                console.error("error creating ca.crt", err);
                return res.status(500).json({ message: 'Error creating ca.crt' });
            } else {
                console.log('CSR created:', crtPath);
            }
        });
    } catch (error) {
        res.send('Error: ' + error);
    }
});
module.exports = router;


