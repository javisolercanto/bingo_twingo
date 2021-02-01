const nodemailer = require('nodemailer');
const core = require("@actions/core");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'javisolertests@gmail.com',
    pass: core.getInput('PASSWORD')
  }
});

const options = {
  from: 'javisolertests@gmail.com',
  to: core.getInput('EMAIL'),
  subject: 'Estado del workflow ejecutado en Github',
  text: `Resultados de los jobs ejecutados en el workflow:
  \nSyntax Check: ${core.getInput('SYNTAX')}
  \nTesting:      ${core.getInput('TEST')}
  \nBuild:        ${core.getInput('BUILD')}
  \nDeploy:       ${core.getInput('DEPLOY')}`
};

transporter.sendMail(options, function(error, info){
  if (error) {
    core.setFailed(error);
  } else {
    core.setOutput("response", "Mensaje enviado");
  }
});