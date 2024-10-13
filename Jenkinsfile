pipeline {
    agent any

    environment {
        DOCKER_IMAGE_PREFIX = "writenowagency"
        DOCKERHUB_CREDENTIALS = credentials('docker-hub-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Login to DockerHub') {
            steps {
                script {
                    sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
                }
            }
        }

        stage('Build and Push Docker Images') {
            steps {
                script {
                    def backendImage = docker.build("${DOCKER_IMAGE_PREFIX}/quickpost-backend:${env.BUILD_NUMBER}", "./backend")
                    backendImage.push()

                    def frontendImage = docker.build("${DOCKER_IMAGE_PREFIX}/quickpost-frontend:${env.BUILD_NUMBER}", "./frontend")
                    frontendImage.push()
                }
            }
        }
    }

    post {
        always {
            script {
                sh 'docker logout'
            }
            cleanWs()
        }
    }
}
