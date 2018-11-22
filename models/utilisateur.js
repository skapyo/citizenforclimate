var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;
var bcrypt = require('bcrypt');

const ROLE = ['admin','organisateurTour','referent','porteur','visiteur','formateur','analyseData'];
//Model
var UtilisateurSchema = new mongoose.Schema({
    nom:  String,
    prenom:  String,
    adresseMail:  {
	    type: String,
	    unique: true,
	    required: true,
	    trim: true
	  },
	motDePasse: {
		type: String,
		required: true,
		},
	telephone:  String,
    _porteursFavoris: [{type: ObjectId, ref: 'Porteur' }],
    _activiteFavoris: [{type: ObjectId, ref: 'Activite' }],
    role:  {type:String, enum :ROLE},
    ville:  String,
    codePostal:  Number,
    dateNaissance: Date,
    age:  Number,
}, { timestamps: true}, { usePushEach: true });


var Utilisateur=mongoose.model('Utilisateur', UtilisateurSchema); // register model