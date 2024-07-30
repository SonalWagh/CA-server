const express = require('express');
const router = express.Router();
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const multer = require('multer');
const chokidar = require('chokidar');
const CRT = require('../models/crtModule');
const CSR = require('../models/csrModule');
const Certificate = require('../models/Certificate'); // Adjust the path as needed

//1.Function to generate CA.key and CA.crt
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

// 2.Function to generate crt file and save certificates
async function generateAndSaveClientCertificate(csrFile) {
  try {
    const keyPath = path.join(__dirname, '../.certificates/ca.key');
    const crtPath = path.join(__dirname, '../.certificates/ca.crt');

    const csrDir = path.join(__dirname, '../.received_csr');
    const crtDir = path.join(__dirname, '../.generated_crt');

    const csrPath = path.join(csrDir, csrFile);
    const crtFileName = csrFile.replace('.csr', '.crt');
    const crtOutPath = path.join(crtDir, crtFileName);

    const opensslCommand = `openssl x509 -req -in ${csrPath} -CA ${crtPath} -CAkey ${keyPath} -CAcreateserial -out ${crtOutPath} -days 365`;

    // Execute OpenSSL command
    await new Promise((resolve, reject) => {
      exec(opensslCommand, async (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating certificate for ${csrFile}: ${stderr}`);
          reject(`Failed to generate certificate for ${csrFile}`);
        } else {
          console.log(`Certificate ${crtFileName} generated successfully`);

          try {
            const crtContent = fs.readFileSync(crtOutPath);
            const newCRT = new CRT({
              type: crtFileName,
              content: crtContent,
            });

            await newCRT.save();
            console.log(`Certificate ${crtFileName} saved to database`);
            resolve();
          } catch (error) {
            console.error(`Error saving certificate ${crtFileName} to database:`, error);
            reject(`Failed to save certificate ${crtFileName} to database`);
          }
        }
      });
    });
  } catch (error) {
    console.error('Error in generating certificates:', error);
  }
}

//3. Watcher setup to monitor the .received_csr directory for new files
const csrDir = path.join(__dirname, '../.received_csr');
const watcher = chokidar.watch(csrDir, {
  persistent: true,
  ignoreInitial: true, // Don't trigger on files that already exist
});

watcher.on('add', (filePath) => {
  const csrFile = path.basename(filePath);
  console.log(`New CSR file detected: ${csrFile}`);
  generateAndSaveClientCertificate(csrFile);
});

// 4.Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './.received_csr'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });
//Route to receive and store csr file
router.post('/upload-csr', upload.single('csr'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  try {
    const csrPath = path.join(__dirname, '..', '.received_csr', req.file.originalname);
    const csrContent = fs.readFileSync(csrPath);

    const newCSR = new CSR({
      type: req.file.originalname,
      content: csrContent,
    });

    await newCSR.save();

    res.status(201).send('File uploaded and CSR saved to database.');
    console.log('Received CSR:', csrPath);
  } catch (error) {
    console.error('Error saving CSR to database:', error);
    res.status(500).send('Error saving CSR to database');
  }
});
//5.list all csr file

router.post('/list-csr', async (req, res) => {
  try {
    const csrList = await CSR.find({}, 'type');
    res.status(200).json(csrList);
  } catch (error) {
    console.error('Error fetching CSR list:', error);
    res.status(500).send('Error fetching CSR list');
  }
});

//6.list all crts files
router.post('/list-crts', async (req, res) => {
  try {
    const crtList = await CRT.find({}, 'type');
    res.status(200).json(crtList);
  } catch (error) {
    console.error('Error fetching CRT list:', error);
    res.status(500).send('Error fetching CRT list');
  }
});

//7.Route to download any .crt file
router.post('/get-crt', (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).send('Filename not provided');
  }

  const crtFilePath = path.join(__dirname, '../.generated_crt', filename);

  if (!fs.existsSync(crtFilePath)) {
    return res.status(404).send('File not found');
  }

  res.download(crtFilePath, filename, (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

//8.Route to download ca.crt file

router.post('/get-cacrt', (req, res) => {
  const cacrtFilePath = path.join(__dirname, '../.certificates', 'ca.crt');
  res.download(cacrtFilePath, 'ca.crt', (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

//9. Set up multer for file or image file upload with original filename
const storage_image = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, '.received_image/');
  },
  filename: (req, file, cb) => {
      cb(null, file.originalname);
  }
});
const upload_image = multer({ storage: storage_image });

//10.POST API to receive and sign the image
router.post('/upload-image', upload_image.single('image'), (req, res) => {
  if (!req.file) {
      return res.status(400).send('No file uploaded.');
  }

  const imagePath = req.file.path;
  const hashPath = `${imagePath}.hash`;
  const signedImagePath = path.join('.signed_image', path.basename(imagePath) + '.sig');
  const privateKeyPath =path.join(__dirname, '..', '.certificates', 'ca.key');

  // Ensure the output directories exist
  if (!fs.existsSync('.signed_image')) {
      fs.mkdirSync('.signed_image');
  }

  // Generate the hash of the image
  exec(`openssl dgst -sha256 -binary ${imagePath} > ${hashPath}`, (err) => {
      if (err) {
          return res.status(500).send('Error generating hash: ' + err.message);
      }

      // Sign the hash
      exec(`openssl rsautl -sign -inkey ${privateKeyPath} -in ${hashPath} -out ${signedImagePath}`, (err) => {
          if (err) {
              return res.status(500).send('Error signing image: ' + err.message);
          }

          res.send(`Image signed successfully. Signed file: ${signedImagePath}`);
      });
  });
});

// 11.Route to download any .sig file
router.post('/get-sigimg', (req, res) => {
  const { filename } = req.body;

  if (!filename) {
    return res.status(400).send('Filename not provided');
  }

  const crtFilePath = path.join(__dirname, '../.signed_image', filename);

  if (!fs.existsSync(crtFilePath)) {
    return res.status(404).send('File not found');
  }

  res.download(crtFilePath, filename, (err) => {
    if (err) {
      res.status(500).send(err);
    }
  });
});

module.exports = router;


