var url = 'mongodb://mongoDBUrlToReplace';
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
mongoose.Promise = global.Promise;
mongoose.connect(url);