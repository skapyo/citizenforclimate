var mongoose = require('mongoose');

var LieuShema = new mongoose.Schema({
    nom:  String,
    adresse: String,
    coordonnees : { latitude:  Number, longitude :  Number },
    disponibilites: [{dateDebut: Date, dateFin:Date}]
}, { timestamps: true}, { usePushEach: true });

mongoose.model('Lieu', LieuShema); // register model