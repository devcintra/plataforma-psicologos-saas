FROM mcr.microsoft.com/devcontainers/javascript-node:22

WORKDIR /workspace

RUN apt-get update && apt-get install -y \
    default-mysql-client \
    netcat-openbsd \
    iputils-ping \
    && apt-get clean

EXPOSE 3000