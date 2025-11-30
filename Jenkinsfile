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
                    echo 'Сборка Docker образа...'
                    sh "docker -H ${DOCKER_HOST} build -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
                    sh "docker -H ${DOCKER_HOST} tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
                }
            }
        }
        
        stage('Test') {
            steps {
                script {
                    echo 'Запуск тестов в контейнере...'
                    sh """
                        docker -H ${DOCKER_HOST} run --rm ${DOCKER_IMAGE}:${DOCKER_TAG} npm test
                    """
                }
            }
            post {
                always {
                    echo 'Тесты завершены'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo 'Остановка старого контейнера (если существует)...'
                    sh "docker -H ${DOCKER_HOST} stop ${DOCKER_IMAGE}-deploy || true"
                    sh "docker -H ${DOCKER_HOST} rm ${DOCKER_IMAGE}-deploy || true"
                    
                    echo 'Запуск контейнера в режиме работы...'
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
            echo 'Pipeline выполнен успешно!'
        }
        failure {
            echo 'Pipeline завершился с ошибкой!'
        }
    }
}

