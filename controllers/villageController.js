
/*!
 * Module dependencies.
 */

var mongo = require('mongodb');
var mongoose = require('mongoose');
var fs = require('fs');
var  Village = mongoose.model('Village')
    ,Lieu = mongoose.model('Lieu')
    ,Porteur = mongoose.model('Porteur')
    ,Activite = mongoose.model('Activite'),
    Utilisateur = mongoose.model('Utilisateur'),
    Engagement = mongoose.model('Engagement'),
    InformationParticipantEngagement = mongoose.model('InformationParticipantEngagement'),

    InformationParticipantFormation = mongoose.model('InformationParticipantFormation');
var moment = require('moment');

var conn = mongoose.connection;
var multer = require('multer');
const nodemailer = require('nodemailer');

var mailerhbs = require('nodemailer-express-handlebars');
const querystring = require('querystring');
const url = require('url');


/** API path that will upload the files */



exports.editionVillage=  function(request, response) {

    var villageId = request.query.villageId;
    // console.log(villageId);
    if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findOne({_id: villageId}).populate('_porteurs ').populate('_participants').populate('_benevoles').populate('_referents').populate('_porteurs').exec(function (err, villageAModifier) {
            afficherPageEdtionVillage(response, villageAModifier);
        });
    }
    else{
        afficherPageEdtionVillage(response);
    }

};

exports.ajoutVillage=function(request, response) {
    var nom = request.body.nom;
    var description = request.body.description;
    var article = request.body.article;
    var id = request.body.id;
    var nombrePersonnesAttendues = request.body.nombrePersonnesAttendues;
    var latitude = request.body.latitude;
    var longitude = request.body.longitude;
    var niveauZoom = request.body.niveauZoom;
    var coordonnees={ latitude:  latitude, longitude :  longitude };
    var activite = request.body.activite;
    var dateDebutFormat = Date.parse( request.body.dateDebut+" "+request.body.horaireDebut+"Z");
    var dateFinFormat = Date.parse(request.body.dateFin+" "+request.body.horaireFin+"Z");
    var inscriptionReferent = "on"==request.body.inscriptionReferent;
    var inscriptionBenevole = "on"==request.body.inscriptionBenevole;
    var inscriptionVisiteur = "on"==request.body.inscriptionVisiteur;
    var inscriptionOrganisateur = "on"==request.body.inscriptionOrganisateur;
    var publication  = "on"==request.body.publication;
    var afficherHoraire= "on"==request.body.afficherHoraire;
    var estPreTour= "on"==request.body.estPreTour;
    var estTourEtendu= "on"==request.body.estTourEtendu;
    var facebookUrl = request.body.facebookUrl;
    var estMarche= "on"==request.body.estMarche;
    var estClimateFriday= "on"==request.body.estClimateFriday;
    var imagePourcentage = request.body.imagePourcentage;
    var emailContact = request.body.emailContact;
    var horsTour = request.body.horsTour;
    var lienFormulaireBenevole = request.body.lienFormulaireBenevole;
    var horsFetesDesPossible = "on"==request.body.horsFetesDesPossible;
    if( typeof id  !== undefined && id!="undefined" && id!=""){
        Village.findById(id).populate('_porteurs ').populate('_participants').populate('_benevoles').populate('_referents').populate('_porteurs').exec(function (err, village) {
            village.nom = nom;
            village.description=description;
            if(nombrePersonnesAttendues!= undefined && nombrePersonnesAttendues!=''){
                village.nombrePersonnesAttendues=nombrePersonnesAttendues;
            }
            village.coordonnees.latitude=latitude;
            village.coordonnees.longitude=longitude;
            village.niveauZoom=niveauZoom;
            village.article=article;
            village._horairesOuvertures[0]=({dateDebut:dateDebutFormat,dateFin:dateFinFormat});
            village.inscriptionReferent=inscriptionReferent;
            village.inscriptionBenevole=inscriptionBenevole;
            village.inscriptionVisiteur=inscriptionVisiteur;
            village.inscriptionOrganisateur=inscriptionOrganisateur;
            village.publication=publication;
            village.afficherHoraire=afficherHoraire;
            village.facebookUrl=facebookUrl;
            village.estPreTour=estPreTour;
            village.estTourEtendu=estTourEtendu;
            village.estMarche=estMarche;
            village.estClimateFriday=estClimateFriday;
            village.imagePourcentage=imagePourcentage;
            village.emailContact=emailContact;
            village.lienFormulaireBenevole=lienFormulaireBenevole;

            if(horsTour != undefined && typeof horsTour!= undefined && horsTour!=""){
                village.horsTour=horsTour;
            }
            village.horsFetesDesPossible=horsFetesDesPossible;


            village.save(function (err){
                console.log("Village "+ nom +" updaté dans la base.");
                afficherPageEdtionVillage(response,village);
            });


        });

    }
    else{
        var villageAInserer = new Village({ nom: nom, description :description,
            article:article,
            nombrePersonnesAttendues:nombrePersonnesAttendues,
            coordonnees : coordonnees,
            niveauZoom:niveauZoom,
            _horairesOuvertures :[{dateDebut:dateDebutFormat,dateFin:dateFinFormat}],
            inscriptionReferent:inscriptionReferent,
            inscriptionBenevole:inscriptionBenevole,
            inscriptionVisiteur:inscriptionVisiteur,
            inscriptionOrganisateur:inscriptionOrganisateur,
            publication:publication,
            facebookUrl:facebookUrl,
            estMarche:estMarche,
            afficherHoraire:afficherHoraire
        });


        villageAInserer.save(function (err) {
            if (err) {
                console.log(err);
            } else {
                console.log("Village "+ nom +" inseré dans la base.");
            }
            afficherPageEdtionVillage(response,villageAInserer);

        });
    }
};

