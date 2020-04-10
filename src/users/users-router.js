const express = require("express");
const UsersService = require("./users-service");
const OrganizationsService = require("../organizations/organizations-service");
const path = require("path");

const usersRouter = express.Router();
const jsonBodyParser = express.json();

usersRouter.route("/devsignup").post(jsonBodyParser, (req, res, next) => {
  let {
    first_name,
    last_name,
    email,
    password,
    password_confirm,
    passcode,
  } = req.body;

  //verify all request body is there
  for (const field of [
    "first_name",
    "last_name",
    "email",
    "password",
    "password_confirm",
    "passcode",
  ])
    if (!req.body[field]) {
      return res.status(400).json({
        error: { message: `Missing ${field} in request` },
      });
    }

  //verify password matches password_confirm
  if (password !== password_confirm) {
    return res.status(400).json({
      error: { message: "Passwords do not match" },
    });
  }

  //verify password meets strength requirement
  const passwordError = UsersService.validatePassword(password);
  if (passwordError) {
    return res.status(400).json({
      error: { message: passwordError },
    });
  }

  //verify email isn't already taken
  UsersService.hasEmail(req.app.get("db"), email).then((hasEmail) => {
    if (hasEmail) {
      return res.status(400).json({ error: `Email already exists. Log In` });
    }
  });

  //verify organization exists
  OrganizationsService.getOrganization(req.app.get("db"), passcode)
    .then((organization) => {
      if (organization[0] == null) {
        return res
          .status(400)
          .json({ error: { message: "Organization doesn't exist" } });
      }
      return organization;
    })
    .then((organization) => {
      return UsersService.hashPassword(password) //hashing password
        .then((hashedPassword) => {
          const newUser = {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            org_id: organization[0].id,
            role: "dev",
          };
          if (organization[0].id == null) {
            return res.status(400, {
              error: { message: "organization.id is null" },
            });
          }
          return UsersService.addUser(req.app.get("db"), newUser).then(
            (user) => {
              res.status(201).json(UsersService.serializeUser(user));
            }
          );
        });
    })
    .catch(next);
});

module.exports = usersRouter;
