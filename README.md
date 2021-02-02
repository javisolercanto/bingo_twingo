# Práctica Github Actions Improvement

## Introducción y conceptos básicos

### Bingo Twingo

En esta práctica vamos a crear un flujo de trabajo para automatizar nuestro proceso de desarrollo. Lo vamos a realizar sobre el proyecto Bingo Twingo. Todas estas mejoras están realizadas en la rama githubActions_improvements del repositorio javisolercanto/bingo_twingo. Crearemos los siguientes jobs:

- Verificar la sintaxis utilizada en nuestros ficheros javascript: [syntax_check_job](###syntax_check_job).

- Ejecución de la bateria de tests: [test_execution_job](###test_execution_job).

- Generación de estáticos: [build_statics_job](###build_statics_job).

- Despliegue de estáticos: [deploy_job](###deploy_job).

- Envío de notificación: [notification_job](###notification_job).

- Actualización del README: [update_readme_job](###update_readme_job).

### ¿Qué es una Github Action?

Una github action nos permite automatizar tareas durante nuestro desarrollo. Estas acciones estan precedidas de eventos, por lo que, dependiendo del evento (push, pull, commit, etc.) podemos ejecutar unas acciones u otras.

Estos eventos accionan un flujo de trabajo (workflow) que contiene uno o varios trabajos (job) que a su vez, contiene unos pasos (step), y es ahí, dentro de un step, donde se ejecutan nuestras acciones.

![Esquema de un Workflow](https://docs.github.com/assets/images/help/images/overview-actions-simple.png)

###### Esquema de la estructura de un workflow

## Desarrollo

Vamos a explicar más detalladamente qué hace cada job y como está construido.

### Estructura principal del Workflow

Creamos dentro del directorio raíz de nuestro proyecto el directorio y el archivo de nuestro workflow: `.github/workflows/Bingo_Workflow.yml`.

Vamos a definir la estructura principal del workflow. Primero defenimos el nombre del workflow y sobre que acciones se ejecutará:

```
name: Bingo_Workflow
on:
  push:
    branches:
      - githubActions_improvement
```

Aquí hemos definido el nombre, **Bingo_Workflow** y que se ejecutará cuando realizemos un **push** en la rama **githubActions_improvement**.

Todos los jobs correrán en una máquina virtual ubuntu.

### syntax_check_job

Job para verificar la sintaxis de nuestros ficheros js. Este job nos permite saber si nuestros ficheros están bien formados, si no es así, este job nos alertará de qué ficheros debemos cambiar. Vamos a ver como se construye este job.

```
syntax_check_job:
    name: Syntax check
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Linter Execution
        uses: github/super-linter@v3
        env:
          DEFAULT_BRANCH: githubActions_improvement
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          LINTER_RULES_PATH: /
          JAVASCRIPT_ES_CONFIG_FILE: .eslintrc.js
          VALIDATE_JAVASCRIPT_ES: true
```

Lo hemos llamado syntax_check_job, y sus steps son:

**Checkout code**: descargará el código utilizando la acción **@actions/checkout@v2**.

**Linter Execution**: este job es el que revisará el código basandose en una guía la cual debemos especificar su ruta en las variables de entorno (JAVASCRIPT_ES_CONFIG_FILE), también debemos especificar nuestro github token (GITHUB_TOKEN).

En nuestro caso queremos que no compruebe los fichero javascript que contienen los test ni la carpeta doc, que contiene la documentación del proyecto, para ello debemos crear un `.eslintignore` el cual nos permite espcificar si queremos evitar la comprobación de ciertos archivos. Este es su contenido:

```
doc
*.test.js
```

Evitará el directorio **doc** y todos los ficheros cuyo nombre acabe en **.test.js**.

### test_execution_job

Job para ejecutar la batería de tests que tenemos definida en nuestro proyecto. Estos tests utilizan la librería **jest** por lo que un paso de este job será instalar dicha librería. Veamos su estructura.

```
test_execution_job:
    name: Test execution
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Run test
        run: | 
            npm i
            npm run test
```

Lo hemos llamado test_execution_job, y sus steps son:

**Checkout code**: descargará el código utilizando la acción **@actions/checkout@v2**.

**Run test**: ejecutará dos comandos, `npm i` el cual instalará todas las dependencias necesarias para la ejecución del proyecto y los tests. Como segundo comando `npm run test` el cual ejecutará ya los tests y nos mostrará el resultado de los mismos.

![Tests results](https://github.com/javisolercanto/bingo_twingo/blob/gh-pages/images/tests.PNG?raw=true)

### build_statics_job

Job que nos permite realizar el build de nuestro proyecto para posteriormente poder ser desplegado. Este job debe ejecutarse siempre y cuando se hayan ejecutado exitosamente los dos jobs anteriores, para ello tenemos la propiedad **needs** donde especificamos por el nombre de los jobs a qué jobs se debe esperar. Veamos los steps.

```
  build_statics_job:
    name: Build
    runs-on: ubuntu-latest
    needs: [syntax_check_job, test_execution_job] 
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Build app
        run: |
          npm i
          npm run buildDev
      - name: Upload Artifacts
        uses: actions/upload-artifact@v2
        with:
          name: artifact
          path: dist
```

**Checkout code**: descargará el código utilizando la acción **@actions/checkout@v2**.

**Build app**: ejecutaremos el comando `npm i` para instalar todas las dependencias, y luego `npm buildDev` comando que tenemos definido en nuestro `package.json`.

```
"buildDev": "rm -rf dist && webpack --mode development --config webpack.server config.js && webpack --mode development --config webpack.dev.config.js"
```

**Upload artifacts**: este step utiliza la acción **actions/upload-artifact@v2** nos permite subir los archivos para poder utilizarlos en otro job, para ello con la propiedad **with** el nombre que hará referencia a estos archivos subidos y el path (directorio) que se subirá, en este caso, subiremos la carpeta que ha generado el comando build.

### deploy_job

Job para desplegar nuestro proyecto en un dominio proporcionado por surge.sh y que sea accesible desde cualquier parte. Este job debe venir precedido del job anterior porque este job se basa en los archivos que hemos subido en el job anterior. Para este job deberemos tener unos secrets definidos en nuestro repositorio. Veamos los steps.

```
deploy_job:
    name: Deploy
    runs-on: ubuntu-latest
    needs: [build_statics_job] 
    steps:
      - name: Download Artifacts
        uses: actions/download-artifact@v2
        with:
          name: artifact
      - name: Deploy Artifacts
        uses: dswistowski/surge-sh-action@v1
        with:
          domain: javisolercanto.surge.sh
          project: .
          login: ${{ secrets.SURGE_LOGIN }}
          token: ${{ secrets.SURGE_TOKEN }}
```

**Download artifacts**: este step utiliza la acción **actions/download-artifact@v2** que, al contrario del anterior este nos permite descargar los arhivos que hemos subido gracias al name que hemos definido antes.

**Deploy artifacts**: utilizaremos la acción propia de surge **dswistowski/surge-sh-action@v1** para poder realizar el deploy, necesitamos definir el dominio que queremos utilizar, la ruta de los archivos que queremos subir, el correo de nuestra cuenta en surge y el token que hemos generado en una terminal local ejecutando el comando `surge token`. Este correo y el token estarán definidos en las opciones del repositorio en los secrets.

![Deploy result](https://github.com/javisolercanto/bingo_twingo/blob/gh-pages/images/surge.PNG?raw=true)

###### Resultado del deploy en nuestro dominio.

### notification_job

Job para enviar una notificación en forma de correo electrónico mediante gmail, con el resultado de todos los jobs anteriormente ejecutados. Para ello deberemos crear una action personalizada la cual utilizará la librería de **nodemailer** para poder enviar las notificaciones.

Para crear una action personalizada deberemos crear el directorio `.github/actions/mail_action` dentro de este directorio deberemos crear un `package.json` ejecutando el comando `npm init -y`, debemos crear también un `index.js` donde definiremos la lógica de la action y por último el archivo `action.yml`.

**action.yml**:

```
name: "Send an email"
description: "Action to send an email to get jobs status"
inputs:
  REPO_NAME:
    description: "Repository name"
    required: true

  BRANCH_NAME:
    description: "Branch name"
    required: true

  WORKFLOW_NAME:
    description: "Workflow name"
    required: true

  ACTOR:
    description: "Logged username"
    required: true

  REPO_OWNER:
    description: "Repository owner name"
    required: true

  PASSWORD:
    description: "Password of email"
    required: true

  EMAIL_FROM:
    description: "Email from is sent the email"
    required: true

  EMAIL_TO:
    description: "Email who will recieve the email"
    required: true

  SYNTAX:
    description: "Syntax job status"
    required: true

  TEST:
    description: "Test job status"
    required: true

  BUILD:
    description: "Build job status"
    required: true

  DEPLOY:
    description: "Deploy job status"
    required: true
    
outputs:
  response:
    description: "Action response"
runs:
  using: "node12"
  main: "dist/index.js"
```

En este archivo hemos definido todos los inputs que debe recibir nuestra action, son los hemos marcado como obligatorios gracias a la propiedad required. También definimos en que versión de node se ejecuta y cual es el directorio que tiene que ejecutar.

**index.js**

```

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
```

En este archivo defenimos la lógica que sigue nuestra action. Definimos nuestro nodemailer con el cual crearemos el transporter que nos definir nuestras credenciales y el servicio a utilizar. Creamos el email y el origen y destinatario. Gracias a la librería core podemos recoger todos esos valores que nos vienen dados por los inputs definidos en el anterior archivo.

Veamos ahora como utilizamos esta nueva action en nuestro workflow.

```
email_job:
    name: Email
    runs-on: ubuntu-latest
    needs: [syntax_check_job, test_execution_job, build_statics_job, deploy_job]
    if: ${{ always() }}
    steps:
      - name: Checkout Code
        uses: actions/checkout@v2
      - name: Send email
        uses: ./.github/actions/mail_action
        with:
          REPO_NAME: ${{ github.repository }}
          BRANCH_NAME: ${{ github.ref }}
          WORKFLOW_NAME: ${{ github.workflow }}
          ACTOR: ${{ github.actor }}
          REPO_OWNER: ${{ github.repository_owner }}
          PASSWORD: ${{ secrets.PASSWORD }}
          EMAIL_FROM: ${{ secrets.EMAIL_FROM }}
          EMAIL_TO: ${{ secrets.EMAIL_TO }}
          SYNTAX: ${{ needs.syntax_check_job.outputs.status }}
          TEST: ${{ needs.test_execution_job.outputs.status }}
          BUILD: ${{ needs.build_statics_job.outputs.status }}
          DEPLOY: ${{ needs.deploy_job.outputs.status }}
```

Este job debe ejecutarse siempre una vez se hayan ejecutado todos los anteriores pero debe ejecutarse siempre, aunque falle alguno de los anteriores, para ello debemos añadir `if: ${{ always() }}`. Veamos los steps con más detalle:

**Checkout code**: descargará el código utilizando la acción **@actions/checkout@v2**.

**Send email**: esta es nuestra acción creada, por ello, debemos indicar la ruta donde se encuentra en nuestro directorio local, e indicar todos los inputs que necesita nuestra action. Usamos github context para la información del repositorio, los secrets del repositorio para la información comprometida y los outputs de los jobs para saber el estado de cada uno de ellos, para conseguir estos outputs debemos añadir esta línea al final de cada job.

![Secrets](https://github.com/javisolercanto/bingo_twingo/blob/gh-pages/images/secrets.PNG?raw=true)

```
outputs:
    status: ${{ job.status }}
```

![Email](https://github.com/javisolercanto/bingo_twingo/blob/gh-pages/images/gmail.PNG?raw=true)

### update_readme_job

Job para actualizar el README siempre que el job deploy se haya ejecutado correctamente. Actualizará la línea de la fecha con la actual y subirá los cambios.

```
update_readme_job:
    name: Update Readme
    runs-on: ubuntu-latest
    needs: [deploy_job]
    steps:
        - name: Checkout Code
          uses: actions/checkout@v2
        - name: Update README.md
          run: |
            sed -i '$d' README.md
            echo -e "\n\n - Última versión desplegada el día: `date`" >> README.md
        - name: Save README.md
          run: |
            git config user.name ${{ secrets.GIT_USERNAME }}
            git config user.email ${{ secrets.GIT_EMAIL }}
            git commit -am "README.md Deploy update"
            git push origin githubActions_improvement
```

**Checkout code**: descargará el código utilizando la acción **@actions/checkout@v2**.

**Update README**: ejecutaremos los comandos en bash para buscar, eliminar y crear esa línea con la fecha actual. 

**Save README**: subiremos los cambios utilizando los comandos de git, todas las credenciales las recogeremos del apartado de secrets de nuestro repositorio.

![Update readme](https://github.com/javisolercanto/bingo_twingo/blob/gh-pages/images/readme.PNG?raw=true)

Este es el resultado de todos nuestros jobs

![Summary](https://github.com/javisolercanto/bingo_twingo/blob/gh-pages/images/summary.PNG?raw=true)
