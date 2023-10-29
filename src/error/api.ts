import { Request, Response } from 'express';
import { ErrorMsg } from '../config/config';
import { validationResult } from 'express-validator';

export function sendErrorStatusCode(err: ErrorMsg, res: Response) {
    let status = 500;
    switch (err) {
        case ErrorMsg.authenticationErrorMsg:
            status = 401;
            break;
        case ErrorMsg.authorizationErrorMsg:
        case ErrorMsg.accessDeniedErrorMsg:
            status = 403;
            break;
        case ErrorMsg.notFound:
            status = 404;
            break;
        case ErrorMsg.alreadyExistsErrorMsg:
            status = 409;
            break;
        case ErrorMsg.unprocessableEntity:
            status = 422;
            break;
    }
    if (status === 500) {
        console.error(err);
        res.sendStatus(status);
    }
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