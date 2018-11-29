'use strict';
/**
 * Module dependencies.
 */

const homeController = require('../controllers/homeController');
const porteurController = require('../controllers/porteurController');
const lieuController= require('../controllers/lieuController');
const activiteController = require('../controllers/activiteController');
const villageController = require('../controllers/villageController');
const authentificationController = require('../controllers/authentificationController');
const utilisateurController = require('../controllers/utilisateurController');
const profilController = require('../controllers/profilController');
const engagementController = require('../controllers/engagementController');



var mongoose = require('mongoose');
var passport = require('passport');
var  Utilisateur = mongoose.model('Utilisateur');
const AccessControl = require('accesscontrol');
var ua = require('universal-analytics');
var visitor = ua('codeGAToReplace');

// This is actually how the grants are maintained internally.
let grantsObject = {
    admin: {
        village: {
            'delete:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*']
        },
         porteur: {
            'delete:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*']
        },
         activite: {
            'delete:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
        },
        lieu: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
        },
        participant: {
            'read:any': ['*'],
        } ,
        formation: {
            'read:any': ['*'],
        },
        benevole: {
            'read:any': ['*'],
        },
        engagements: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
        },
        analyseData: {
            'read:any': ['*'],
},
    },
     organisateurTour: {
        village: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
        },
        formation: {
            'read:any': ['*'],
        },
        participant: {
            'read:any': ['*'],
        }
        ,
        benevole: {
            'read:any': ['*'],
        }
        ,
        referent: {
            'update:any': ['*'],
        },
         analyseData: {
             'read:any': ['*'],
         },
    },
    formateur: {
        formation: {
            'read:any': ['*'],
        }
    },
    analyseData: {
        analyseData: {
            'read:any': ['*'],
        }
    },
    referent: {
        porteur: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
        },
        lieu: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
        },
        participant: {
            'read:any': ['*'],
        } ,
        interesse: {
            'read:any': ['*'],
        } ,
        engagements: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
        },
        benevole: {
            'read:any': ['*'],
        }

    },
    porteur: {
        activite: {
            'create:any': ['*'],
            'read:any': ['*'],
            'update:any': ['*'],
        }
    },
    visiteur: {
        village: {
            'read:any': ['*'],
        }
    }
};
const ac = new AccessControl(grantsObject);



function ajoutUtilisateurEtAccesControl(request, res, next){
      res.locals.utilisateur =  request.user;
      res.locals.accesscontrol = ac;
      next();
};

/**
 * Expose
 */

function requiresLogin(req, res, next) {
  if (req.isAuthenticated()){
    return next();
  } else {
	  req.session.returnTo =req.url;
    console.log("Utilisateur non logger redirection vers la page de login url de provenance :" +  req.url);
      // IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
     res.redirect('/login');

  }
}
function ajoutFlashMessage(req, res, next) {
         res.locals.successes = req.flash('success');
        res.locals.dangers = req.flash('danger');
        res.locals.erreurs = req.flash('erreur');
        next();
}

