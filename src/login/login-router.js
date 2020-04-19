const express = require("express");
const LoginService = require("./login-service");

const loginRouter = express.Router();
const jsonBodyParser = express.json();

loginRouter.route("/").post(jsonBodyParser, (req, res, next) => {
  const { email, password } = req.body;
  const loginUser = { email, password };
  for (const [key, value] of Object.entries(loginUser))
    if (value == null) {
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` },
      });
    }
  LoginService.getUserWithEmail(req.app.get("db"), loginUser.email)
    .then((dbUser) => {
      if (!dbUser) {
        return res.status(400).json({
          error: { message: `Incorrect email or password` },
        });
      } else {
        return LoginService.comparePasswords(
          loginUser.password,
          dbUser.password
        ).then((compareMatch) => {
          if (!compareMatch) {
            return res.status(400).json({
              error: { message: `Incorrect email or password` },
            });
          }
          const sub = dbUser.email;
          const payload = { user_id: dbUser.id };
          res.status(200).send({
            authToken: LoginService.createJwt(sub, payload),
          });
        });
      }
    })
    .catch(next);
});

module.exports = loginRouter;
