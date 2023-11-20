FROM node

WORKDIR /app

COPY src /app/src
COPY tsconfig.json .env package.json package-lock.json /app/

RUN npm install

CMD npm run gp && \
    npm run compile && \
    npm run run
