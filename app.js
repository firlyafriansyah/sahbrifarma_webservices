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
const visitHistoryRouter = require('./routes/VisitHistory');

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
app.use('/visit-history', visitHistoryRouter);

// const port = process.env.PORT || 8080;
// app.listen(port, () => {
//   console.log('Express server listening on port', port);
// });

module.exports = app;
