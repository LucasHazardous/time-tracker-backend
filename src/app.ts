import { config } from 'dotenv';
config();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { port, requestsTimeFrame, maxRequestsPerTimeFrame } from './config/config';

import rateLimit from 'express-rate-limit';
import userRouter from './api/user';
import asbsenceRouter from './api/absence';
import vacationRouter from './api/vacation';
import sessionRouter from './api/session';
import analyticsRouter from './api/analytics';

const limiter = rateLimit({
    windowMs: requestsTimeFrame,
    max: maxRequestsPerTimeFrame,
    standardHeaders: true,
    legacyHeaders: false,
});

const app = express();
app.use('/api', limiter);

app.use(helmet());
app.use(compression());
app.use(cors());

app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/session', sessionRouter);
app.use('/api/absence', asbsenceRouter);
app.use("/api/vacation", vacationRouter);
app.use("/api/analytics", analyticsRouter);

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});