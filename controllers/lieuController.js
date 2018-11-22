

var mongoose = require('mongoose');
var moment = require('moment');
var Lieu = mongoose.model('Lieu'),
    Village = mongoose.model('Village');



exports.lieu=function(request, response) {
    request.visitor.pageview(request.url,request.hostname,"Lieu").send();
	 var lieuId = request.query.lieuId;
     var villageId = request.query.villageId;
	if(typeof lieuId !== undefined && lieuId!="undefined" && lieuId!="" ) {
        Lieu.findOne({_id: lieuId}).exec(function (err, lieuAModifier) {
        	 console.log(lieuAModifier);
            afficherPageLieu(villageId,response, lieuAModifier);
        });
    }
	else{
    	afficherPageLieu(villageId,response);
	}
};

exports.ajoutlieu= function(request, response) {
    var villageId = request.body.villageId;
    var nom = request.body.nom;
    var id = request.body.id;
    var latitude = request.body.latitude;
    var longitude = request.body.longitude;
    var adresse = request.body.adresse;
    if(request.body.dateDebut!= undefined && request.body.horaireDebut!= undefined){
        var dateDebutFormat= Date.parse( request.body.dateDebut+" "+request.body.horaireDebut+"Z");
    }
    if(request.body.dateFin!= undefined && request.body.horaireFin!= undefined){
        var dateFinFormat= Date.parse(request.body.dateFin+" "+request.body.horaireFin+"Z");
    }
    if( typeof request.body.dateDebut2  !== undefined && request.body.dateDebut2!=null){
		var dateDebutFormat2 = Date.parse( request.body.dateDebut2+" "+request.body.heureDebut2);
		var dateFinFormat2 = Date.parse(request.body.dateFin2+" "+request.body.heureFin2);
    }

 
    var coordonnees={ latitude:  latitude, longitude :  longitude };

    if( typeof id  !== undefined && id!="undefined" && id!=""){

        Lieu.findOne({ _id: id}, function (err, lieu){
		  lieu.nom = nom;
		  lieu.coordonnees.latitude=latitude;
		  lieu.coordonnees.longitude=longitude;
           if( typeof dateDebutFormat  !== undefined && dateFinFormat!=null){
              lieu.disponibilites[0]=({dateDebut:dateDebutFormat,dateFin:dateFinFormat});
          }
		  
          lieu.adresse=adresse;
		  if( typeof dateDebutFormat2  !== undefined && dateDebutFormat2!=null){
			  lieu.disponibilites[1].dateDebut=dateDebutFormat2;
		 	  lieu.disponibilites[1].dateFin=dateFinFormat2;
		  }
		  lieu.save(function (err){
			  console.log("Lieu "+ nom +" updaté dans la base. : "+ lieu);
              request.visitor.event("Modification","Modification du ieu "+ lieu.nom).send();
              afficherPageLieu(villageId,response,lieu);
		  });
		  
		});

    }
    else{
    	
        var lieuAInserer = new Lieu({ nom: nom,adresse:adresse,
        coordonnees : coordonnees});
        if( typeof dateDebutFormat  !== undefined && dateFinFormat!=null){
            lieuAInserer.disponibilites[0]=({dateDebut:dateDebutFormat,dateFin:dateFinFormat});
        }
        lieuAInserer.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Lieu "+ nom +" inseré dans la base.");
            }
          
            ajouterLieuVillage(villageId,lieuAInserer,request,response);
        });

    }
};

function ajouterLieuVillage(villageId,lieu,request,response){
   Village.findById(villageId).populate('_lieux ').exec(function (err, village) {
       village._lieux=village._lieux.concat([lieu]);
        village.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Lieu "+ lieu.nom +" ajoute au villate" +village.nom);
                request.visitor.event("Ajout","Lieu "+ lieu.nom +" ajoute au villate" +village.nom).send();
            }
             afficherPageLieu(villageId,response,lieu);
         });
    });
}

function afficherPageLieu(villageId,response){
    afficherPageLieu(villageId,response,null);
}

function afficherPageLieu(villageId,response,lieuAModifier){
    Village.findById(villageId).populate('_lieux').populate('_participants').populate('_benevoles').populate('_referents').populate('_porteurs').exec(function (err, village) {
        if (typeof village !== "undefined" && village !== null){
            response.render('pages/lieu', {village:village,lieux: village._lieux,lieuAModifier:lieuAModifier, moment: moment});
        } else{
                 response.redirect("/");
            }
    });
}