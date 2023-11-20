import express, { Request, Response } from "express";
import { header, param } from 'express-validator';
import { sendErrorStatusCode, handleValidationError } from '../error/api';
import { getCsv, todayState } from "../service/analytics";

const analyticsRouter = express.Router();

/**
 * @api {get} /analytics/today-state Get information about each user's state today
 * @apiGroup Analytics
 * @apiPermission Admin
 * 
 * @apiHeader {String} authorization Authorization
 * 
 * @apiSuccess {Object[]} data List of users with states
 * @apiSuccess {String} data.id
 * @apiSuccess {String} data.username
 * @apiSuccess {String} data.status
 */
analyticsRouter.get('/today-state',
  header("Authorization").isString().contains("Bearer"),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    todayState(token)
      .then((result) => res.json(result))
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

/**
 * @api {get} /analytics/csv/:year/:month CSV file download for a given month
 * @apiGroup Analytics
 * @apiPermission Admin
 *
 * @apiParam {Number} year
 * @apiParam {Number} month
 * @apiHeader {String} authorization Authorization
 * 
 */
analyticsRouter.get('/csv/:year/:month',
  header("Authorization").isString().contains("Bearer"),
  param("year").isInt({ min: 2000, max: 3000 }),
  param("month").isInt({ min: 1, max: 12 }),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;


    const token = req.get("Authorization")!.substring(7);

    getCsv(req.params.year, req.params.month, token)
      .then((result) => {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=user_data_${req.params.year}_${req.params.month}.csv`);    
        res.send(result);
      })
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

export default analyticsRouter;