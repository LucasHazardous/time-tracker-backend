FROM node

WORKDIR /app

COPY src /app/src
COPY tsconfig.json .env package.json package-lock.json /app/

RUN npm install

CMD npm run pgenerate && \
    npm run pmigrate && \
    npm run run
