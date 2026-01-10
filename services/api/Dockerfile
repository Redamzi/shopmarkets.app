FROM node:22

# Note: Switched from Alpine to Debian to resolve SSL handshake issues with Cloudflare R2
# Alpine's minimal SSL libraries were incompatible with R2's certificate chain

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4000

CMD ["node", "src/server.js"]
