pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "docker.io/writenowagency"
        DOCKER_CREDENTIALS = credentials('docker-registry-credentials')
    }

    stages {
        stage('Checkout') {
            steps {
                git credentialsId: 'github-credentials', url: 'https://github.com/Mokgadi-Julius/quickpost.git'
            }
        }

        stage('Build and Push Docker Images') {
            steps {
                script {
                    docker.withRegistry("https://registry.hub.docker.com", 'docker-registry-credentials') {
                        def backendImage = docker.build("writenowagency/quickpost-backend:${env.BUILD_NUMBER}", "./backend")
                        backendImage.push()

                        def frontendImage = docker.build("writenowagency/quickpost-frontend:${env.BUILD_NUMBER}", "./frontend")
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
