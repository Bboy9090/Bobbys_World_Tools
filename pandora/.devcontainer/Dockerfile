# Pandora Codex Development Container
# Multi-language development environment for the monorepo

FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Avoid prompts from apt
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies
RUN apt-get update && apt-get install -y \
    # Build essentials
    build-essential \
    pkg-config \
    libssl-dev \
    # Git and version control
    git \
    curl \
    wget \
    # Android tools
    android-tools-adb \
    android-tools-fastboot \
    # USB access
    usbutils \
    # Python development
    python3 \
    python3-pip \
    python3-dev \
    # Additional utilities
    jq \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 18 (will be supplemented by devcontainer feature)
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm globally
RUN npm install -g pnpm@8

# Install Rust (will be supplemented by devcontainer feature)
USER vscode
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --default-toolchain stable
ENV PATH="/home/vscode/.cargo/bin:${PATH}"

# Switch back to root for final setup
USER root

# Configure USB device access for adb/fastboot
RUN usermod -aG plugdev vscode

# Set working directory
WORKDIR /workspaces/The-Pandora-Codex-

# Reset DEBIAN_FRONTEND
ENV DEBIAN_FRONTEND=dialog

# Default to vscode user
USER vscode
