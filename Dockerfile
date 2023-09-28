FROM node:8

COPY . /usr/src/app
WORKDIR /usr/src/app

RUN npm install

EXPOSE 88
CMD [ "npm", "start" ]