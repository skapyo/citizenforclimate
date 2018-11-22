var mongoose = require('mongoose');
var Utilisateur = mongoose.model('Utilisateur');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt');
var jwt = require('jwt-simple');
var secret = 'secretsitevillagereinitialisationmotdepasse';
const nodemailer = require('nodemailer');

var mailerhbs = require('nodemailer-express-handlebars');


passport.serializeUser(function (utilisateur, done) {
    done(null, utilisateur._id);
});

passport.deserializeUser(function (id, done) {
    Utilisateur.findById(id, function (err, utilisateur) {
        done(err, utilisateur);
    });
});

passport.use('login', new LocalStrategy({
        passReqToCallback: true
    },
    function (req, username, password, done) {

        // check in mongo if a user with username exists or not
        Utilisateur.findOne({'adresseMail': username},
            function (err, utilisateur) {

                // In case of any error, return using the done method
                if (err)
                    return done(err);
                // Username does not exist, log error & redirect back
                if (!utilisateur) {
                    console.log('Utilisateur non retrouve par adresseMail ' + username);
                    return done(null, false,
                        req.flash('erreur', 'Utilisateur non retrouvé'));
                }
                console.log("utilisateur" + utilisateur + " password " + password);
                // User exists but wrong password, log the error
                if (utilisateur && !isValidPassword(utilisateur, password)) {
                    console.log('Mot de passe invalide');
                    return done(null, false,
                        req.flash('erreur', 'Mot de passe invalide'));
                }
                // User and password both match, return user from
                // done method which will be treated like success
                return done(null, utilisateur);
            }
        );
    }));

passport.use('signup', new LocalStrategy({
        passReqToCallback: true
    },
    function (req, username, password, done) {
        console.log("Erreur d'authentification");
        findOrCreateUser = function () {
            // find a user in Mongo with provided username
            Utilisateur.findOne({'adresseMail': username}, function (err, utilisateur) {
                // In case of any error return
                if (err) {
                    console.log('Error in SignUp: ' + err);
                    return done(err);
                }
                // already exists
                if (password != req.param('confimPassword')) {
                    console.log('mot de passe different' + password + ' ' + req.param('confimPassword'));
                    return done(null, false,
                        req.flash('erreur', 'Veuillez saisir des mots de passe identiques'));
                }
                else if (utilisateur) {
                    console.log('utilisateur deja existant');
                    return done(null, false,
                        req.flash('erreur', 'Utilisateur déja existant'));
                } else {
                    // if there is no user with that email
                    // create the user
                    var nouvelUtilisateur = new Utilisateur();
                    // set the user's local credentials
                    nouvelUtilisateur.motDePasse = createHash(password);
                    nouvelUtilisateur.adresseMail = username;
                    nouvelUtilisateur.prenom = req.param('prenom');
                    nouvelUtilisateur.nom = req.param('nom');
                    nouvelUtilisateur.telephone = req.param('telephone');


                    // save the user
                    nouvelUtilisateur.save(function (err) {
                        if (err) {
                            console.log('Error lors de l enregistrement de l utilisateur: ' + err);
                            throw err;
                        }
                        console.log('Utilisateur enregistre avec succes');
                        req.visitor.event("Creation Utilisateur", "Utilisateur " + nouvelUtilisateur.prenom + " " + nouvelUtilisateur.nom + " " + nouvelUtilisateur.adresseMail + "  enregistre avec succes").send();
                        return done(null, nouvelUtilisateur);
                    });
                }
            });
        };

        // Delay the execution of findOrCreateUser and execute
        // the method in the next tick of the event loop
        process.nextTick(findOrCreateUser);
    }));

var isValidPassword = function (utilisateur, password) {
    console.log("Utilisateur tetat " + createHash(password) + " user  " + utilisateur.motDePasse);
    return bCrypt.compareSync(password, utilisateur.motDePasse);
}

// Generates hash using bCrypt
var createHash = function (password) {
    return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
}


exports.login = function (request, response) {
    request.visitor.pageview(request.url, request.hostname, "Login").send();
    response.render('pages/login', {message: request.flash('erreur')});
};

/**exports.authentification=function(request, response,next) {
	if (request.body.adresseMail && request.body.motDePasse){

	  Utilisateur.authenticate(request.body.adresseMail,request.body.motDePasse,function (err, utilisateur) {
	  		if(utilisateur!=null){
	  			request.session.utilisateurID = utilisateur._id;
	  			response.redirect(request.session.returnTo || '/profil');
  				delete request.session.returnTo;
        	
     		 }
     		 else{
     		var erreur ="Adresse mail ou mot de passe invalide"
        request.visitor.event("Erreur Login", erreur).send();
				response.render('pages/login', {erreur});
     		 }
        });
	}
	else{
			var erreur ="Erreur champs non renseignés"
	     	response.render('pages/login', {erreur});
	}
};
 **/
exports.motDePasseOublie = function (request, response) {
    if (request.body.adresseMail) {
        var token = jwt.encode(request.body.adresseMail, secret);

    } else {
        var erreur = "Erreur champs non renseignés"
        response.render('pages/login', {erreur,});
    }
};

function envoiMailReintialisationMotDePasse

(email, token) {
    var emailTo = email;
    var emailcc = '';
    var emailReferent = '';


    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: "gmail",
        port: 25,
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
        cc: emailcc,
        subject: '[Ensemble pour le climat][Outil marche] Réinitialisation de votre mot de passe ', // Subject line
        template: 'reintialisationMotDePasse', //Name email file template
        context: { // pass variables to template
            email: email,
            token: token,
        }


    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });

}

