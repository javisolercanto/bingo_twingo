const nodemailer = require('nodemailer');
const core = require("@actions/core");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jsolercanto11@gmail.com',
    pass: core.getInput('PASSWORD')
  }
});

const mailOptions = {
  from: 'jsolercanto11@gmail.com',
  to: core.getInput('EMAIL'),
  subject: 'Estado del workflow ejecutado en Github',
  text: `Resultados de los jobs ejecutados en el workflow:
  \nSyntax Check: ${core.getInput('SYNTAX')}
  \nTesting:      ${core.getInput('TEST')}
  \nBuild:        ${core.getInput('BUILD')}
  \nDeploy:       ${core.getInput('DEPLOY')}`
};

transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    core.setFailed(error);
  } else {
    core.setOutput("response", "Mensaje enviado");
  }
});