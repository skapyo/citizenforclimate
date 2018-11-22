var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;


var InformationParticipantFormationSchema = new mongoose.Schema({
    disponibilites: [{dateDebut: Date, dateFin:Date}],
    participant: {type: ObjectId,ref: 'Utilisateur' },
    commentaire:String,
    connaissanceCritereNonViolence:String,
    estGroupeANV:Boolean,
    estGroupeAlternatiba:Boolean,
    estGroupeAmisDeLaTerre:Boolean,
    autresGroupe:String,
    participationAction:String,
    participationActionAvecGroupe:String,
    nonDisponible:String

}, { timestamps: true}, { usePushEach: true });


mongoose.model('InformationParticipantFormation', InformationParticipantFormationSchema); // register model