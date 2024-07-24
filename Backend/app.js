const express = require('express');
const mongoose = require('mongoose');
const crtRoute = require('./routes/crtRoute');
const authRoute = require('./routes/auth');
require('dotenv').config();

const app = express();
const cors = require('cors')
app.use(cors('*'))
app.use(express.json())



mongoose.connect('mongodb://localhost:27017/crud', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
});

// app.use('/certificates', certificatesRoute);
// app.use('/keys', keysRoute);
app.use('/crt', crtRoute);
// app.use('/csr', csrRoute);
app.use('/auth',authRoute);


const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
