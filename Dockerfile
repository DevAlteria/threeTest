FROM node:18.7.0

WORKDIR /app

COPY package.json package.json

RUN npm install

COPY . .

CMD [ "node", "app.js" ]