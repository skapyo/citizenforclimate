var mongoose = require('mongoose');
var  Utilisateur = mongoose.model('Utilisateur');

exports.modifierProfil=function(request,response){

	Utilisateur.findById(request.user._id)
    .exec(function (error, user) {
      if (request.body.role !== null) {
        user.role=request.body.role;
        user.save(function (err){
         console.log("Profil "+ user.prenom +" " + user.nom+" updaté dans la base.");
          response.redirect('/profil');
          });
      }
  });
};

