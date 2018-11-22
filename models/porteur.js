var mongoose = require('mongoose');


const QUARTIER = ['Consommer responsable','Se Loger','S informer ','Se deplacer','Vivre ensemble'];
//Model
var PorteurSchema = new mongoose.Schema({
    nom:  String,
    description: String,
    quartier: {type:String, enum :QUARTIER} ,
    nombrePersonne:Number,
    questionJeu:String,
    placeNecessaire:Number,
    disponibilites: [{heureMin: Date, heureMax:Date}],
    siteWeb: String,
    adresseMail:  {
	    type: String,
	    trim: true
	  }
}, { timestamps: true}, { usePushEach: true });

mongoose.model('Porteur', PorteurSchema); // register model