var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const STATUT_ENGAGEMENT = ['Déja fait',"Je m'engage",'En cours','Fait'];

var InformationParticipantEngagementSchema = new mongoose.Schema({
    participant: {type: ObjectId,ref: 'Utilisateur' },
    statutEngagement:  {type:String, enum :STATUT_ENGAGEMENT}

}, { timestamps: true}, { usePushEach: true });


mongoose.model('InformationParticipantEngagement', InformationParticipantEngagementSchema); // register model