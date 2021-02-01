const nodemailer = require('nodemailer');
const core = require("@actions/core");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: core.getInput('EMAIL_FROM'),
    pass: core.getInput('PASSWORD')
  }
});

const options = {
  from: core.getInput('EMAIL_FROM'),
  to: core.getInput('EMAIL_TO'),
  subject: 'Resultado del workflow ejecutado',
  text: `Se ha realizado un push en ${core.getInput('REPO_NAME')} sobre la rama ${core.getInput('BRANCH_NAME')} que ha provocado la ejecución del workflow ${core.getInput('WORKFLOW_NAME')} con los siguientes resultados:
  - syntax_check_job: ${core.getInput('SYNTAX')}
  - test_execution_job: ${core.getInput('TEST')}
  - build_statics_job: ${core.getInput('BUILD')}
  - deploy_job: ${core.getInput('DEPLOY')}
  
  Acción realizada por el usuario: ${core.getInput('ACTOR')}
  
  Repositorio ${core.getInput('REPO_NAME')} perteneciente a ${core.getInput('REPO_OWNER')}`
};

transporter.sendMail(options, function(error, info){
  if (error) {
    core.setFailed(error);
  } else {
    core.setOutput("response", "Mensaje enviado");
  }
});