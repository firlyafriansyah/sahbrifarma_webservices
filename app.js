const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const administrationRouter = require('./routes/Administration');
const patientRouter = require('./routes/Patient');
const serviceConnectionTestRouter = require('./routes/ServiceConnectionTest');
const queueRouter = require('./routes/Queue');
const medicalTestRouter = require('./routes/MedicalTest');
const doctoralConsultationRouter = require('./routes/DoctoralConsultation');
const medicineRouter = require('./routes/Medicine');

const app = express();

app.use(logger('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/administration', administrationRouter);
app.use('/patient', patientRouter);
app.use('/services-connection-test', serviceConnectionTestRouter);
app.use('/queue', queueRouter);
app.use('/medical-test', medicalTestRouter);
app.use('/doctoral-consultation', doctoralConsultationRouter);
app.use('/medicine', medicineRouter);

// #THIS FOR HEROKU PRODUCTION CONFIGURATION
// app.listen(process.env.PORT || 3000, () => {
//   // eslint-disable-next-line no-console
//   console.log('Express server listening on port %d in %s mode',
//   this.address().port, app.settings.env);
// });

// #THIS FOR LOCAL DEVELOPMENT
module.exports = app;
