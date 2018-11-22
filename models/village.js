var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var VillageSchema = new mongoose.Schema({
    nom:  String,
    description:String,
    article:String,
    image:Boolean,
    imagePourcentage:Number,
    nombrePersonnesAttendues:Number,
    coordonnees : { latitude:  Number, longitude :  Number },
    niveauZoom :Number,
    _horairesOuvertures: [{dateDebut: Date, dateFin:Date}],
    _lieux: [{type: ObjectId, ref: 'Lieu' }],
    _porteurs: [{type: ObjectId, ref: 'Porteur' }],
    _activites: [{type: ObjectId, ref: 'Activite' }],
    _participants: [{type: ObjectId, ref: 'Utilisateur' }],
    _interesses: [{type: ObjectId, ref: 'Utilisateur' }],
    _benevoles: [{type: ObjectId, ref: 'Utilisateur' }],
    _organisateurs: [{type: ObjectId, ref: 'Utilisateur' }],
    _referents: [{type: ObjectId, ref: 'Utilisateur' }],
    _referentsNonValides: [{type: ObjectId, ref: 'Utilisateur' }],
    _engagements: [{type: ObjectId, ref: 'Engagement' }],
    inscriptionReferent:Boolean,
    inscriptionBenevole:Boolean,
    inscriptionVisiteur:Boolean,
    inscriptionOrganisateur:Boolean,
    publication:Boolean,
    afficherHoraire:Boolean,
    estTourEtendu:Boolean,
    facebookUrl:String,
    estMarche:Boolean,
    estClimateFriday:Boolean,
    estPreTour:Boolean,
    emailContact:String,
    horsTour:Boolean,
    horsFetesDesPossible:Boolean,
    lienFormulaireBenevole:String

}, { timestamps: true}, { usePushEach: true });

mongoose.model('Village', VillageSchema); // register modelo