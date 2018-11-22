var mongoose = require('mongoose');


//Model
var BenevoleSchema = new mongoose.Schema({
    nom:  String,
    prenom:  String,
    adresseMail:  String,
    description: String,
    horairePresence: [{heureMin: Date, heureMax:Date}],
}, { timestamps: true}, { usePushEach: true });

mongoose.model('Benevole', BenevoleSchema); // register model