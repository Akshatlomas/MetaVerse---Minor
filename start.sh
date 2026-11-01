#!/usr/bin/env bash
# ==============================================================================
# IIIT BHOPAL METAVERSE — ONE-CLICK LAUNCH SCRIPT (macOS & Linux)
# ==============================================================================

set -e

CYAN='\033[0;36m'
GOLD='\033[0;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${GOLD}${BOLD}"
echo "  ╔══════════════════════════════════════════════════════════════╗"
echo "  ║        INDIAN INSTITUTE OF INFORMATION TECHNOLOGY BHOPAL     ║"
echo "  ║             VIRTUAL CAMPUS METAVERSE & CLASSROOMS            ║"
echo "  ╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 1. Environment & Node.js Check
echo -e "${CYAN}➜ Checking runtime environment...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✘ Node.js is not installed! Please install Node.js v18 or higher.${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}✘ Node.js version $NODE_VERSION detected. Node.js v18 or higher is required.${NC}"
    exit 1
fi
echo -e "${GREEN}✔ Node.js $(node -v) detected.${NC}"

# 2. Check Port Availability
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${GOLD}⚠ Notice: Port $port is currently in use. Existing process might be reused.${NC}"
    fi
}
check_port 5001
check_port 5173

# 3. Print Architecture & Mode Summary
echo -e "${CYAN}➜ Metaverse Configuration:${NC}"
echo -e "  • ${BOLD}Phaser 3 2.5D Campus:${NC}    http://localhost:5173/campus"
echo -e "  • ${BOLD}Express & REST APIs:${NC}     http://localhost:5001/api/health"
echo -e "  • ${BOLD}WebRTC Classroom WS:${NC}     ws://localhost:5001/ws/classroom"
echo -e "  • ${BOLD}Audio Isolation:${NC}         Active (Server-enforced rooms)"
echo -e "  • ${BOLD}AI Assistant Provider:${NC}   Mock Fallback Mode (100% Free & Local)"
echo ""

# 4. Cleanup on Exit
cleanup() {
    echo -e "\n${GOLD}➜ Shutting down IIIT Bhopal Metaverse services...${NC}"
    kill $(jobs -p) 2>/dev/null || true
    echo -e "${GREEN}✔ All processes terminated cleanly. Goodbye!${NC}"
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 5. Launch Backend Server & Frontend Client
echo -e "${GREEN}🚀 Launching Backend Server on port 5001...${NC}"
(cd server && npm run dev) &
SERVER_PID=$!

sleep 1.5

echo -e "${GREEN}🚀 Launching Frontend Client on port 5173...${NC}"
(cd client && npm run dev) &
CLIENT_PID=$!

echo ""
echo -e "${GOLD}${BOLD}★ Application is now running!${NC}"
echo -e "  Open your browser at: ${CYAN}${BOLD}http://localhost:5173${NC}"
echo -e "  Press ${RED}${BOLD}Ctrl + C${NC} in this terminal to stop the servers."
echo ""

wait
