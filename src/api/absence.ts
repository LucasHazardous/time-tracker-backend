import express, { Request, Response } from "express";
const asbsenceRouter = express.Router();

import { header } from 'express-validator';
import { sendErrorStatusCode, handleValidationError } from '../error/api';
import { cancelAbsence } from "../service/absence";

asbsenceRouter.delete('/today', header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  cancelAbsence(token)
    .then(() => res.sendStatus(200))
    .catch((err) => sendErrorStatusCode(err, res));
});

export default asbsenceRouter;
