import { Request, Response } from 'express';
import { ErrorMsg } from '../config/config';
import { validationResult } from 'express-validator';

export function sendErrorStatusCode(err: ErrorMsg, res: Response) {
    console.log(err);
    let status = 500;
    switch (err) {
        case ErrorMsg.authenticationErrorMsg:
            status = 401;
            break;
        case ErrorMsg.authorizationErrorMsg:
        case ErrorMsg.accessDeniedErrorMsg:
            status = 403;
            break;
        case ErrorMsg.userExistsErrorMsg:
            status = 409;
            break;
    }
    if (status === 500) res.sendStatus(status);
    else res.status(status).send(err);
}

export function handleValidationError(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            errors: errors.array(),
        });
        return true;
    }
    return false;
}