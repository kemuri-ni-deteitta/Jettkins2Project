pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'devops-jetkins-app'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_HOST = 'tcp://dind:2375'
    }
    
    stages {
        stage('Build') {
            steps {
                script {
                    echo 'Building Docker image...'
                    sh "docker -H ${DOCKER_HOST} build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker -H ${DOCKER_HOST} tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    echo 'Running tests in container...'
                    sh """
                        docker -H ${DOCKER_HOST} run --rm ${DOCKER_IMAGE}:${DOCKER_TAG} npm test
                    """
                }
            }
            post {
                always {
                    echo 'Tests completed'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo 'Stopping old container (if exists)...'
                    sh "docker -H ${DOCKER_HOST} stop ${DOCKER_IMAGE}-deploy || true"
                    sh "docker -H ${DOCKER_HOST} rm ${DOCKER_IMAGE}-deploy || true"
                    
                    echo 'Starting container in production mode...'
                    sh """
                        docker -H ${DOCKER_HOST} run -d \\
                            --name ${DOCKER_IMAGE}-deploy \\
                            -p 3000:3000 \\
                            ${DOCKER_IMAGE}:${DOCKER_TAG}
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}

