// ================================================
//   Jenkins CI/CD Pipeline for K3s
// ================================================

pipeline {
    agent any

    environment {
        FRONTEND_IMAGE = 'frontend-app'
        BACKEND_IMAGE  = 'backend-app'
    }

    stages {

        // ── Step 1: Verify Repository ──
        stage('Verify Repository') {
            steps {
                echo 'Repository checked out successfully.'
                sh 'ls -la'
            }
        }

        // ── Step 2: Build Frontend Docker Image ──
        stage('Build Frontend Image') {
            steps {
                echo 'Building Frontend Docker image...'

                dir('frontend') {
                    sh 'docker build -t ${FRONTEND_IMAGE}:latest .'
                }

                echo 'Frontend image built successfully!'
            }
        }

        // ── Step 3: Build Backend Docker Image ──
        stage('Build Backend Image') {
            steps {
                echo 'Building Backend Docker image...'

                dir('backend') {
                    sh 'docker build -t ${BACKEND_IMAGE}:latest .'
                }

                echo 'Backend image built successfully!'
            }
        }

        // ── Step 4: Import Images into K3s ──
        stage('Import Images into K3s') {
            steps {
                echo 'Importing Docker images into K3s...'

                sh 'docker save ${FRONTEND_IMAGE}:latest | sudo k3s ctr images import -'
                sh 'docker save ${BACKEND_IMAGE}:latest | sudo k3s ctr images import -'

                echo 'Images imported into K3s successfully!'
            }
        }

        // ── Step 5: Configure Kubeconfig ──
        stage('Configure Kubernetes Access') {
            steps {
                echo 'Configuring kubeconfig...'

                sh '''
                mkdir -p $HOME/.kube
                sudo cp /etc/rancher/k3s/k3s.yaml $HOME/.kube/config
                sudo chown $(id -u):$(id -g) $HOME/.kube/config

                sed -i 's/127.0.0.1/172.31.18.77/g' $HOME/.kube/config
                '''
            }
        }

        // ── Step 6: Deploy PostgreSQL ──
        stage('Deploy PostgreSQL') {
            steps {
                echo 'Deploying PostgreSQL...'

                sh 'kubectl apply --validate=false -f k8s/postgres-deployment.yaml'

                echo 'Waiting for PostgreSQL to start...'
                sh 'sleep 20'
            }
        }

        // ── Step 7: Deploy Backend ──
        stage('Deploy Backend') {
            steps {
                echo 'Deploying Backend...'

                sh 'kubectl apply --validate=false -f k8s/backend-deployment.yaml'

                echo 'Waiting for Backend to start...'
                sh 'sleep 15'
            }
        }

        // ── Step 8: Deploy Frontend ──
        stage('Deploy Frontend') {
            steps {
                echo 'Deploying Frontend...'

                sh 'kubectl apply --validate=false -f k8s/frontend-deployment.yaml'

                echo 'Waiting for Frontend to start...'
                sh 'sleep 15'
            }
        }

        // ── Step 9: Restart Deployments ──
        stage('Restart Deployments') {
            steps {
                echo 'Restarting deployments...'

                sh 'kubectl rollout restart deployment postgres || true'
                sh 'kubectl rollout restart deployment backend || true'
                sh 'kubectl rollout restart deployment frontend || true'

                sh 'sleep 20'
            }
        }

        // ── Step 10: Verify Kubernetes Resources ──
        stage('Verify Deployment') {
            steps {
                echo 'Checking Pods...'
                sh 'kubectl get pods -o wide'

                echo 'Checking Services...'
                sh 'kubectl get svc'

                echo 'Checking Deployments...'
                sh 'kubectl get deployments'
            }
        }
    }

    // ── Post Actions ───────────────────────────
    post {

        success {
            echo '========================================'
            echo '✅ Pipeline completed successfully!'
            echo '========================================'
            echo 'Frontend URL:'
            echo 'http://13.61.248.143:30080'
            echo '========================================'
        }

        failure {
            echo '========================================'
            echo '❌ Pipeline failed!'
            echo 'Check Jenkins console logs.'
            echo '========================================'
        }
    }
}
