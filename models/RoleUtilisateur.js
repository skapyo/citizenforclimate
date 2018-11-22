var mongoose = require('mongoose');
var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

//Model
var RoleUtilisateurSchema = new mongoose.Schema({
    nom:  String,
    _actionsPossibles: [{type: ObjectId, ref: 'Action' }],
    _notifications: [{type: ObjectId, ref: 'Activite' }]
}, { timestamps: true}, { usePushEach: true });

mongoose.model('RoleUtilisateur', RoleUtilisateurSchema); // register model