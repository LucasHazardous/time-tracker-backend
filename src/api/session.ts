import express, { Request, Response } from "express";
import { login } from "../service/session";
import { body } from 'express-validator';
import { minPasswordLength } from '../config/config';
import { sendErrorStatusCode, handleValidationError } from '../error/api';

const sessionRouter = express.Router();

sessionRouter.post(
    '/login',
    body('username').isString(),
    body('password').isString().isLength({
        min: minPasswordLength,
    }),
    (req: Request, res: Response) => {
        if (handleValidationError(req, res)) return;


        login(req.body.username, req.body.password)
            .then((token) =>
                res.json({token})
            )
            .catch((err) => sendErrorStatusCode(err, res));
    }
);

export default sessionRouter;