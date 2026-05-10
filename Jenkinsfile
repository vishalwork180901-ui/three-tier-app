// ================================================
//   Jenkins CI/CD Pipeline
//   This file runs automatically when you push
//   code to GitHub
// ================================================

pipeline {
    agent any

    // ── Variables ─────────────────────────────
    environment {
        FRONTEND_IMAGE = 'frontend-app'
        BACKEND_IMAGE  = 'backend-app'
    }

    stages {

        // Step 1: Get the code from GitHub
        stage('Clone Repository') {
            steps {
                echo 'Pulling latest code from GitHub...'
                git branch: 'main', url: 'https://github.com/YOUR_USERNAME/YOUR_REPO.git'
                // Replace the URL above with your actual GitHub repo URL
            }
        }

        // Step 2: Build the frontend Docker image
        stage('Build Frontend Image') {
            steps {
                echo 'Building Frontend Docker image...'
                dir('frontend') {
                    sh 'docker build -t ${FRONTEND_IMAGE} .'
                }
                echo 'Frontend image built successfully!'
            }
        }

        // Step 3: Build the backend Docker image
        stage('Build Backend Image') {
            steps {
                echo 'Building Backend Docker image...'
                dir('backend') {
                    sh 'docker build -t ${BACKEND_IMAGE} .'
                }
                echo 'Backend image built successfully!'
            }
        }

        // Step 4: Load images into Minikube
        // (Because Minikube has its own Docker daemon)
        stage('Load Images into Minikube') {
            steps {
                echo 'Loading images into Minikube...'
                sh 'minikube image load ${FRONTEND_IMAGE}'
                sh 'minikube image load ${BACKEND_IMAGE}'
            }
        }

        // Step 5: Deploy everything to Kubernetes
        stage('Deploy to Kubernetes') {
            steps {
                echo 'Deploying to Kubernetes...'
                sh 'kubectl apply -f k8s/postgres-deployment.yaml'
                sh 'sleep 10'   // Wait for DB to start
                sh 'kubectl apply -f k8s/backend-deployment.yaml'
                sh 'kubectl apply -f k8s/frontend-deployment.yaml'
                echo 'Deployment done!'
            }
        }

        // Step 6: Check everything is running
        stage('Verify Deployment') {
            steps {
                echo 'Checking pod status...'
                sh 'kubectl get pods'
                sh 'kubectl get svc'
            }
        }

    }

    // ── After pipeline finishes ───────────────
    post {
        success {
            echo '✅ Pipeline finished! App is running on Kubernetes.'
            echo 'Run: minikube ip  to get the IP address'
            echo 'Then open: http://MINIKUBE_IP:30080'
        }
        failure {
            echo '❌ Pipeline failed. Check the logs above.'
        }
    }
}
