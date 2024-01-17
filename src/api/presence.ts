import express, { Request, Response } from "express";
const presenceRouter = express.Router();

import { body, header } from 'express-validator';
import { sendErrorStatusCode, handleValidationError } from '../error/api';
import { createPresence, presencePresent, deletePresence } from "../service/presence";
import { allowedPresenceCategories } from "../config/config";

/**
 * @api {get} /presence/today Get presence status for today
 * @apiGroup Presence
 * @apiPermission User
 * 
 * @apiHeader {String} authorization Authorization
 * 
 * @apiSuccess {String} presence Type of presence or none for no presence.
 */
presenceRouter.get('/today', header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  presencePresent(token)
    .then((presence) => res.json({
      presence
    }))
    .catch((err) => sendErrorStatusCode(err, res));
});

/**
 * @api {post} /presence/today Create presence for today
 * @apiGroup Presence
 * @apiPermission User
 *  
 * @apiHeader {String} authorization Authorization
 * @apiBody {String} type Presence type
 * 
 */
presenceRouter.post('/today',
  header("Authorization").isString().contains("Bearer"),
  body("type").isString().isIn(allowedPresenceCategories),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    createPresence(req.body.type, token)
      .then(() => res.sendStatus(200))
      .catch((err) => sendErrorStatusCode(err, res));
  });

/**
 * @api {delete} /presence/ Delete presence from the past for a selected user
 * @apiGroup Presence
 * @apiPermission Admin
 * 
 * @apiHeader {String} authorization Authorization
 * @apiBody {Date} date
 * @apiBody {String} userId Target user id
 * 
 */
presenceRouter.delete('/', header("Authorization").isString().contains("Bearer"),
  body("date").isISO8601(),
  body("userId").isString().isUUID(),
  (req: Request, res: Response) => {

    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    deletePresence(req.body.userId, req.body.date, token)
      .then(() => res.sendStatus(200))
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

export default presenceRouter;
