FROM node:18-alpine

# Install CA certificates for SSL/TLS connections (required for Cloudflare R2)
RUN apk add --no-cache ca-certificates

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]
