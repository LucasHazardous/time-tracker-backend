import express, { Request, Response } from "express";
import { createUser, deleteUser, editUser, getUserList, getUserStats } from "../service/user";
import { body, header, param } from 'express-validator';
import { minPasswordLength } from '../config/config';
import { sendErrorStatusCode, handleValidationError } from '../error/api';

const userRouter = express.Router();

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

userRouter.get('/', header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  getUserList(token)
    .then((result) => res.json(result))
    .catch((err) => sendErrorStatusCode(err, res));
});

userRouter.put('/:id',
  header("Authorization").isString().contains("Bearer"),
  param("id").isString().isUUID(),
  body("username").isString().optional(),
  body("password").isString().isLength({min: minPasswordLength}).optional(),
  body("admin").isBoolean().optional(),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;

    const token = req.get("Authorization")!.substring(7);

    editUser(req.params.id, req.body.username, req.body.password, req.body.admin, token)
      .then(() => res.sendStatus(200))
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

userRouter.get('/:year/:month', header("Authorization").isString().contains("Bearer"), param("year").isInt({ min: 2000, max: 3000 }), param("month").isInt({ min: 1, max: 12 }), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  getUserStats(req.params.year, req.params.month, token)
    .then((result) => res.json(result))
    .catch((err) => sendErrorStatusCode(err, res));
});

export default userRouter;
