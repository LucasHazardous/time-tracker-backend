FROM node

WORKDIR /app

COPY src /app/src
COPY tsconfig.json .env package.json package-lock.json /app/

RUN npm install
RUN apt-get update && apt-get install -y nmap

CMD npm run wait-for-db && \
    npm run gp && \
    npm run compile && \
    npm run start
