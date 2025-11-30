pipeline {
  agent any
  stages {
    stage('Checkout') {
      steps {
        checkout scm
        script {
          sh 'pwd'
          sh 'ls -la'
          sh 'test -f Dockerfile && echo "Dockerfile found" || echo "Dockerfile NOT found"'
        }
      }
    }
    
    stage('Build') {
      steps {
        script {
          echo 'Checking connection to docker-dind...'
          sh "docker -H ${DOCKER_HOST} version"
          echo 'Checking files before build...'
          sh "ls -la tests/ || echo 'Tests directory not found'"
          echo 'Building Docker image...'
          sh "docker -H ${DOCKER_HOST} build --no-cache -t ${DOCKER_IMAGE}:${DOCKER_TAG} ."
          sh "docker -H ${DOCKER_HOST} tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest"
          echo 'Verifying image was created...'
          sh "docker -H ${DOCKER_HOST} images | grep ${DOCKER_IMAGE} || echo 'Image not found!'"
          echo 'Checking if tests are in the image...'
          sh "docker -H ${DOCKER_HOST} run --rm ${DOCKER_IMAGE}:${DOCKER_TAG} ls -la /app/tests/ || echo 'Tests not found in image'"
        }

      }
    }

    stage('Test') {
      post {
        always {
          echo 'Tests completed'
        }

      }
      steps {
        script {
          echo 'Running tests in container...'
          sh """
          docker -H ${DOCKER_HOST} run --rm ${DOCKER_IMAGE}:${DOCKER_TAG} npm test
          """
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
  environment {
    DOCKER_IMAGE = 'devops-jetkins-app'
    DOCKER_TAG = "${env.BUILD_NUMBER}"
    DOCKER_HOST = 'tcp://dind:2375'
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