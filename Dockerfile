FROM node:14-alpine
LABEL name "Bot service"

COPY . .
RUN npm install
CMD [ "npm", "start" ]