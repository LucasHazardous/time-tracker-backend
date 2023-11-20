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

Generate and migrate prisma schema:

```
npm run gp
```

Compile TS files:

```
npm run compile
```

Run:

```
npm run run
```

Documentation:

```
npm run docs
```