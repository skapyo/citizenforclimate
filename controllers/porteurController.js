
/*!
 * Module dependencies.
 */


var mongoose = require('mongoose');
var request = require("request")
var  Porteur = mongoose.model('Porteur')
    ,Lieu = mongoose.model('Lieu')
    ,Activite = mongoose.model('Activite')
    ,Village = mongoose.model('Village');
const NodeCache = require( "node-cache" );
const myCache = new NodeCache();
var he = require('he');

var jsonld_request = require('jsonld-request');

exports.recherche= function(request, response) {
    var rechercheNomPorteur = request.body.rechercheNomPorteur;
    var rechercheNomLieu = request.body.rechercheNomLieu;
    var rechercheNomActivite = request.body.rechercheNomActivite;
    var rechercheElementDescriptionActivite = request.body.rechercheElementDescriptionActivite;
    var query ={};
    if(rechercheNomActivite!=null && rechercheNomActivite!=''){
        query["nom"] = {$regex : new RegExp("\w*"+rechercheNomActivite+"\\w*",'i')};
    }
    if(rechercheElementDescriptionActivite!=null && rechercheElementDescriptionActivite!=''){
        query["description"] = {$regex : new RegExp("\w*"+rechercheElementDescriptionActivite+"\\w*",'i')};
    }
    if(rechercheNomPorteur!=null && rechercheNomPorteur!=''){
        var queryPorteur ={};
        queryPorteur["nom"] = {$regex : new RegExp("\w*"+rechercheNomPorteur+"\\w*",'i')};
        console.log("rechercheNomPorteur" + rechercheNomPorteur + query);
        var porteurId="";
        Porteur.find(queryPorteur).exec(function(err, porteurs) {
            if (porteurs!=null) {
                var porteurIds=[];
                porteurs.forEach(function(porteur) {
                    porteurIds.push( new mongoose.Types.ObjectId( porteur._id ) );
                });
                query["_porteurs"]={$in : porteurIds};
            }
            Activite.find(query).populate('_lieux _porteurs').exec(function(err, activites) {
                response.render('pages/accueil',{activites: activites});
            });
        });
    }
    else{
        Activite.find(query).populate('_lieux _porteurs').exec(function(err, activites) {
            response.render('pages/accueil',{activites: activites});
        });
    }
};

exports.porteur=  function(request, response) {
    request.visitor.pageview(request.url,request.hostname,"Porteur").send();
    var porteurId = request.query.porteurId;
    var villageId = request.query.villageId;
    if(typeof porteurId !== undefined && porteurId!="undefined" && porteurId!="" ) {
        Porteur.findOne({_id: porteurId}).exec(function (err, porteurAModifier) {
          if (typeof porteurAModifier !== "undefined" && porteurAModifier !== null){
            afficherPagePorteur(villageId,response, porteurAModifier);
          }
          else{
            afficherPagePorteur(villageId,response);
        }
        });
    }
    else{
        afficherPagePorteur(villageId,response);
    }
};

exports.ajoutPorteur=function(request, response) {
    var nom = request.body.nom;
    var description = request.body.description;
    var id = request.body.id;
    var quartier = request.body.quartier;
    var siteWeb = request.body.siteWeb;
    var questionJeu = request.body.questionJeu;
    var villageId = request.body.villageId;
    var adresseMail = request.body.adresseMail;

    if( typeof id  !== undefined && id!="undefined" && id!=""){

        Porteur.findOne({ _id: id}, function (err, porteur){
            porteur.nom = nom;
            porteur.description=description;
            porteur.quartier=quartier;
            porteur.siteWeb=siteWeb;
            porteur.questionJeu=questionJeu;
            porteur.adresseMail=adresseMail;
            porteur.save(function (err){
             if (err) {
                console.log(err);
            } else {
                console.log("Porteur "+ nom +" updaté dans la base.");
                
            }
                request.visitor.event("Modification","Modification du porteur "+ nom).send();
                afficherPagePorteur(villageId,response,porteur);
            });

        });

    }
    else{
        var porteurAInserer = new Porteur({ nom: nom, description :description,quartier:quartier,siteWeb:siteWeb,questionJeu:questionJeu,adresseMail:adresseMail });
        porteurAInserer.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Porteur "+ nom +" inseré dans la base.");
                
                ajouterPorteurVillage(villageId,porteurAInserer,request,response);

            }
        });
    }
};

function ajouterPorteurVillage(villageId,porteur,request,response){
   Village.findById(villageId).populate('_porteurs ').exec(function (err, village) {
        village._porteurs=village._porteurs.concat([porteur]);
        village.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Porteur "+ porteur.nom +" ajoute au village " +village.nom);
                request.visitor.event("Ajout","Porteur "+ porteur.nom +" ajoute au village " +village.nom).send();
            }
             afficherPagePorteur(villageId,response,porteur);
         });
    });
}

function afficherPagePorteur(villageId,response){
    afficherPagePorteur(villageId,response,null);
}
function afficherPagePorteur(villageId,response,porteurAModifier){

    myCache.get( "porteurs", function( err, porteursExistant ){
        if( !err ){
            if(porteursExistant == undefined){
                // Recuperation du json comportant les porteurs
                var url = "https://semantic-bus.org/data/api/PWA_All"

                  request({
                    url: url,
                    json: true,
                    timeout: 1000
                }, function (error, re, recuperationPorteurExistant) {
                    success = myCache.set( "porteurs", recuperationPorteurExistant, 10000 );
                    Village.findById(villageId).populate('_porteurs ').populate('_participants').populate('_benevoles').populate('_referents').populate('_porteurs').exec(function (err, village) {
                        if (typeof village !== "undefined" && village !== null){
                            console.log("rafraichissement du  cache du bus semantic")
                            response.render('pages/porteur', {village:village,porteurs: village._porteurs,porteurAModifier:porteurAModifier,porteursExistant:recuperationPorteurExistant,he:he});
                        }
                        else{
                             response.redirect("/");
                        }
                    });
                });
            }else{
                Village.findById(villageId).populate('_porteurs ').populate('_participants').populate('_benevoles').populate('_referents').populate('_porteurs').exec(function (err, village) {
                    if (typeof village !== "undefined" && village !== null){
                        response.render('pages/porteur', {village:village,porteurs: village._porteurs,porteurAModifier:porteurAModifier,porteursExistant:porteursExistant,he:he});
                      }
                    else{
                         response.redirect("/");
                    }
                });
            }
        }
    });
}