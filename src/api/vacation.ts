import express, { Request, Response } from "express";
const vacationRouter = express.Router();

import { body, header, param } from 'express-validator';
import { sendErrorStatusCode, handleValidationError } from '../error/api';
import { createVacation, deleteVacation, editVacation } from "../service/vacation";
import { allowedVacationCategories } from "../config/config";

/**
 * @api {post} /vacation/ Add a vacation
 * @apiGroup Vacation
 * @apiPermission User
 * 
 * @apiHeader {String} authorization Authorization
 * @apiBody {Date} from
 * @apiBody {Date} to
 * @apiBody {String} category Vacation category from available categories
 * 
 */
vacationRouter.post(
    '/',
    body("from").isISO8601(),
    body("to").isISO8601(),
    body('category').isString().isIn(allowedVacationCategories),
    header("Authorization").isString().contains("Bearer"),
    (req: Request, res: Response) => {
        if (handleValidationError(req, res)) return;

        const token = req.get("Authorization")!.substring(7);

        createVacation(new Date(req.body.from), new Date(req.body.to), req.body.category, token)
            .then(() => res.sendStatus(200))
            .catch((err) => sendErrorStatusCode(err, res));
    }
);

/**
 * @api {put} /vacation/:id Change vacation category
 * @apiGroup Vacation
 * @apiPermission Admin
 * 
 * @apiHeader {String} authorization Authorization
 * @apiParam {String} id Vacation id
 * @apiBody {String} category Vacation category from available categories
 * 
 */
vacationRouter.put(
    '/:id',
    header("Authorization").isString().contains("Bearer"),
    param("id").isString().isUUID(),
    body('category').isString().isIn(allowedVacationCategories),
    (req: Request, res: Response) => {
        if (handleValidationError(req, res)) return;

        const token = req.get("Authorization")!.substring(7);

        editVacation(req.body.category!, req.params.id!, token)
            .then(() => res.sendStatus(200))
            .catch((err) => sendErrorStatusCode(err, res));
    }
);

/**
 * @api {delete} /vacation/ Delete vacation for target user interfering with a given day
 * @apiGroup Vacation
 * @apiPermission Admin
 * 
 * @apiHeader {String} authorization Authorization
 * @apiBody {Date} date
 * @apiBody {String} userId User id
 * 
 */
vacationRouter.delete(
    '/',
    body("date").isISO8601(),
    body("userId").isString().isUUID(),
    header("Authorization").isString().contains("Bearer"),
    (req: Request, res: Response) => {
        if (handleValidationError(req, res)) return;

        const token = req.get("Authorization")!.substring(7);

        deleteVacation(req.body.date, req.body.userId, token)
            .then(() => res.sendStatus(200))
            .catch((err) => sendErrorStatusCode(err, res));
    }
);

export default vacationRouter;