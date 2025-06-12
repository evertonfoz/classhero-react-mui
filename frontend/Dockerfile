FROM node:20

WORKDIR /app

COPY package*.json ./
# COPY .npmrc .npmrc

RUN npm install
# RUN npm cache clean --force && npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]
