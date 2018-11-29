var url = 'mongodb://cfc:hhlJPGlyIrc9yq25EVxo@localhost:27017/mapCFC';
var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
mongoose.Promise = global.Promise;
mongoose.connect(url);
