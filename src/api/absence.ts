import express, { Request, Response } from "express";
const asbsenceRouter = express.Router();

import { body, header } from 'express-validator';
import { sendErrorStatusCode, handleValidationError } from '../error/api';
import { cancelAbsence, asbsencePresent, deleteAbsence } from "../service/absence";

/**
 * @api {get} /absence/ Get absence status for today
 * @apiGroup Absence
 * @apiPermission User
 * 
 * @apiHeader {String} authorization Authorization
 * 
 * @apiSuccess {Boolean} absence True if there exists an absence for today.
 */
asbsenceRouter.get('/', header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  asbsencePresent(token)
    .then((absence) => res.json({
      absence
    }))
    .catch((err) => sendErrorStatusCode(err, res));
});

/**
 * @api {delete} /absence/today Delete absence for today
 * @apiGroup Absence
 * @apiPermission User
 *  
 * @apiHeader {String} authorization Authorization
 * 
 */
asbsenceRouter.delete('/today', header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  cancelAbsence(token)
    .then(() => res.sendStatus(200))
    .catch((err) => sendErrorStatusCode(err, res));
});

/**
 * @api {delete} /absence/ Delete absence from the past for selected user
 * @apiGroup Absence
 * @apiPermission Admin
 * 
 * @apiHeader {String} authorization Authorization
 * @apiBody {Date} date
 * @apiBody {String} userId Target user id
 * 
 */
asbsenceRouter.delete('/', header("Authorization").isString().contains("Bearer"),
  body("date").isISO8601(),
  body("userId").isString().isUUID(),
  (req: Request, res: Response) => {

    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    deleteAbsence(req.body.userId, req.body.date, token)
      .then(() => res.sendStatus(200))
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

export default asbsenceRouter;
