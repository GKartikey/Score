pipeline {
  agent any

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '10'))
    disableConcurrentBuilds()
  }

  triggers {
    githubPush()
  }

  environment {
    COMPOSE_PROJECT_NAME = 'score-ci'
    PIPELINE_DISPLAY_NAME = 'score system'
    CLIENT_PORT = '18081'
    SERVER_PORT = '15000'
    MONGO_PORT = '27018'
  }

  stages {
    stage('Initialize') {
      steps {
        script {
          currentBuild.displayName = "${env.PIPELINE_DISPLAY_NAME} #${env.BUILD_NUMBER}"
          currentBuild.description = 'Dockerized MERN credit risk scoring system'
        }
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install and Build App') {
      steps {
        script {
          runCommand('npm.cmd ci', 'npm ci')
          runCommand('npm.cmd ci --prefix client', 'npm ci --prefix client')
          runCommand('npm.cmd run build --prefix client', 'npm run build --prefix client')
        }
      }
    }

    stage('Docker Build') {
      steps {
        script {
          dockerCompose('build')
        }
      }
    }

    stage('Docker Smoke Test') {
      steps {
        script {
          dockerCompose('up -d')
          waitForUrl("http://localhost:${env.SERVER_PORT}/api/health", 60)
          waitForUrl("http://localhost:${env.CLIENT_PORT}", 60)
        }
      }
    }
  }

  post {
    always {
      script {
        dockerCompose('down -v --remove-orphans')
      }
    }
  }
}

def runCommand(String windowsCommand, String unixCommand) {
  if (isUnix()) {
    sh unixCommand
  } else {
    bat windowsCommand
  }
}

def dockerCompose(String args) {
  runCommand("docker compose ${args}", "docker compose ${args}")
}

def waitForUrl(String url, int timeoutSeconds) {
  timeout(time: timeoutSeconds, unit: 'SECONDS') {
    waitUntil {
      def command = isUnix()
        ? "curl -fsS ${url} >/dev/null"
        : "powershell -NoProfile -ExecutionPolicy Bypass -Command \"try { Invoke-WebRequest -UseBasicParsing '${url}' | Out-Null; exit 0 } catch { exit 1 }\""
      def status = isUnix()
        ? sh(script: command, returnStatus: true)
        : bat(script: command, returnStatus: true)
      return status == 0
    }
  }
}
