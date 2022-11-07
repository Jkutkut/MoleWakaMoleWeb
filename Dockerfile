FROM alpine:3.16

RUN apk add --update nodejs npm

COPY . /app

WORKDIR /app

RUN npm install

ENTRYPOINT ["npm", "start"]