module.exports = function (app) {


// Set flash messages




    app.get('/',ajoutUtilisateurEtAccesControl, homeController.home);
    //page porteur
    app.get('/porteur',ajoutUtilisateurEtAccesControl, porteurController.porteur);
    app.post('/ajoutporteur',ajoutUtilisateurEtAccesControl, porteurController.ajoutPorteur);
    //page lieu
    app.get('/lieu',ajoutUtilisateurEtAccesControl, lieuController.lieu);
    app.post('/ajoutlieu',ajoutUtilisateurEtAccesControl, lieuController.ajoutlieu);
    //page activite
    app.get('/activite',ajoutUtilisateurEtAccesControl, activiteController.activite);
    app.post('/ajoutActivite',ajoutUtilisateurEtAccesControl, activiteController.ajoutActivite);
    //page login
    app.post('/authentification/enregistrement',passport.authenticate('signup', {
	    successReturnToOrRedirect:'/',
	    failureRedirect: '/login',
        failureFlash : true // allow flash messages
	  }));
    app.post('/authentification/authentification', passport.authenticate('login', {
	    successReturnToOrRedirect:'/',
	    failureRedirect: '/login',
        failureFlash : true // allow flash messages
	  }));
       // Page profil
    app.post('/modifierProfil', utilisateurController.modifierProfil);
    app.get('/profil/referent',requiresLogin,ajoutUtilisateurEtAccesControl, profilController.referent);
    app.get('/profil/mesEtapes',requiresLogin,ajoutUtilisateurEtAccesControl, profilController.mesEtapes);
    app.get('/profil/validerReferent',requiresLogin,ajoutUtilisateurEtAccesControl, profilController.validerReferent);
    app.get('/ajoutReferent',requiresLogin,ajoutUtilisateurEtAccesControl, profilController.ajoutReferent);
    app.get('/authentification/logout', authentificationController.logout);
    app.post('/authentification/envoyerEmailReinitialisationMotDePasse',ajoutFlashMessage, authentificationController.envoyerEmailReinitialisationMotDePasse);
    app.get('/authentification/afficherPageReintialisationMotDePasse',ajoutFlashMessage, authentificationController.afficherPageReintialisationMotDePasse); 
    app.post('/authentification/reinitialisationMotDePasse',ajoutFlashMessage, authentificationController.reinitialisationMotDePasse);
    

    
    app.get('/login',ajoutFlashMessage, authentificationController.login);
    //page edition village
   	app.get('/editionVillage',ajoutUtilisateurEtAccesControl, villageController.editionVillage);
    app.post('/ajoutVillage',ajoutUtilisateurEtAccesControl, villageController.ajoutVillage);
    //Page village
    app.get('/village',ajoutUtilisateurEtAccesControl, villageController.afficherVillage);
    app.get('/data',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.afficherData);
    app.post('/recherche',ajoutUtilisateurEtAccesControl, villageController.recherche);
    app.get('/ajoutParticipant',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.ajoutParticipant);
    app.get('/ajoutInteresse',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.ajoutInteresse);
    app.get('/ajoutPorteur',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.ajoutPorteur);
    app.post('/ajoutOrganisateur',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.ajoutOrganisateur);
    app.post('/ajoutBenevole',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.ajoutBenevole);
    app.get('/ajoutBenevole',ajoutUtilisateurEtAccesControl, villageController.afficherVillage);
    app.get('/ajoutOrganisateur',ajoutUtilisateurEtAccesControl, villageController.afficherVillage);

    app.get('/ajoutParticipantActivite',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.ajoutParticipantActivite);
 	app.get('/ajoutParticipantActiviteFormation',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.ajoutParticipantActiviteFormation);
    app.get('/ajoutParticipantEngagement',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.ajoutParticipantEngagement);

    app.get('/suppressionParticipant',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.suppressionParticipant);
 	app.get('/suppressionInteresse',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.suppressionInteresse);
    app.get('/suppressionPorteur',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.suppressionPorteur);
    app.get('/suppressionOrganisateur',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.suppressionOrganisateur);
    app.get('/suppressionBenevole',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.suppressionBenevole);
    app.get('/suppressionParticipantActivite',requiresLogin,ajoutUtilisateurEtAccesControl, villageController.suppressionParticipantActivite);
    app.get('/suppressionActivite',requiresLogin,ajoutUtilisateurEtAccesControl, activiteController.suppressionActivite);
    app.post('/contactVillage', homeController.contactVillage);
    app.get('/contactVillage',ajoutUtilisateurEtAccesControl, villageController.afficherVillage);
    

    app.get('/creerFormation',villageController.creerFormation);
    app.get('/exportVillageKML',villageController.exportVillageKML);

    //Page Engagement
    app.get('/engagement',requiresLogin,ajoutUtilisateurEtAccesControl, engagementController.engagement);
    app.post('/ajoutEngagement',requiresLogin,ajoutUtilisateurEtAccesControl, engagementController.ajoutEngagement);
    app.get('/suppressionEngagement',requiresLogin,ajoutUtilisateurEtAccesControl, engagementController.suppressionEngagement);
      

};