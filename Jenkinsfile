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

        stage('Build and Push') {
            steps {
                script {
                    // Login to DockerHub
                    sh "echo \$DOCKERHUB_CREDENTIALS_PSW | docker login -u \$DOCKERHUB_CREDENTIALS_USR --password-stdin"

                    // Build and push backend image
                    def backendImage = docker.build("${DOCKER_IMAGE_PREFIX}/quickpost-backend:${env.BUILD_NUMBER}", "./backend")
                    backendImage.push()

                    // Build and push frontend image
                    def frontendImage = docker.build("${DOCKER_IMAGE_PREFIX}/quickpost-frontend:${env.BUILD_NUMBER}", "./frontend")
                    frontendImage.push()

                    // Logout from DockerHub
                    sh "docker logout"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
