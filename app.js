const express = require('express');
const expressFileupload = require('express-fileupload')
const { developmentErrors, productionErrors, notFound } = require('./helpers/errorHandler')

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressFileupload());

app.use('/bucket', require('./routes/bucket'));
app.use(process.env.ENV === 'DEV' ? developmentErrors : productionErrors);
app.use(notFound);

module.exports = app;