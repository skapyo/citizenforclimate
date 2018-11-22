var mongoose = require('mongoose');
var  Village = mongoose.model('Village');
var  InformationParticipantEngagement = mongoose.model('InformationParticipantEngagement');
var moment = require('moment');
const nodemailer = require('nodemailer');
var mailerhbs = require('nodemailer-express-handlebars');


exports.home=function(request,response){
    //Village.find().populate('_activites').cache().exec(function (err, villages) {

Village.find().populate('_engagements _engagements._informationParticipantEngagement').cache().exec(function (err, villages) {

    InformationParticipantEngagement.populate(villages, '_engagements._informationParticipantEngagement', function (err, villageavecEngagement) {
        request.visitor.pageview("accueil").send();
        response.render('pages/accueil', {villages: villageavecEngagement, moment: moment});
    });
});
};



function envoiMailContact(village,message,emailContact){
  var emailTo='';
  var emailcc='';
  var emailReferent='';

  
  if(village.emailContact==''){
    emailTo='emailToReplace'
  }else{
    emailTo=village.emailContact;
  }
  emailcc=emailContact;
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
          subject: '[Ensemble pour le climat][Outil marche] Contact ', // Subject line
          template: 'contact', //Name email file template
            context: { // pass variables to template
                villageId:village.id,
                nomEtape:village.nom,
                nonpublie:!village.publication,
                message:message,
                emailContact:emailContact
        
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
exports.contactVillage=function(request, response) {
  var villageId = request.body.villageId;
        if(typeof villageId !== undefined && villageId!="undefined" && villageId!="" ) {
             Village.findById(villageId).exec(function (err, village) {
                if(village!=null){
                      console.log("Contact pour le village "+village.nom);
                      request.visitor.event("Contact", "Contact pour le village "+village.nom).send();
                      envoiMailContact(village,request.body.contactMessage,request.body.emailContact);
                      afficherHome(request, response);
                    }
                    else{
                        afficherHome(request, response);
                    }
                  });
               
            }   
}

function afficherHome(request, response) {
	Village.find().exec(function (err, villages) {
		request.visitor.pageview("accueil").send();
		response.render('pages/accueil', {villages: villages,moment:moment});
        });
}