exports.afficherPageReintialisationMotDePasse = function (request, response) {
    if (request.query.token && request.query.email) {
        try {
            var decoded = jwt.decode(request.query.token, secret);
        }
        catch (error) {
            request.flash('erreur', "Erreur dans le lien de mail de réintialisation veuillez contacter l'administrateur à l'adresse emailToReplace");
            response.locals.erreurs = request.flash('erreur');
            response.render('pages/login', {message: request.flash('erreur')});
            return;
        }

        if (request.query.email == decoded) {
            request.flash('success', 'Procédure de réintialisation mot de passe depuis email');
            response.locals.successes = request.flash('success');
            response.render('pages/login', {
                reintialisation: 'true',
                token: request.query.token,
                message: request.flash('erreur')
            });
        } else {
            request.flash('erreur', "Erreur dans le lien de mail de réintialisation veuillez contacter l'administrateur à l'adresse emailToReplace");
            response.locals.erreurs = request.flash('erreur');
            response.render('/');
        }
    }
    else {
        request.flash('erreur', "Erreur lien de réintialisation invalide");
        response.locals.erreurs = request.flash('erreur');
        response.render('pages/login');
    }
};
exports.envoyerEmailReinitialisationMotDePasse = function (request, response) {

    if (request.body.emailRecuperation) {
        Utilisateur.findOne({'adresseMail': request.body.emailRecuperation}, function (err, utilisateur) {
            if(typeof  utilisateur!== 'undefined' && utilisateur !== null) {
                var token = jwt.encode(request.body.emailRecuperation, secret);
                envoiMailReintialisationMotDePasse(request.body.emailRecuperation, token);
                request.flash('success', 'Email de réintialisation envoyé, cliquez sur le lien du mail afin de changer votre mot de passe');
                response.locals.successes = request.flash('success');
                response.render('pages/login', {});

            }else{
                request.flash('erreur', 'Compte non trouvé, créez vous un compte');
                response.locals.erreurs = request.flash('erreur');
                response.render('pages/login');
            }
        });


    } else {
        request.flash('erreur', 'Erreur email non renseigné');
        response.locals.erreurs = request.flash('erreur');
        response.render('pages/login', {});
    }
};

exports.reinitialisationMotDePasse = function (request, response) {
    if (request.body.motDePasse && request.body.motDePasseConf) {
        var adresseMail = jwt.decode(request.body.token, secret);
        // confirm that user typed same password twice
        if (request.body.motDePasse !== request.body.motDePasseConf) {
            request.flash('erreur', "Les mots de passe ne sont pas les mêmes");
            response.locals.erreurs = request.flash('erreur');
            response.render('pages/login', {reintialisation: 'true', token: request.body.token});
        }
        else {
            Utilisateur.findOne({'adresseMail': adresseMail}, function (err, utilisateur) {
                if(typeof  utilisateur!== 'undefined' && utilisateur !== null) {
                    utilisateur.motDePasse = createHash(request.body.motDePasse);
                    utilisateur.save(function (err) {
                        if (err) {
                            console.log('Error lors de l enregistrement de l utilisateur: ' + err);
                            throw err;
                        }
                        console.log("Mot de passe changé pour l'utilisateur  " + utilisateur.nom + " ");
                        request.visitor.event("Modification mot de passe", utilisateur.nom, utilisateur.adresseMail).send();
                        request.flash('success', 'Mot de passe modifié avec succès, vous pouvez vous connecter à nouveau');
                        response.locals.successes = request.flash('success');

                        response.render('pages/login');
                    });
                }else{
                        request.flash('erreur', 'Compte non trouvé, créez vous un compte');
                        response.locals.erreurs = request.flash('erreur');
                        response.render('pages/login');
                    }

            });
        }
    }
    else {
        var erreur = "Erreur technique mauvais parametres envoyes"
        request.flash('erreur', erreur);
        response.locals.erreurs = request.flash('erreur');
        response.render('pages/login', {reintialisation: 'true', erreur, message: request.flash('erreur')});
    }
}
exports.enregistrement = function (request, response) {
    if (request.body.adresseMail && request.body.pseudo && request.body.motDePasse && request.body.motDePasseConf) {

        // confirm that user typed same password twice
        if (request.body.motDePasse !== request.body.motDePasseConf) {
            var erreur = "Les mots de passe ne sont pas les mêmes"
            response.render('pages/login', {erreur});
        } else {
            var utilisateur = {
                prenom: request.body.prenom,
                nom: request.body.nom,
                adresseMail: request.body.adresseMail,
                pseudo: request.body.pseudo,
                motDePasse: request.body.motDePasse,
                motDePasseConf: request.body.motDePasseConf
            }
            //use schema.create to insert data into the db
            Utilisateur.create(utilisateur, function (err, user) {
                if (err) {
                    console.log("Utilisateur non créé dans la base. Erreur " + err);
                } else {
                    console.log("Utilisateur " + utilisateur.nom + " créé dans la base.");
                    request.session.utilisateurID = utilisateur._id;
                    request.visitor.event("Creation Utilisateur", request.body.prenom, utilisateur.nom, utilisateur.adresseMail).send();
                    response.redirect(request.session.returnTo || '/profil');
                    delete request.session.returnTo;
                }
            });
        }
    }

};


// GET for logout logout
exports.logout = function (request, response, next) {
    if (request.session) {
        // delete session object
        request.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return response.redirect('/');
            }
        });
    }
};


