var cool = require('cool-ascii-faces');
var express = require('express');
var bodyParser = require("body-parser");
var i18n=require("i18n-express");
var app = express();

const fs = require('fs');
const join = require('path').join;
app.use(bodyParser.urlencoded({ extended: true }));



var url = 'mongodb://cfc:123456@35.180.167.130:27017/mapCFC';
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

mongoose.Promise = global.Promise;
mongoose.connect(url);

var cacheOpts = {
    max:100,
    maxAge:1000*60*60
};
require('mongoose-cache').install(mongoose, cacheOpts)

//mongoose.set('debug', true);

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//use sessions for tracking logins
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: mongoose.connection
  })
}));

app.use(i18n({
    translationsPath: join(__dirname, 'i18n'), // <--- use here. Specify translations files path.
    siteLangs: ["en","fr"],
    textsVarName: 'translation',
    browserEnable: 'true',
    defaultLang: 'en',
    paramLangName: 'clang'
}));

  /** Seting up server to accept cross-origin browser requests */
    app.use(function(req, res, next) { //allow cross origin requests
        res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
        res.header("Access-Control-Allow-Origin", "http://localhost:5000");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        res.header("Access-Control-Allow-Credentials", true);
        next();
    });

var ua = require('universal-analytics');
app.use(ua.middleware("codeGAToReplace", {cookieName: '_ga'}));

var flash=require("connect-flash");
app.use(flash());

// Configuring Passport
var passport = require('passport');
var expressSession = require('express-session');
app.use(expressSession({secret: 'mySecretKey'}));
app.use(passport.initialize());
app.use(passport.session());



const models = join(__dirname, '/models');
// Bootstrap models
fs.readdirSync(models).filter(file => ~file.indexOf('.js')).forEach(file => require(join(models, file)));


/**
 * Expose
 */

module.exports = {
    app,passport
};

// Bootstrap routes
require('./config/routes')(app);





app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});




