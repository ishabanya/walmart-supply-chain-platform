#!/bin/bash

# Walmart Supply Chain Deployment Script
# This script helps deploy the project to Railway (backend) and Vercel (frontend)

echo "🚀 Walmart Supply Chain Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if required tools are installed
check_requirements() {
    print_status "Checking deployment requirements..."
    
    if ! command -v npx &> /dev/null; then
        print_error "npx not found. Please install Node.js and npm first."
        exit 1
    fi
    
    # Test Railway CLI
    if ! npx @railway/cli --version &> /dev/null; then
        print_error "Cannot run Railway CLI with npx. Please check your npm installation."
        exit 1
    fi
    
    # Test Vercel CLI
    if ! npx vercel --version &> /dev/null; then
        print_error "Cannot run Vercel CLI with npx. Please check your npm installation."
        exit 1
    fi
    
    if ! command -v git &> /dev/null; then
        print_error "Git not found. Please install Git first."
        exit 1
    fi
    
    print_success "All required tools are installed!"
}

# Deploy backend to Railway
deploy_backend() {
    print_status "Deploying backend to Railway..."
    
    # Login to Railway
    print_status "Please login to Railway..."
    npx @railway/cli login
    
    # Create new Railway project or use existing
    print_status "Creating/connecting to Railway project..."
    npx @railway/cli project new walmart-supply-chain-backend || npx @railway/cli project connect
    
    # Add PostgreSQL database
    print_status "Adding PostgreSQL database..."
    npx @railway/cli add --service postgresql
    
    # Deploy the backend
    print_status "Deploying backend application..."
    npx @railway/cli up --service walmart-supply-chain-backend
    
    # Get the backend URL
    BACKEND_URL=$(npx @railway/cli status --json | jq -r '.project.plugins[] | select(.name=="walmart-supply-chain-backend") | .url')
    
    if [ "$BACKEND_URL" != "null" ] && [ -n "$BACKEND_URL" ]; then
        print_success "Backend deployed successfully!"
        print_success "Backend URL: $BACKEND_URL"
    else
        print_error "Failed to get backend URL. Please check Railway dashboard."
        BACKEND_URL="https://your-backend-url.railway.app"
    fi
}

# Deploy frontend to Vercel
deploy_frontend() {
    print_status "Deploying frontend to Vercel..."
    
    # Navigate to frontend directory
    cd frontend
    
    # Install dependencies if not already installed
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        npm install
    fi
    
    # Set environment variables for Vercel
    print_status "Setting up environment variables for Vercel..."
    echo "REACT_APP_API_URL=$BACKEND_URL" > .env.production
    echo "REACT_APP_WS_URL=${BACKEND_URL/https:/wss:}" >> .env.production
    echo "REACT_APP_ENVIRONMENT=production" >> .env.production
    
    # Deploy to Vercel
    print_status "Deploying to Vercel..."
    npx vercel --prod
    
    # Go back to root directory
    cd ..
    
    print_success "Frontend deployed successfully!"
}

# Update backend environment with frontend URL
update_backend_cors() {
    print_status "Updating backend CORS configuration..."
    
    # Get frontend URL from Vercel
    cd frontend
    FRONTEND_URL=$(npx vercel ls --json | jq -r '.[0].url' 2>/dev/null || echo "")
    cd ..
    
    if [ -n "$FRONTEND_URL" ]; then
        FRONTEND_URL="https://$FRONTEND_URL"
        print_status "Setting backend CORS to allow: $FRONTEND_URL"
        npx @railway/cli variables set ALLOWED_ORIGINS="http://localhost:3000,$FRONTEND_URL"
        print_success "Backend CORS updated successfully!"
    else
        print_warning "Could not automatically get frontend URL. Please update CORS manually in Railway dashboard."
    fi
}

# Main deployment flow
main() {
    check_requirements
    
    print_status "Starting deployment process..."
    
    # Initialize git repository if not exists
    if [ ! -d ".git" ]; then
        print_status "Initializing git repository..."
        git init
        git add .
        git commit -m "Initial commit for deployment"
    fi
    
    # Deploy backend first
    deploy_backend
    
    # Deploy frontend with backend URL
    deploy_frontend
    
    # Update backend CORS with frontend URL
    update_backend_cors
    
    echo ""
    print_success "🎉 Deployment completed successfully!"
    echo ""
    print_status "Next steps:"
    echo "1. Check your Railway dashboard for backend status"
    echo "2. Check your Vercel dashboard for frontend status"
    echo "3. Test the live application"
    echo "4. Monitor logs for any issues"
    echo ""
    print_status "URLs:"
    echo "Backend: $BACKEND_URL"
    echo "Frontend: Check Vercel dashboard for the live URL"
}

# Run main function
main 