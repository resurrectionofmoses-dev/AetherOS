# Aetheros - Installation & Setup for WSL

This application is a full-stack React + Express application configured for high-performance execution. Follow the instructions below to install and run it on Windows Subsystem for Linux (WSL).

## Prerequisites

Before starting, ensure you have the following installed in your WSL environment:

1.  **Node.js (v18 or higher)**: We recommend using [nvm](https://github.com/nvm-sh/nvm) to install Node.js.
    ```bash
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    nvm install 22
    ```
2.  **npm**: Usually comes with Node.js.

## Installation

1.  **Download or Clone the Project**:
    Extract the project files into a directory in your WSL filesystem (e.g., `~/projects/aetheros`).

2.  **Navigate to the Directory**:
    ```bash
    cd ~/projects/aetheros
    ```

3.  **Run the Setup Script**:
    We've provided a simple script to handle dependency installation and environment initialization.
    ```bash
    chmod +x setup.sh
    ./setup.sh
    ```

4.  **Alternatively, Manual Installation**:
    ```bash
    npm install
    touch .env
    ```

## Configuration

The application requires a Gemini API key to function.

1.  Create a `.env` file in the root directory:
    ```bash
    touch .env
    ```
2.  Add your API key to the `.env` file:
    ```env
    GEMINI_API_KEY=your_actual_api_key_here
    ```

## Running the Application

### Development Mode
Runs the server with `tsx` and the Vite middleware for Hot Module Replacement (HMR).
```bash
npm run dev
```
The app will be accessible at `http://localhost:3000`.

### Production Build
To build and run the application in production mode:
```bash
# Build the client and server
npm run build

# Start the production server
npm run start
```

## Troubleshooting (WSL Specific)

- **Port Forwarding**: WSL usually handles port forwarding automatically. If you cannot reach `localhost:3000` from your Windows browser, check your WSL IP address (`hostname -I`) and try accessing `http://<wsl-ip>:3000`.
- **Node Modules**: Never run `npm install` on a folder shared between Windows and WSL (like `/mnt/c/...`) as it can cause permissions and symlink issues. Always keep your project inside the WSL filesystem (e.g., `~/aetheros`).

## Security Tools (Optional)

### Modern DNS Auditing Toolkit
A Python-based utility for DNS interception and analysis (educational use only).

#### Prerequisites
- **Python 3**
- **Scapy**: `pip install scapy`

#### Usage
Root/Sudo privileges are required for raw socket access:
```bash
sudo python3 dns_auditor.py -d target-domain.com -ip 10.0.0.99
```

---
Built with Aetheros Intelligence.
