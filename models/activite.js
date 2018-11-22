var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const TYPE_ACTIVITE = ['Stand','Conférence','Concert','Projection','Atelier','Animation','Formation','Vélorution','Restauration','Réunion','Festival','Marche','Climate Alarm','Autre'];
var ActiviteSchema = new mongoose.Schema({
    nom:  String,
    description:String,
    placeMaximum:Number,
    materielNecessaire:String,
    disponibilites: [{dateDebut: Date, dateFin:Date}],
    _lieux: [{type: ObjectId, ref: 'Lieu' }],
    _porteurs: [{type: ObjectId, ref: 'Porteur' }],
    typeActivite:  {type:String, enum :TYPE_ACTIVITE} ,
     _participants: [{type: ObjectId,ref: 'Utilisateur' }],
     _informationParticipantFormation :  [{type: ObjectId, ref: 'InformationParticipantFormation' }],
     inscription:Boolean,
     lienVelorution:String
}, { timestamps: true}, { usePushEach: true });

mongoose.model('Activite', ActiviteSchema); // register model