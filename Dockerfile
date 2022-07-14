FROM node:16.16.0

WORKDIR /app

# Install app dependencies
# both package.json and package-lock.json are copied
COPY package*.json ./

RUN npm install
# RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD [ "node", "./server.js" ]
