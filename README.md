# nexus-time-tracker

## How to run

Setup *.env* file according to [the example](./example.env).

1. Docker

```
docker compose up
```

2. Manual

Make sure NodeJS and (MariaDB or MySQL) is installed and running.

Install dependencies:

```
npm i
```

Generate prisma schema:

```
npm run pgenerate
```

Migrate prisma schema:

```
npm run pmigrate
```

Compile TS files:

```
npm run compile
```

Run:

```
npm run run
```