function afficherPageEdtionVillage(response){
    afficherPageEdtionVillage(response,null);
}
function afficherPageEdtionVillage(response,villageAModifier){
    Village.find({}, function(err, villages) {
        Lieu.find({}, function(err, lieux) {
            Porteur.find({}, function(err, porteurs) {
                response.render('pages/editionVillage', {villages: villages,villageAModifier:villageAModifier,village:villageAModifier,lieux:lieux,porteurs:porteurs,moment:moment});
            });
        });
    });
}


exports.ajoutParticipant=function(request, response) {
    var villageId = request.query.villageId;
    var participant =request.user;
    if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findById(villageId).exec(function (err, village) {
            if(village!=null){
                village._participants=village._participants.concat([participant]);
                village.save(function (err){
                    console.log("Ajout du participant "+ participant.prenom + " "+ participant.nom+" au village "+village.nom);
                    request.visitor.event("Ajout", "Ajout du participant "+ participant.prenom + " "+ participant.pnom+" au village "+village.nom).send();
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}
exports.ajoutInteresse=function(request, response) {
    var villageId = request.query.villageId;
    var participant =request.user;
    if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findById(villageId).exec(function (err, village) {
            if(village!=null){
                village._interesses=village._interesses.concat([participant]);
                village.save(function (err){
                    console.log("Ajout d'un interesse "+ participant.prenom + " "+ participant.nom+" au village "+village.nom);
                    request.visitor.event("Ajout", "Ajout de l'interesse "+ participant.prenom + " "+ participant.pnom+" au village "+village.nom).send();
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}
function envoiMailNouveauBenevole(village,participant,message,estOrganisateur){
    var emailTo='';
    var emailcc='';
    var emailReferent='';


    if(village.emailContact==''){
        emailTo='emailToReplace'
    }else{
        emailTo=village.emailContact;
    }
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port :25,
        secure: false,
        auth: {
            user: "emailToReplace", // generated ethereal user
            pass: "emailPassword" // generated ethereal password
        }
    });
    transporter.use('compile', mailerhbs({
        viewPath: './public/email', //Path to email template folder
        extName: '.hbs' //extendtion of email template
    }));


    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Outil gestion marche" <emailToReplace>', // sender address
        to: emailTo, // list of receivers,
        cc:emailcc,
        subject: '[Ensemble pour le climat][Outil marche] Nouveau bénévole ', // Subject line
        template: 'nouveauBenevole', //Name email file template
        context: { // pass variables to template
            villageId:village.id,
            prenom:participant.prenom,
            nom:participant.nom,
            email:participant.adresseMail,
            benevoleId:participant.id,
            nomEtape:village.nom,
            estOrganisateur:estOrganisateur,
            message:message

        }


    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
});

}

exports.ajoutBenevole=function(request, response) {
    var villageId = request.body.villageId;
    request.query.villageId=villageId;
    var participant =request.user;
    if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findById(villageId).exec(function (err, village) {
            if(village!=null){
                village._benevoles=village._benevoles.concat([participant]);
                village.save(function (err){
                    console.log("Ajout du Benevole "+ participant.nom + " "+ participant.prenom+" au village "+village.nom);
                    request.visitor.event("Ajout", "Ajout du Benevole "+ participant.nom + " "+ participant.prenom+" au village "+village.nom).send();
                    envoiMailNouveauBenevole(village,participant,request.body.contactMessage,false);
                    if( village.lienFormulaireBenevole!== undefined && village.lienFormulaireBenevole!="undefined" && village.lienFormulaireBenevole!="" ){
                        response.redirect(village.lienFormulaireBenevole);
                        return;
                    }
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}
exports.ajoutPorteur=function(request, response) {

    afficherVillage(request, response);

}
exports.ajoutOrganisateur=function(request, response) {
    var villageId = request.body.villageId;
    request.query.villageId=villageId;
    var participant =request.user;
    if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findById(villageId).exec(function (err, village) {
            if(village!=null){
                village._organisateurs=village._organisateurs.concat([participant]);
                village.save(function (err){
                    console.log("Ajout d'un organisateur  "+ participant.nom + " "+ participant.prenom+" au village "+village.nom);
                    request.visitor.event("Ajout", "Ajout d'un organisateur "+ participant.prenom + " "+ participant.nom+" au village "+village.nom).send();
                    envoiMailNouveauBenevole(village,participant,request.body.contactMessage,true);
                    if( village.lienFormulaireBenevole!== undefined && village.lienFormulaireBenevole!="undefined" && village.lienFormulaireBenevole!="" ){
                        response.redirect(village.lienFormulaireBenevole);
                        return;
                    }
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}

exports.ajoutParticipantActivite=function(request, response) {
    var activiteId = request.query.activiteId;
    var participant =request.user;
    if(typeof activiteId !== undefined && activiteId!="undefined" && activiteId!="" ) {
        Activite.findById(activiteId).exec(function (err, activite) {
            if(activite!=null){
                activite._participants=activite._participants.concat([participant]);
                activite.save(function (err){
                    console.log("Ajout de du participant "+ participant.nom + " "+ participant.prenom+" à l'activite village "+activite.nom);
                    request.visitor.event("Ajout","Ajout de du participant "+ participant.prenom + " "+ participant.nom+" à l'activite village "+activite.nom).send();
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}

exports.ajoutParticipantActiviteFormation=function(request, response) {

    var activiteId = request.query.activiteId;
    var participant =request.user;
    var ville = request.query.ville;
    var codePostal = request.query.codePostal;
    var tel = request.query.tel;


    var estANV = "on"==request.query.estANV;
    var estAlternatiba = "on"==request.query.estAlternatiba;
    var estAmisDeLaTerre = "on"==request.query.estAmisDeLaTerre;
    var autres = request.query.autres;
    var connaissanceCritereNonViolence = request.query.connaissanceCritereNonViolence;
    var commentaire = request.query.commentaire;
    var participationAction = request.query.participationAction;
    var participationActionAvecGroupe = request.query.participationActionAvecGroupe;
    var nonDisponible= request.query.nonDisponible;
    var anneeNaissance= request.query.anneeNaissance;
    var age = request.query.age;


    Utilisateur.findById(participant.id).exec(function (err, utilisateur) {
        utilisateur.ville=ville;
        utilisateur.codePostal=codePostal;
        utilisateur.telephone=tel;
        //utilisateur.dateNaissance=Date.parse(anneeNaissance);
        utilisateur.age=age;
        utilisateur.save(function (err){

        });
    });
    if(typeof activiteId !== undefined && activiteId!="undefined" && activiteId!="" ) {
        Activite.findById(activiteId).exec(function (err, activite) {
            if(activite!=null){
                activite._participants=activite._participants.concat([participant]);

                var informationParticipantFormation = new InformationParticipantFormation();
                informationParticipantFormation.participant=participant;
                informationParticipantFormation.commentaire=commentaire;
                informationParticipantFormation.connaissanceCritereNonViolence=connaissanceCritereNonViolence;
                informationParticipantFormation.estGroupeANV=estANV,
                    informationParticipantFormation.estGroupeAlternatiba=estAlternatiba;
                informationParticipantFormation.estGroupeAmisDeLaTerre=estAmisDeLaTerre,
                    informationParticipantFormation.autresGroupe=autres;
                informationParticipantFormation.participationAction=participationAction;
                informationParticipantFormation.participationActionAvecGroupe=participationActionAvecGroupe;
                if(nonDisponible!= undefined && nonDisponible!=""){
                    informationParticipantFormation.nonDisponible=nonDisponible;
                }
                if(request.query.horaireDebut!= undefined && request.query.horaireDebut!="" && request.query.horaireFin!=""){
                    var dateDebutFormat = Date.parse( moment.utc(activite.disponibilites[0].dateDebut).format('YYYY-MM-DD')+" "+request.query.horaireDebut+"Z");
                    var dateFinFormat = Date.parse(moment.utc(activite.disponibilites[0].dateFin).format('YYYY-MM-DD')+" "+request.query.horaireFin+"Z");
                    informationParticipantFormation.disponibilites=({dateDebut:dateDebutFormat,dateFin:dateFinFormat});

                }
                activite._informationParticipantFormation=activite._informationParticipantFormation.concat([informationParticipantFormation]);
                informationParticipantFormation.save(function (errInfo){
                    activite.save(function (err){
                        console.log("Ajout de du participant "+ participant.nom + " "+ participant.prenom+" à l'activite village "+activite.nom);
                        request.visitor.event("Ajout","Ajout de du participant "+ participant.prenom + " "+ participant.nom+" à l'activite village "+activite.nom).send();
                        Village.findById(request.query.villageId).exec(function (err, village) {
                            envoiMailActiviteFormation(village,activite,participant)
                        });
                        afficherVillage(request, response);
                    });
                });
            }
            else{
                afficherVillage(request, response);
            }
        });
    }
}


exports.ajoutParticipantEngagement=function(request, response) {

    var engagementId = request.query.engagementId;
    var participant =request.user;


    Village.findById(request.query.villageId).populate(" _engagements _engagements._informationParticipantEngagement ").exec(function (err, village) {
        InformationParticipantEngagement.populate(village,'_engagements._informationParticipantEngagement', function(err, villageavecEngagement){
            villageavecEngagement._engagements.forEach(function(engagement) {

            if( request.query[engagement.id] !=undefined){
                var informationParticipantEngagement;

                engagement._informationParticipantEngagement.forEach(function(informationParticipantEngagementFind) {
                if(participant._id.equals(informationParticipantEngagementFind.participant._id)){
                    informationParticipantEngagement=informationParticipantEngagementFind;

                }
                });
                if(informationParticipantEngagement==undefined){
                    informationParticipantEngagement = new InformationParticipantEngagement();
                    informationParticipantEngagement.participant=participant;
                    if(engagement._informationParticipantEngagement==undefined){
                        engagement._informationParticipantEngagement=[];
                    }
                    engagement._informationParticipantEngagement=engagement._informationParticipantEngagement.concat([informationParticipantEngagement]);
                }
                informationParticipantEngagement.statutEngagement=request.query[engagement.id];


                informationParticipantEngagement.save(function (errInfo){
                    engagement.save(function (err){
                        console.log("Ajout de du participant "+ participant.nom + " "+ participant.prenom+" à l'engagement "+engagement.nom);
                        request.visitor.event("Ajout","Ajout de du participant "+ participant.prenom + " "+ participant.nom+" à l'engagement "+engagement.nom).send();


                    });
                });
            }
            else{
               // afficherVillage(request, response);
            }
        });
        Village.findById(request.query.villageId).exec(function (err, village) {
            envoiMailEngagement(village,participant)
        });
        afficherVillage(request, response);
    });
    });
}

function envoiMailEngagement(village,participant){
    var emailTo='';
    var emailcc='';
    var emailReferent='';


    emailTo=participant.adresseMail;
    emailcc
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port :25,
        secure: false,
        auth: {
            user: "emailToReplace", // generated ethereal user
            pass: "emailPassword" // generated ethereal password
        }
    });
    transporter.use('compile', mailerhbs({
        viewPath: './public/email', //Path to email template folder
        extName: '.hbs' //extendtion of email template
    }));


    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Outil gestion marche" <emailToReplace>', // sender address
        to: emailTo, // list of receivers,
        cc:emailcc,
        subject: "[Ensemble pour le climat][Outil marche] Bravo pour les engagements que tu as pris ", // Subject line
        template: 'inscriptionEngagement', //Name email file template
        context: { // pass variables to template
            villageId:village.id,
            prenom:participant.prenom,
            nom:participant.nom,
            nomMarche:village.nom,
        }


    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
});

}


function envoiMailActiviteFormation(village,activite,participant){
    var emailTo='';
    var emailcc='';
    var emailReferent='';


    emailTo=participant.adresseMail;
    emailcc
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port :25,
        secure: false,
        auth: {
            user: "emailToReplace", // generated ethereal user
            pass: "emailPassword" // generated ethereal password
        }
    });
    transporter.use('compile', mailerhbs({
        viewPath: './public/email', //Path to email template folder
        extName: '.hbs' //extendtion of email template
    }));


    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Outil gestion marche" <emailToReplace>', // sender address
        to: emailTo, // list of receivers,
        cc:emailcc,
        subject: "[Ensemble pour le climat][Outil marche] Ton inscription à la formation à l'action non-violente a bien été enregistrée", // Subject line
        template: 'inscriptionFormation', //Name email file template
        context: { // pass variables to template
            villageId:village.id,
            prenom:participant.prenom,
            nom:participant.nom,
            nomEtape:village.nom,
            activiteId:activite.id
        }


    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
});

}

// ----------------------- Suppression ------------------------------


exports.suppressionParticipant=function(request, response) {
    var villageId = request.query.villageId;
    var participant =request.user;
    if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findById(villageId).exec(function (err, village) {
            if(village!=null){
                village._participants.remove(participant);
                village.save(function (err){
                    console.log("suppression du participant "+ participant.prenom + " "+ participant.nom+" au village "+village.nom);
                    request.visitor.event("Suppression","Suppression du participant "+ participant.prenom + " "+ participant.nom+" au village "+village.nom).send();
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}

exports.suppressionInteresse=function(request, response) {
    var villageId = request.query.villageId;
    var participant =request.user;
    if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findById(villageId).exec(function (err, village) {
            if(village!=null){
                village._interesses.remove(participant);
                village.save(function (err){
                    console.log("suppression de l'interesse "+ participant.prenom + " "+ participant.nom+" au village "+village.nom);
                    request.visitor.event("Suppression","Suppression de l'interesse "+ participant.prenom + " "+ participant.nom+" au village "+village.nom).send();
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}

exports.suppressionBenevole=function(request, response) {
    var villageId = request.query.villageId;
    var participant =request.user;
    if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findById(villageId).exec(function (err, village) {
            if(village!=null){
                village._benevoles.remove(participant);
                village.save(function (err){
                    console.log("suppression du Benevole "+ participant.prenom + " "+ participant.nom+" au village "+village.nom);
                    request.visitor.event("Suppression","Suppression du bénévole "+participant.prenom + " "+ participant.nom+" au village "+village.nom).send();
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}
exports.suppressionPorteur=function(request, response) {

    afficherVillage(request, response);

}
exports.suppressionOrganisateur=function(request, response) {
    var villageId = request.query.villageId;
    var participant =request.user;
    if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findById(villageId).exec(function (err, village) {
            if(village!=null){
                village._organisateurs.remove(participant);
                village.save(function (err){
                    console.log("suppression de l'organisateur "+ participant.prenom + " "+ participant.nom+" au village "+village.nom);
                    request.visitor.event("Suppression","Suppression de l'organisateur "+ participant.prenom + " "+ participant.nom+" au village "+village.nom).send();
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}
exports.suppressionParticipantActivite=function(request, response) {
    var activiteId = request.query.activiteId;
    var participant =request.user;
    if(typeof activiteId !== undefined && activiteId!="undefined" && activiteId!="" ) {
        Activite.findById(activiteId).populate("_informationParticipantFormation _informationParticipantFormation.participant").exec(function (err, activite) {
            if(activite!=null){
                activite._participants.remove(participant);
                activite._informationParticipantFormation.forEach(function(informationParticipantFormation) {
                    InformationParticipantFormation.populate(informationParticipantFormation,'participant', function(err, informationParticipantFormationPopule){
                        if(informationParticipantFormationPopule.participant.id==participant.id){
                            activite._informationParticipantFormation.remove(informationParticipantFormation);
                            informationParticipantFormation.remove();
                        }
                        activite.save(function (err){});
                    });
                });


                activite.save(function (err){
                    console.log("suppression de du participant "+ participant.prenom + " "+ participant.nom+" à l'activite village "+activite.nom);
                    request.visitor.event("Suppression","Suppression de du participant "+ participant.prenom + " "+ participant.nom+" à l'activite village "+activite.nom).send();
                    afficherVillage(request, response);
                });
            }
            else{
                afficherVillage(request, response);
            }
        });

    }
}




exports.afficherVillage=function(request, response) {
    return afficherVillage(request,response);
}

function afficherVillage(request, response) {
    var villageId = request.query.villageId;
    var activiteId = request.query.activiteId;
    var afficherEngagement=request.query.afficherEngagement;
    var language=request.query.clang;

    if(villageId !== undefined && typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
        Village.findById(villageId).populate('_activites').populate('_participants').populate('_interesses').populate('_benevoles').populate('_organisateurs').populate('_referentsNonValides').populate('_referents').populate('_porteurs').populate('_engagements').populate('_engagements._informationParticipantEngagement').exec(function (err, village) {
            if (typeof village !== "undefined" && village !== null){

                var lieux= new Map();
                var activiteParlieux={};
                InformationParticipantEngagement.populate(village,'_engagements._informationParticipantEngagement', function(err, villageavecEngagement){
                    Porteur.populate(villageavecEngagement,'_activites._porteurs', function(err, villageActiviteAvecPorteur){
                        Lieu.populate(villageActiviteAvecPorteur,'_activites._lieux ', function(err, results){
                            results._activites.forEach(function(activite) {

                                if(typeof activite !== "undefined" && activite !== null && typeof activite._lieux !== "undefined" &&  activite._lieux!=null){

                                    activite._lieux.forEach(function(lieu) {
                                        if(lieux[lieu._id]==null){
                                            lieux.set(lieu._id,lieu);
                                        }
                                        if(activiteParlieux[lieu._id]==null){
                                            activiteParlieux[lieu._id]=[];
                                        }

                                        activiteParlieux[lieu._id].push(activite)+"</p>";

                                    });
                                }

                            });
                            console.log("Affichage du village : " +village.nom );
                            request.visitor.pageview(request.url,request.hostname,village.nom).send();
                            response.render('pages/village', {village:village,activites: village._activites,lieux:lieux,activiteParlieux:activiteParlieux,moment:moment,Activite:Activite,Porteur:Porteur,activiteId:activiteId,afficherEngagement:afficherEngagement});
                        });
                    });
                });
            }
            else{
                response.redirect("/");
            }
        });


    }
    else{
        response.redirect(querystring.unescape(request.url));
    }

};


exports.afficherData=function(request, response) {
    return afficherData(request,response);
}

function afficherData(request, response) {
    Utilisateur.findById(request.user._id,function (error, utilisateur) {

        console.log("Affichage des data : ");
        request.visitor.pageview(request.url, request.hostname, "Affichage des data").send();
        var utilisateursSansVillage = [];
        var porteurAvecVillage = new Array();
        var utilisateurAvecVillage = new Array();
        Utilisateur.find().exec(function (err, toutLesutilisateurs) {

            Village.find().populate('_activites').populate('_activites._participant').populate('_participants').populate('_interesses').populate('_benevoles').populate('_organisateurs').populate('_referentsNonValides').populate('_referents').populate('_porteurs').exec(function (err, toutLesVillages) {


                toutLesVillages.forEach(function (village) {

                    village._participants.forEach(function (participant) {
                        utilisateurAvecVillage.push(participant);
                        participant.statut = "participants";
                        participant.village = village;


                    });
                    village._interesses.forEach(function (participant) {
                        utilisateurAvecVillage.push(participant);
                        participant.statut = "interesses";
                        participant.village = village;

                    });
                    village._organisateurs.forEach(function (participant) {
                        utilisateurAvecVillage.push(participant);
                        participant.statut = "organisateurs";
                        participant.village = village;

                    });
                    Utilisateur.populate(village, '_activites._participants ', function (err, villagesReferentAvecParticipants) {

                        villagesReferentAvecParticipants._activites.forEach(function (activite) {
                            if (activite.typeActivite == "Formation") {
                                activite._participants.forEach(function (participant) {
                                    participant.statut = "formation";
                                    participant.village = village;
                                    utilisateurAvecVillage.push(participant);
                                });
                            }
                        });
                    });
                });


                // toutLesutilisateurs.forEach(function(user) {
                //     var isSansVillage=true;
                //     utilisateurAvecVillage.forEach(function(userVillage) {
                //         if(userVillage.id==user.id){
                //             isSansVillage=false;
                //         }
                //
                //     });
                //     if(isSansVillage){
                //         utilisateursSansVillage.push(user);
                //     }
                // });


                response.render('pages/data', {
                    utilisateur: utilisateur,
                    Utilisateur: Utilisateur,
                    moment: moment,
                    utilisateurAvecVillage: utilisateurAvecVillage
                });

            });
        });
    });

};


exports.afficherRecherche=function(request, response) {

    afficherRecherche(request,response,"");
};
exports.ajoutFormation=function(request, response) {

    afficherRecherche(request,response,"");
};

function afficherRecherche(request,response,query){
    var villageId = request.body.villageId;
    console.log(query);
    Village.findById(villageId).populate('_porteurs').populate('_activites').populate('_participants').populate('_benevoles').populate('_organisateurs').exec(function (err, village){
        if (typeof village !== "undefined" && village !== null){
            var activitesIds=[];
            village._activites.forEach(function(activite) {
                activitesIds.push(mongoose.Types.ObjectId( activite.id ) );
            });
            query["_id"]={$in : activitesIds};
        }
        Activite.find(query).populate('_lieux _porteurs').exec(function (err, activites) {
            var lieux= new Map();
            var activiteParlieux={};
            if (typeof activites !== "undefined" && activites !== null){
                activites.forEach(function(activite) {
                    if(typeof activite !== "undefined" && activites !== null && activite!=null && typeof activite._lieux !== "undefined" &&  activite._lieux!=null){
                        activite._lieux.forEach(function(lieu) {
                            if(lieux[lieu._id]==null){
                                lieux.set(lieu._id,lieu);
                            }
                            if(activiteParlieux[lieu._id]==null){
                                activiteParlieux[lieu._id]=[];
                            }
                            activiteParlieux[lieu._id].push(activite)+"</p>";
                        });
                    }
                });
            }
            request.visitor.event("recherche", query).send();
            response.render('pages/village', {village:village,activites: activites,lieux:lieux,activiteParlieux:activiteParlieux,moment:moment,Activite:Activite,Porteur:Porteur});
        });
    });

}

exports.recherche= function(request, response) {
    var rechercheNomPorteur = request.body.rechercheNomPorteur;
    var rechercheNomLieu = request.body.rechercheNomLieu;
    var rechercheNomActivite = request.body.rechercheNomActivite;
    var rechercheElementDescriptionActivite = request.body.rechercheElementDescriptionActivite;
    var typeActivite=  request.body.typeActivite;
    var dateMin=  request.body.dateMin;
    var dateMax=  request.body.dateMax;
    var quartierPorteur=  request.body.quartierPorteur;

    var query ={};
    if(rechercheNomActivite!=null && rechercheNomActivite!=''){
        query["nom"] = {$regex : new RegExp("\w*"+rechercheNomActivite+"\\w*",'i')};
    }
    if(typeActivite!=null && typeActivite.size!=0){
        query["typeActivite"] = {$in : typeActivite};
    }
    if(rechercheElementDescriptionActivite!=null && rechercheElementDescriptionActivite!=''){
        query["description"] = {$regex : new RegExp("\w*"+rechercheElementDescriptionActivite+"\\w*",'i')};
    }
    if(dateMin!=null && dateMax!=null){
        var dateDebutFormat = Date.parse( dateMin+"Z");
        var dateFinFormat = Date.parse(dateMax+"Z");
        query["disponibilites.dateDebut"] = { $gte: dateDebutFormat };
        query["disponibilites.dateFin"] = { $lte: dateFinFormat };
    }

    if((rechercheNomPorteur!=null && rechercheNomPorteur!='') || (quartierPorteur!=null && quartierPorteur.size!=0)){

        var queryPorteur ={};
        queryPorteur["nom"] = {$regex : new RegExp("\w*"+rechercheNomPorteur+"\\w*",'i')};
        if(quartierPorteur!=null ){
            queryPorteur["quartier"] = {$in : quartierPorteur};
        }
        var porteurId="";
        console.log(queryPorteur);
        rechercherPorteur(queryPorteur,query,function(query) {
            afficherRecherche(request,response,query);
        });
    }
    else{
        afficherRecherche(request,response,query);
    }

};

function rechercherPorteur(queryPorteur,query,callback){
    Porteur.find(queryPorteur).exec(function(err, porteurs) {
        if (porteurs!=null) {
            var porteurIds=[];
            porteurs.forEach(function(porteur) {
                porteurIds.push( new mongoose.Types.ObjectId( porteur._id ) );
            });
            query["_porteurs"]={$in : porteurIds};
        }
        callback(query);
    });
}

exports.creerFormation=function(request, response) {
    var ids =[];

    ids.push(new mongoose.Types.ObjectId("5a13ec4685642800048572a1"));




    Porteur.findById("5afac47189583100040de549").exec(function (err, formationANV){

        Village.find(
            {
                "_id" : {$in :ids }

            }).populate('_porteurs').populate('_activites').populate('_participants').populate('_benevoles').populate('_organisateurs').exec(function (err, villages){
            for (i = 0; i < villages.length; i++) {
                console.log(i+" " +villages[i].nom);
                var contienFormation = false;
                for (a = 0; a < villages[i]._activites.length; a++) {

                    if( villages[i]._activites[a].typeActivite=="Formation"){

                        console.log("Formation" +villages[i].nom + " " +villages[i]._activites[a].nom);
                        contienFormation=true;
                    }
                }
                //    debugger;
                villages[i]._porteurs.push(formationANV);

                if(!contienFormation){
                    var datedeb = villages[i]._horairesOuvertures[0].dateDebut;
                    var debut = new Date(datedeb.getFullYear(),datedeb.getMonth(),datedeb.getDate()+1,20, 0, 0);
                    var fin = new Date(debut);
                    fin.setHours("23")
                    var activiteAInserer = new Activite({ nom: "Formation à l’action non-violente et la désobéissance civile",
                        inscription:true,
                        description:"Le lendemain des marches du Tour Alternatiba sont organisées des formations à l’action non-violente et à la désobéissance civile. Animées par des formatrices et des formateurs du mouvement Action Non-Violente COP21 (ANV-COP21), ces formations sont gratuites et ouvertes à toute personne intéressée, quel que soit son niveau d’expérience. Désobéissance civile assumée ou actions sans risque juridique, utilisant le registre de la dénonciation ou bien celui de l’humour, l’action non-violente présente de multiples facettes permettant à chacune et à chacun d’y participer, selon le niveau d’engagement qu’il souhaite. Mais tout commence par s’organiser de manière efficace : c’est le programme de cette formation ! Si tu veux être formé-e et participer toi aussi aux prochaines actions, cette formation est pour toi !",
                        _porteurs: formationANV.id,
                        typeActivite:"Formation",
                        disponibilites :[{dateDebut:debut,dateFin:fin}]});
                    activiteAInserer.save();
                    villages[i]._activites=villages[i]._activites.concat([activiteAInserer]);


                }
                villages[i].save();
                console.log("village" +villages[i].nom + " " +villages[i].id);
            }




        });
    });
    return "" ;
};
exports.exportVillageKML=function(request, response) {
    Village.find().exec(function (err, villages){
        response.render('utils/exportVillageKML', {villages:villages});

    });
}
