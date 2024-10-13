pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "docker.io/writenowagency"  // Replace with your Docker Hub username
        DOCKER_REGISTRY_CREDENTIALS = credentials('docker-registry-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build and Push Docker Images') {
            steps {
                script {
                    docker.withRegistry("https://${DOCKER_REGISTRY}", DOCKER_REGISTRY_CREDENTIALS) {
                        def backendImage = docker.build("${DOCKER_REGISTRY}/prompt-generator-backend:${env.BUILD_NUMBER}", "./backend")
                        backendImage.push()

                        def frontendImage = docker.build("${DOCKER_REGISTRY}/prompt-generator-frontend:${env.BUILD_NUMBER}", "./frontend")
                        frontendImage.push()
                    }
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
