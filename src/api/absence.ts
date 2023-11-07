import express, { Request, Response } from "express";
const asbsenceRouter = express.Router();

import { body, header } from 'express-validator';
import { sendErrorStatusCode, handleValidationError } from '../error/api';
import { cancelAbsence, asbsencePresent, deleteAbsence } from "../service/absence";

asbsenceRouter.get('/', header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  asbsencePresent(token)
    .then((absence) => res.json({
      absence
    }))
    .catch((err) => sendErrorStatusCode(err, res));
});

asbsenceRouter.delete('/today', header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  cancelAbsence(token)
    .then(() => res.sendStatus(200))
    .catch((err) => sendErrorStatusCode(err, res));
});

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
