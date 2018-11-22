

var mongoose = require('mongoose');

var moment = require('moment');

var  Porteur = mongoose.model('Porteur')
    ,Lieu = mongoose.model('Lieu')
    ,Engagement = mongoose.model('Engagement')
    ,Village = mongoose.model('Village');



exports.engagement=function(request, response) {
    request.visitor.pageview(request.url,request.hostname,"Engagement").send();
    var engagementId = request.query.engagementId;
    var villageId = request.query.villageId;
    if(typeof engagementId !== undefined && engagementId!=undefined && engagementId!="" ) {

        Engagement.findOne({_id: engagementId}).populate('_lieux _porteurs').exec(function (err, engagementAModifier) {
            afficherPageEngagement(villageId,response, engagementAModifier);
        });
    }
    else {
        afficherPageEngagement(villageId,response);
    }

};




exports.ajoutEngagement=function(request, response) {
    var id = request.body.id;
    var villageId = request.body.villageId;
    var idPorteur ;
    if(request.body.idPorteur!=''){
        idPorteur= request.body.idPorteur;
    }
    var nom = request.body.nom;
    var description = request.body.description;
    var typeEngagement = request.body.typeEngagement;
    if( typeof id  !== undefined && id!="undefined" && id!=""){
    	Engagement.findOne({ _id: id}).
  populate('_porteurs')
 .exec(function (err, engagement){
      if(engagement!=null){
          engagement.nom=nom;
  		  engagement.description=description;
  		  engagement.typeEngagement=typeEngagement;


              engagement._porteurs=[];
              if( !(idPorteur  == undefined || idPorteur=="")){
                      engagement._porteurs=idPorteur;
              }

  		  engagement.save(function (err){
  			  console.log("Engagement "+ nom +" updaté dans la base pour le villageId "+villageId);
  			  request.visitor.event("Modification","Modification de l'engagement "+ engagement.nom+"pour le villageId "+villageId).send();
  		  	  afficherPageEngagement(villageId,response,engagement);
  		  	  });
      }
      else{
        afficherPageEngagement(villageId, response,null);
      }
		  });
    
    }
    else{
        var engagementAInserer = new Engagement({
            nom:nom,
            description:description,
            _porteurs: idPorteur,
            typeEngagement:typeEngagement});
        engagementAInserer.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Engagement "+ nom +" inseré dans la base.");

            }
            ajouterEngagementVillage(villageId,engagementAInserer,request,response)
        });

    }
};
function ajouterEngagementVillage(villageId,engagement,request,response){
   Village.findById(villageId).populate('_engagements ').exec(function (err, village) {
       village._engagements=village._engagements.concat([engagement]);
        village.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Engagement "+ engagement.nom +" ajoute au village " +village.nom);
                request.visitor.event("Ajout","Engagement "+ engagement.nom +" ajoute au village " +village.nom).send();
            }
             afficherPageEngagement(villageId,response,engagement);
         });
    });
}
exports.suppressionEngagement=function(request, response) {
  var villageId = request.query.villageId;
  var engagementId =request.query.engagementId;
        if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
           Engagement.findById(engagementId).exec(function (err, engagement) {
             Village.findById(villageId).exec(function (err, village) {
                if(village!=null){
                  village._engagements.remove(engagement);
                  engagement.remove(function(err) {
                    if (err) throw err;

                    console.log('Engagement' + engagement.nom +' supprimé du village '+ village.nom);
                  });
                   village.save(function (err){
                      request.visitor.event("Suppression","Suppression engagement "+ engagement.nom+" du village "+village.nom).send();
                      afficherPageEngagement(villageId, response,null);
                      });
                    }
                    else{
                         afficherPageEngagement(villageId, response,null);
                    }
                  });
                });
               
            }   
}




function afficherPageEngagement(villageId,response){
    afficherPageEngagement(villageId,response,null);
}

function afficherPageEngagement(villageId,response,engagementAModifier){
   
     Village.findById(villageId).populate('_lieux _porteurs _engagements _engagements._porteurs').populate('_participants').populate('_benevoles').populate('_referents').populate('_porteurs').exec(function (err, village) {
       if (typeof village !== "undefined" && village !== null){
              Porteur.populate(village,'_engagements._porteurs', function(err, results){
                  Engagement.populate(engagementAModifier,' _porteurs', function(err, results){
                  	if(engagementAModifier!=undefined){
                  	 console.log("Affichage de page édition d'engagement avec le detail de "+ engagementAModifier.nom +" du village "+ village.nom);
                  	}else {
                  		console.log("Affichage de page edition d'engagement du village "+ village.nom);
                  	}
                      response.render('pages/engagement', {village:village,engagements: village._engagements,porteurs: village._porteurs,engagementAModifier:engagementAModifier,moment:moment,Engagement:Engagement});
                   });
              });
        }else{
               response.redirect("/");
          }
    });
}
