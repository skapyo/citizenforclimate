var url = 'mongodb://cfc:123456@localhost:27017/mapCFC';
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
mongoose.Promise = global.Promise;
mongoose.connect(url);
