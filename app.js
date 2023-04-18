const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const administrationRouter = require('./routes/Administration');
const patientIdentityRouter = require('./routes/PatientIdentity');
const serviceConnectionTestRouter = require('./routes/ServiceConnectionTest');

const app = express();

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/administration', administrationRouter);
app.use('/patient', patientIdentityRouter);
app.use('/services-connection-test', serviceConnectionTestRouter);

// #THIS FOR HEROKU PRODUCTION CONFIGURATION
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log('Express server listening on port', port)
});

// #THIS FOR LOCAL DEVELOPMENT
// module.exports = app;
