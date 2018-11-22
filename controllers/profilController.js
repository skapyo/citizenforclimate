
/*!
 * Module dependencies.
 */


var mongoose = require('mongoose');

var  Village = mongoose.model('Village')
,Lieu = mongoose.model('Lieu')
,Porteur = mongoose.model('Porteur')
,Activite = mongoose.model('Activite'),
Utilisateur = mongoose.model('Utilisateur'),
InformationParticipantFormation=mongoose.model('InformationParticipantFormation');

var moment = require('moment');

const nodemailer = require('nodemailer');
var mailerhbs = require('nodemailer-express-handlebars');

exports.referent=function(request,response){
	afficherProfilReferent(request,response);
};
exports.mesEtapes=function(request,response){
	afficherMesEtapes(request,response);
};

function envoiMailReferentEnAttenteValidation(village,participant){
	var emailTo='';
	var emailcc='';
	var emailReferent='';

	for (i = 0; i < village._referents.length; i++) {
		emailReferent+=village._referents[i].adresseMail;
		if(i!=village._referents.length-1){
			emailReferent+=' , ';
		}
	}
	if(emailReferent==''){
		emailTo='emailToReplace'
	}else{
		emailTo=emailReferent;
		emailcc='emailToReplace'
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
	        subject: '[Ensemble pour le climat][Outil marche] Nouveau référent en attente de validation', // Subject line
	        template: 'demandeReferent', //Name email file template
            context: { // pass variables to template
                villageId:village.id,
				prenom:participant.prenom, 
				nom:participant.nom,
				email:participant.adresseMail,
				referentId:participant.id,
				nomEtape:village.nom
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
function envoiMailNouveauReferent(village,participant){

	var emailReferent='';

	for (i = 0; i < village._referents.length; i++) {
		emailReferent+=village._referents[i].adresseMail;
		if(i!=village._referents.length-1){
			emailReferent+=' , ';
		}
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
	        to: participant.adresseMail,
	        cc: 'emailToReplace, emailToReplace, '+emailReferent, // list of receivers
	        subject: '[Ensemble pour le climat][Outil marche] Vous êtes maintenant référent de votre marche', // Subject line
	        template: 'validationReferent', //Name email file template
            context: { // pass variables to template
                a1: participant.prenom,
                a2: village.nom,
                villageId: village.id
            }
	    };
	    // send mail with defined transport object
	    transporter.sendMail(mailOptions, (error, info) => {
	        if (error) {
	            return console.log(error);
	        }
	        console.log('Message sent: %s', info.messageId);
	        // Preview only available when sending through an Ethereal account
	        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
	
	        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
	        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
		    }); 

}

function afficherMesEtapes(request,response){
	Utilisateur.findById(request.user._id,function (error, utilisateur) {
		
		
		var myId = new mongoose.Types.ObjectId(request.user._id)
		Village.find(
			{
			}).populate('_referentsNonValides').exec(function (err, villages) {
			Village.find(
			{
				"_referents": {
					"_id" : myId
					}
			}).populate('_referentsNonValides').exec(function (err, villagesReferent) {
				Village.find(
				{
					"_organisateurs": {
						"_id" : myId
						}
				},function (error, villagesOrganisateurs) {
					Village.find(
					{
						"_benevoles": {
							"_id" : myId
							}
					},function (error, villagesBenevoles) {
						Village.find(
						{
							"_interesses": {
								"_id" : myId
								}
						},function (error, villagesInteresses) {

							Village.find(
							{
								"_participants": {
									"_id" : myId
									}
							},function (error, villagesParticipants) {
								
								Activite.find(
							{
									"_participants": {
										"_id" : myId
								}
							},function (error, activites) {
							var listeActiviteId =[];
							var i;
							for (i = 0; i < activites.length; i++) {
								listeActiviteId.push(new mongoose.Types.ObjectId(activites[i]._id));
							}
									Village.find(
								{
									"_activites" : {$in :listeActiviteId } 
										
								},function (error, villagesContenantActivite) {

									request.visitor.pageview(request.url,request.hostname,"Mes marches").send();
									request.visitor.event("Afficher mes marches",utilisateur.prenom +" "+ utilisateur.nom ).send()
							        response.render('pages/mesEtapes',{utilisateur:utilisateur,Utilisateur:Utilisateur,villages:villages,villagesReferent:villagesReferent,
							        	villagesParticipants:villagesParticipants,activites:activites,villagesContenantActivite:villagesContenantActivite,
							        	villagesInteresses:villagesInteresses,villagesBenevoles:villagesBenevoles,villagesOrganisateurs:villagesOrganisateurs});
							   		});
								 });
							});
						});
					});
				});
			});
		});
	});
  };

function afficherProfilReferent(request,response){
	Utilisateur.findById(request.user._id,function (error, utilisateur) {
		
		
		var myId = new mongoose.Types.ObjectId(request.user._id)
		Village.find(
			{
			}
			).populate('_referentsNonValides').populate('_referents').populate('_activites').populate('_activites._participants').populate('_activites._informationParticipantFormation.participant').populate('_activites._informationParticipantFormation').exec(function (err, lesvillages) {
				InformationParticipantFormation.populate(lesvillages,'_activites._informationParticipantFormation', function(err, villagesAvecInformations){
					Utilisateur.populate(villagesAvecInformations,'_activites._informationParticipantFormation.participant', function(err, villages){
					Village.find(
					{
						"_referents": {
							"_id" : myId
							}
					}).populate('_referentsNonValides').populate('_activites').populate('_activites._participants').populate('_activites._informationParticipantFormation.participant').exec(function (err, villagesReferent) {
						 Utilisateur.populate(villagesReferent,'_activites._participants ', function(err, villagesReferentAvecParticipants){
						 	InformationParticipantFormation.populate(villagesReferentAvecParticipants,'_activites._informationParticipantFormation', function(err, villagesReferentAvecParticipantsAvecInfos){
							 	Utilisateur.populate(villagesReferentAvecParticipantsAvecInfos,'_activites._informationParticipantFormation.participant', function(err, villagesReferentAvecParticipant){
									Village.find(
									{
										"_participants": {
											"_id" : myId
											}
									},function (error, villagesParticipants) {
										
										Activite.find(
									{
											"_participants": {
												"_id" : myId
										}
									},function (error, activites) {
									var listeActiviteId =[];
									var i;
									for (i = 0; i < activites.length; i++) {
										listeActiviteId.push(new mongoose.Types.ObjectId(activites[i]._id));
									}
											Village.find(
										{
											"_activites" : {$in :listeActiviteId } 
												
										},function (error, villagesContenantActivite) {
											 afficherPageProfilReferent(request,response,utilisateur,villages,villagesReferentAvecParticipant,villagesParticipants,activites,villagesContenantActivite);
											 });
										 });
									});
								});
													});
						});
					});
				});
			});
		});
	});
  };
function contientUtilisateur(listeUtilisateur,utilisateur){
     
      if(utilisateur != undefined  && listeUtilisateur!=null){
        for (var i = 0, len = listeUtilisateur.length; i < len; i++) {
       var utilisateurPresent=listeUtilisateur[i];
          if(utilisateurPresent != undefined && utilisateurPresent._id.equals(utilisateur._id)){
            return true;
          }
        }
       }
     return false;
  }
exports.ajoutReferent=function(request, response) {
  var villageId = request.query.villageId;
  var participant =request.user;
        if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
             Village.findById(villageId).populate("_referents").populate("_referentsNonValides").exec(function (err, village) {
                if(village!=null && !(contientUtilisateur(village._referentsNonValides,participant)) && !(contientUtilisateur(village._referents,participant)) ){
                    village._referentsNonValides=village._referentsNonValides.concat([participant]);
                   village.save(function (err){
                      console.log("Ajout d'un référent en attente de validation "+ participant.nom + " "+ participant.prenom+" au village "+village.nom);
                      request.visitor.event("Ajout", "Ajout d'un référent en attente de validation "+ participant.prenom + " "+ participant.nom+" au village "+village.nom).send();
                      envoiMailReferentEnAttenteValidation(village,participant);
                       afficherProfilReferent(request, response);
                      });
                    }
                    else{
                        afficherProfilReferent(request, response);
                    }
                  });
               
            }   
}

exports.validerReferent=function(request, response) {
  var villageId = request.query.villageId;
  	Utilisateur.findById(request.query.referentId,function (error, participant) {
        if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
             Village.findById(villageId).exec(function (err, village) {
                if(village!=null){
                  village._referentsNonValides.remove(participant);
                    village._referents=village._referents.concat([participant]);
                   village.save(function (err){
                      console.log("Validation du référent "+ participant.nom + " "+ participant.prenom+" au village "+village.nom);
                      request.visitor.event("Validation", "Validation d'un référent "+ participant.prenom + " "+ participant.nom+" au village "+village.nom).send();
                      envoiMailNouveauReferent(village,participant)
                      afficherProfilReferent(request, response);
                      });
                    }
                    else{
                        afficherProfilReferent(request, response);
                    }
                  });
               
            }
        });   
}

function afficherPageProfilReferent(request,response,utilisateur,villages,villagesReferent,villagesParticipants,activites,villagesContenantActivite){
		request.visitor.pageview(request.url,request.hostname,"ProfilReferent").send();
		request.visitor.event("Afficher profil",utilisateur.prenom +" "+ utilisateur.nom ).send()
        response.render('pages/referent',{utilisateur:utilisateur,Utilisateur:Utilisateur,villages:villages,villagesReferent:villagesReferent,villagesParticipants:villagesParticipants,activites:activites,villagesContenantActivite:villagesContenantActivite,moment:moment});
   
};

