var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var logger = require('morgan');
var helmet = require('helmet');

var indexRouter = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/images', indexRouter);

module.exports = app;
