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
  subject: 'Resultado del workflow ejecutado',
  text: `Se ha realizado un push en la rama githubActions_improvement que ha provocado la ejecución del workflow Bingo_Workflow con los siguientes resultados:
  - syntax_check_job: ${core.getInput('SYNTAX')}
  - test_execution_job: ${core.getInput('TEST')}
  - build_statics_job: ${core.getInput('BUILD')}
  - deploy_job: ${core.getInput('DEPLOY')}`
};

transporter.sendMail(options, function(error, info){
  if (error) {
    core.setFailed(error);
  } else {
    core.setOutput("response", "Mensaje enviado");
  }
});