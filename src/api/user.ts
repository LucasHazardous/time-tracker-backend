import express, { Request, Response } from "express";
import { createUser, deleteUser, editUser, getCurrentUserStats, getSelectedUserStats, getUserList } from "../service/user";
import { body, header, param } from 'express-validator';
import { minPasswordLength } from '../config/config';
import { sendErrorStatusCode, handleValidationError } from '../error/api';

const userRouter = express.Router();

/**
 * @api {post} /user/ Create a user
 * @apiGroup User
 * @apiPermission Admin
 * 
 * @apiHeader {String} authorization Authorization
 * @apiBody {String} username
 * @apiBody {String} password
 * @apiBody {Boolean} admin 
 */
userRouter.post(
  '/',
  body('username').isString(),
  body('password').isString().isLength({
    min: minPasswordLength,
  }),
  body("admin").isBoolean(),
  header("Authorization").isString().contains("Bearer"),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    createUser(req.body.username, req.body.password, req.body.admin, token)
      .then(() => res.sendStatus(200))
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

/**
 * @api {delete} /user/:id Delete user
 * @apiGroup User
 * @apiPermission Admin
 * 
 * @apiHeader {String} authorization Authorization
 * 
 * @apiParam {String} id Target user id
 */
userRouter.delete('/:id', header("Authorization").isString().contains("Bearer"),
  param("id").isString().isUUID(),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    deleteUser(req.params.id, token)
      .then(() => res.sendStatus(200))
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

/**
 * @api {get} /user/ User list
 * @apiGroup User
 * @apiPermission Admin
 * 
 * @apiHeader {String} authorization Authorization
 * @apiSuccess {Object[]} data User list
 * @apiSuccess {String} data.id
 * @apiSuccess {String} data.username
 * @apiSuccess {Boolean} data.admin
 */
userRouter.get('/', header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  getUserList(token)
    .then((result) => res.json(result))
    .catch((err) => sendErrorStatusCode(err, res));
});


/**
 * @api {put} /user/:id Update user
 * @apiGroup User
 * @apiPermission Admin
 * 
 * @apiHeader {String} authorization Authorization
 * @apiParam {String} id
 * 
 * @apiBody {String} [username]
 * @apiBody {String} [password]
 * @apiBody {Boolean} [admin]
 */
userRouter.put('/:id',
  header("Authorization").isString().contains("Bearer"),
  param("id").isString().isUUID(),
  body("username").isString().optional(),
  body("password").isString().isLength({ min: minPasswordLength }).optional(),
  body("admin").isBoolean().optional(),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    editUser(req.params.id, req.body.username, req.body.password, req.body.admin, token)
      .then(() => res.sendStatus(200))
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

/**
 * @api {put} /user/:year/:month Current user stats
 * @apiGroup User
 * @apiPermission User
 * @apiDescription Returns a list with elements that are either a single day of absence or vacation range with vacation days used
 * 
 * @apiHeader {String} authorization Authorization
 * @apiParam {Number} year
 * @apiParam {Number} month
 * 
 * @apiSuccess {Object[]} data
 * @apiSuccess {Date} [data.date] **Absence** Single day of absence
 * @apiSuccess {Date} [data.from] **Vacation** Beginning of vacation range
 * @apiSuccess {Date} [data.to] **Vacation** End of vacation range
 * @apiSuccess {Number} [data.days] **Vacation** Number of vacation days used in vacation range
 */
userRouter.get('/:year/:month',
  header("Authorization").isString().contains("Bearer"),
  param("year").isInt({ min: 2000, max: 3000 }),
  param("month").isInt({ min: 1, max: 12 }),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    getCurrentUserStats(req.params.year, req.params.month, token)
      .then((result) => res.json(result))
      .catch((err) => sendErrorStatusCode(err, res));
  }
);


/**
 * @api {put} /user/:id/:year/:month Target user stats
 * @apiGroup User
 * @apiPermission Admin
 * @apiDescription Returns a list with elements that are either a single day of absence or vacation range with vacation days used
 * 
 * @apiHeader {String} authorization Authorization
 * @apiParam {Number} year
 * @apiParam {Number} month
 * @apiParam {String} id User id
 * 
 * @apiSuccess {Object[]} data
 * @apiSuccess {Date} [data.date] **Absence** Single day of absence
 * @apiSuccess {Date} [data.from] **Vacation** Beginning of vacation range
 * @apiSuccess {Date} [data.to] **Vacation** End of vacation range
 * @apiSuccess {Number} [data.days] **Vacation** Number of vacation days used in vacation range
 */
userRouter.get('/:id/:year/:month',
  header("Authorization").isString().contains("Bearer"),
  param("id").isString().isUUID(),
  param("year").isInt({ min: 2000, max: 3000 }),
  param("month").isInt({ min: 1, max: 12 }),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    getSelectedUserStats(req.params.id, req.params.year, req.params.month, token)
      .then((result) => res.json(result))
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

export default userRouter;
