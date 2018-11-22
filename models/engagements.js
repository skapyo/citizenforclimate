var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

const TYPE_ENGAGEMENT = ['Energie renouvelable','Epargne solidaire','Relocalisation','Solidarité et partage','Agriculture','Recyclage','Sobriété'];
var EngagementSchema = new mongoose.Schema({
    nom:  String,
    description:String,
    _porteurs: [{type: ObjectId, ref: 'Porteur' }],
    typeEngagement:  {type:String, enum :TYPE_ENGAGEMENT} ,
     _informationParticipantEngagement :  [{type: ObjectId, ref: 'InformationParticipantEngagement' }],
}, { timestamps: true}, { usePushEach: true });

mongoose.model('Engagement', EngagementSchema); // register model