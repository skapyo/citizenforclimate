

var mongoose = require('mongoose');

var moment = require('moment');

var  Porteur = mongoose.model('Porteur')
    ,Lieu = mongoose.model('Lieu')
    ,Activite = mongoose.model('Activite')
    ,Village = mongoose.model('Village');



exports.activite=function(request, response) {
    request.visitor.pageview(request.url,request.hostname,"Activite").send();
    var activiteId = request.query.activiteId;
    var villageId = request.query.villageId;
    if(typeof activiteId !== undefined && activiteId!="undefined" && activiteId!="" ) {

        Activite.findOne({_id: activiteId}).populate('_lieux _porteurs').exec(function (err, activiteAModifier) {
            afficherPageActivite(villageId,response, activiteAModifier);
        });
    }
    else {
        afficherPageActivite(villageId,response);
    }

};




exports.ajoutActivite=function(request, response) {
    var nom = request.body.nom;
    var id = request.body.id;
    var villageId = request.body.villageId;
    var idLieu = request.body.idLieu;
    var idPorteur ;
    if(request.body.idPorteur!=''){
        idPorteur= request.body.idPorteur;
    }
    var description = request.body.description;
    var typeActivite = request.body.typeActivite;
    var dateDebut = request.body.dateDebut;
    var horaireDebut = request.body.horaireDebut;
    var dateFin= request.body.dateFin;
    var horaireFin = request.body.horaireFin;
    var placeMaximum=request.body.placeMaximum;
    var materielNecessaire = request.body.materielNecessaire;
    var dateDebutFormat = Date.parse( request.body.dateDebut+" "+request.body.horaireDebut+"Z");
    var dateFinFormat = Date.parse(request.body.dateFin+" "+request.body.horaireFin+"Z");
    var inscription  = "on"==request.body.inscription;
    var lienVelorution  = request.body.lienVelorution;
    if( typeof id  !== undefined && id!="undefined" && id!=""){
    	Activite.findOne({ _id: id}).
  populate('_porteurs').populate('_lieux')
 .exec(function (err, activite){
      if(activite!=null){
  		  activite.nom = nom;
  		  activite.description=description;
  		  activite.typeActivite=typeActivite;
  		  activite.placeMaximum=placeMaximum;
            if( materielNecessaire  != undefined && materielNecessaire!=""){
  		      activite.materielNecessaire=materielNecessaire;
              }
              
  			activite.lienVelorution=lienVelorution;
              activite._porteurs=[];
              if( !(idPorteur  == undefined || idPorteur=="")){
                      activite._porteurs=idPorteur;
              }
              activite.inscription=inscription;

              activite._lieux=[];
              if( !(idLieu  == undefined || idLieu=="")){
                  activite._lieux=activite._lieux.concat([idLieu]);
              }

  		  activite.disponibilites[0]=({dateDebut:dateDebutFormat,dateFin:dateFinFormat});
  		
  		  activite.save(function (err){
  			  console.log("Activite "+ nom +" updaté dans la base pour le villageId "+villageId);
  			  request.visitor.event("Modification","Modification de l'activite "+ activite.nom+"pour le villageId "+villageId).send();
  		  	  afficherPageActivite(villageId,response,activite);
  		  	  });
      }
      else{
        afficherPageActivite(villageId, response,null);
      }
		  });
    
    }
    else{
        var activiteAInserer = new Activite({ nom: nom,
            inscription:inscription,
            description:description,
            placeMaximum:placeMaximum,
            _porteurs: idPorteur,
            typeActivite:typeActivite,disponibilites :[{dateDebut:dateDebutFormat,dateFin:dateFinFormat}]});
            if( typeof idLieu  == undefined || idLieu==""){
                activiteAInserer._lieux=null;
          }else{
                 activiteAInserer._lieux[0]=idLieu;
          }
          if( typeof materielNecessaire  != undefined && materielNecessaire!=""){
              activiteAInserer.materielNecessaire=materielNecessaire;
            }
        activiteAInserer.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Activite "+ nom +" inseré dans la base.");

            }
            ajouterActiviteVillage(villageId,activiteAInserer,request,response)
        });

    }
};
function ajouterActiviteVillage(villageId,activite,request,response){
   Village.findById(villageId).populate('_activites ').exec(function (err, village) {
       village._activites=village._activites.concat([activite]);
        village.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Activite "+ activite.nom +" ajoute au village " +village.nom);
                request.visitor.event("Ajout","Activite "+ activite.nom +" ajoute au village " +village.nom).send();
            }
             afficherPageActivite(villageId,response,activite);
         });
    });
}
exports.suppressionActivite=function(request, response) {
  var villageId = request.query.villageId;
  var activiteId =request.query.activiteId;
        if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
           Activite.findById(activiteId).exec(function (err, activite) {
             Village.findById(villageId).exec(function (err, village) {
                if(village!=null){
                  village._activites.remove(activite);
                  activite.remove(function(err) {
                    if (err) throw err;

                    console.log('Activite' + activite.nom +' supprimé du village '+ village.nom);
                  });
                   village.save(function (err){
                      request.visitor.event("Suppression","Suppression activite "+ activite.nom+" du village "+village.nom).send();
                      afficherPageActivite(villageId, response,null);
                      });
                    }
                    else{
                         afficherPageActivite(villageId, response,null);
                    }
                  });
                });
               
            }   
}




function afficherPageActivite(villageId,response){
    afficherPageActivite(villageId,response,null);
}

function afficherPageActivite(villageId,response,activiteAModifier){
   
     Village.findById(villageId).populate('_lieux _porteurs _activites _activites._porteurs').populate('_participants').populate('_benevoles').populate('_referents').populate('_porteurs').exec(function (err, village) {
       if (typeof village !== "undefined" && village !== null){
          Lieu.populate(village,'_activites.lieux', function(err, results){
              Porteur.populate(village,'_activites._porteurs', function(err, results){
                  Activite.populate(activiteAModifier,'_lieux _porteurs', function(err, results){
                  	if(activiteAModifier!=undefined){
                  	 console.log("Affichage de page édition d'activité avec le detail de "+ activiteAModifier.nom +" du village "+ village.nom);
                  	}else {
                  		console.log("Affichage de page edition d'activité du village "+ village.nom);
                  	}
                      response.render('pages/activite', {village:village,lieux: village._lieux,activites: village._activites,porteurs: village._porteurs,activiteAModifier:activiteAModifier,moment:moment,Activite:Activite});
                   });
              });
           });
        }else{
               response.redirect("/");
          }
    });
}
