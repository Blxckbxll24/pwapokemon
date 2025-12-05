pipeline {
    agent any
    
    tools {
        nodejs 'NodeJS'
    }
    
    environment {
        SONAR_SCANNER_HOME = tool 'SonarQubeScanner'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo "🔍 Checking out code from branch: ${env.BRANCH_NAME}"
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo "📦 Installing dependencies..."
                sh 'npm install --legacy-peer-deps'
            }
        }
        
        stage('Run Tests') {
            steps {
                echo "🧪 Running tests..."
                sh 'npm run test'
            }
        }
        
        stage('SonarQube Analysis') {
            steps {
                echo "📊 Running SonarQube analysis..."
                script {
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=pokepwa \
                            -Dsonar.sources=src \
                            -Dsonar.exclusions=**/*.test.jsx,**/*.test.js \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }
        
        stage('Quality Gate') {
            steps {
                echo "⏳ Waiting for Quality Gate..."
                timeout(time: 10, unit: 'MINUTES') {
                    script {
                        def qg = waitForQualityGate()
                        if (qg.status != 'OK') {
                            error "❌ Quality Gate failed: ${qg.status}"
                        }
                        echo "✅ Quality Gate passed!"
                    }
                }
            }
        }
        
        stage('Build') {
            when {
                branch 'main'
            }
            steps {
                echo "🏗️ Building for production..."
                sh 'npm run build'
            }
        }
        
        stage('Deploy to Production') {
            when {
                allOf {
                    branch 'main'
                    expression { 
                        return env.VERCEL_TOKEN != null && 
                               env.VERCEL_ORG_ID != null && 
                               env.VERCEL_PROJECT_ID != null 
                    }
                }
            }
            steps {
                echo "🚀 Deploying to Vercel..."
                script {
                    withCredentials([string(credentialsId: 'vercel-token', variable: 'VERCEL_TOKEN')]) {
                        sh """
                            npm install -g vercel
                            export VERCEL_ORG_ID=${env.VERCEL_ORG_ID}
                            export VERCEL_PROJECT_ID=${env.VERCEL_PROJECT_ID}
                            vercel pull --yes --environment=production --token=\$VERCEL_TOKEN
                            vercel build --prod --token=\$VERCEL_TOKEN
                            vercel deploy --prebuilt --prod --token=\$VERCEL_TOKEN --yes
                        """
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "🧹 Cleaning workspace..."
            cleanWs()
        }
        success {
            script {
                if (env.BRANCH_NAME == 'develop') {
                    echo "✅ Pipeline en develop ejecutado exitosamente - Deploy SKIPPED"
                } else if (env.BRANCH_NAME == 'main') {
                    echo "✅ Pipeline en main ejecutado exitosamente - Deploy COMPLETADO"
                } else {
                    echo "✅ Pipeline ejecutado exitosamente en rama: ${env.BRANCH_NAME}"
                }
            }
        }
        failure {
            echo "❌ Pipeline falló. Revisar logs para más detalles."
        }
    }
}
