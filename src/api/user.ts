import express, { Request, Response } from "express";
const userRouter = express.Router();

import { createUser, getUserList, login, logout } from "../service/user";
import { body, header, param } from 'express-validator';
import { minPasswordLength } from '../config/config';
import { sendErrorStatusCode, handleValidationError } from '../error/api';

userRouter.post(
  '/login',
  body('username').isString(),
  body('password').isString().isLength({
    min: minPasswordLength,
  }),
  (req: Request, res: Response) => {
    if (handleValidationError(req, res)) return;


    login(req.body.username, req.body.password)
      .then((token) =>
        res.json({
          token: token,
        })
      )
      .catch((err) => sendErrorStatusCode(err, res));
  }
);

userRouter.delete('/logout', 
header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  logout(token)
    .then(() => res.sendStatus(200))
    .catch((err) => sendErrorStatusCode(err, res));
});

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

userRouter.get('/', header("Authorization").isString().contains("Bearer"), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  const token = req.get("Authorization")!.substring(7);

  getUserList(token)
    .then((result) => res.json(result))
    .catch((err) => sendErrorStatusCode(err, res));
});

export default userRouter;
