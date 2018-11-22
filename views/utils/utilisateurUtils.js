exports = module.exports = {};
exports.contientUtilisateur =function(listeUtilisateur){
     
      if(utilisateur != undefined  && listeUtilisateur!=null){
        for (var i = 0, len = listeUtilisateur.length; i < len; i++) {
       var utilisateurPresent=listeUtilisateur[i]
          if(utilisateurPresent != undefined && utilisateurPresent._id.equals(utilisateur._id)){
            return true;
          }
        }
       }
     return false;
  }
  