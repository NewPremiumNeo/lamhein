var http = require('http')
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require("express-session");
const { Server } = require('socket.io');

var usersModel = require('./models/usersModel.js');
var indexRouter = require('./routes/index');
var likeRouter = require('./routes/like');
var saveRouter = require('./routes/save');
var adminRouter = require('./routes/admin');
var voteRouter = require('./routes/vote');
require('./models/connectDB');
const passport = require('passport');
const flash = require('connect-flash');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(expressSession({
  resave: false,
  saveUninitialized: false,
  secret: 'whatisthisproblem'
}));

app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(usersModel.serializeUser());
passport.deserializeUser(usersModel.deserializeUser());

app.use(flash());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/', likeRouter.router)
app.use('/', saveRouter.router)
app.use('/vote', voteRouter);
// app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

const port = process.env.PORT || 8000

const server = app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const io = new Server(server);
likeRouter.initialize(io);

module.exports = app;
