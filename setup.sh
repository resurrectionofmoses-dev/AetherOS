#!/bin/bash

# Aetheros Setup Script for WSL

echo "Initializing Aetheros Environment..."

# Check for Node.js
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install it first."
    exit 1
fi

# Check Node version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js version 18 or higher is required. Current version: $NODE_VERSION"
    exit 1
fi

echo "Installing dependencies..."
npm install

if [ ! -f .env ]; then
    echo "Creating .env template..."
    echo "GEMINI_API_KEY=" > .env
    echo ".env created. Please add your GEMINI_API_KEY to it."
else
    echo ".env already exists."
fi

echo "------------------------------------------------"
echo "Setup Complete!"
echo "To start the development server, run: npm run dev"
echo "To build for production, run: npm run build"
echo "------------------------------------------------"
