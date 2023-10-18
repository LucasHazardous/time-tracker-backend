import express, { Request, Response } from "express";
const userRouter = express.Router();

import { login, logout } from "../service/user";
import { body, param } from 'express-validator';
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

userRouter.post('/logout', body('token').isString().isHexadecimal(), (req: Request, res: Response) => {
  if (handleValidationError(req, res)) return;

  logout(req.body.token)
    .then(() => res.sendStatus(200))
    .catch((err) => sendErrorStatusCode(err, res));
});

export default userRouter;