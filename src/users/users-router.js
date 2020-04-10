const express = require("express");
const UsersService = require("./users-service");
const OrganizationsService = require("../organizations/organizations-service");
const path = require("path");
const generator = require("generate-password");

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
  OrganizationsService.getOrganizationByPasscode(req.app.get("db"), passcode)
    .then((organization) => {
      console.log("this is the org", organization[0]);
      if (organization[0] == null) {
        return res
          .status(400)
          .json({ error: { message: "Organization doesn't exist" } });
      } else {
        return organization;
      }
    })
    .then((organization) => {
      if (organization[0] == null) {
        return res.status(400, {
          error: { message: "organization.id is null" },
        });
      } else {
        UsersService.hashPassword(password) //hashing password
          .then((hashedPassword) => {
            const newUser = {
              first_name,
              last_name,
              email,
              password: hashedPassword,
              org_id: organization[0].id,
              role: "dev",
            };
            return newUser;
          })
          .then((newUser) => {
            return UsersService.addUser(req.app.get("db"), newUser).then(
              (user) => {
                res.status(201).json(UsersService.serializeUser(user));
              }
            );
          })
          .catch(next);
      }
    });
});

//admin sign up creates an organization. Creates an admin account and associates the new org_id to the admin account.
usersRouter.route("/adminsignup").post(jsonBodyParser, (req, res, next) => {
  let {
    first_name,
    last_name,
    email,
    password,
    password_confirm,
    org_name,
  } = req.body;
  //verify all request body is there
  for (const field of [
    "first_name",
    "last_name",
    "email",
    "password",
    "password_confirm",
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

  //create ORGANIZATION!

  if (org_name == null || org_name == " ") {
    return res.status(400).json({
      error: {
        message: "Missing organization name in request body",
      },
    });
  }
  const passcode = generator.generate({
    length: 10,
    numbers: true,
    excludeSimilarCharacters: true,
  });

  let newOrganization = {
    name: org_name,
    org_passcode: passcode,
  };

  OrganizationsService.addOrganization(req.app.get("db"), newOrganization)
    .then((organization) => {
      return organization;
    })
    .then((organization) => {
      let org_id = organization.id;
      UsersService.hashPassword(password) //hashing password
        .then((hashedPassword) => {
          const newUser = {
            first_name,
            last_name,
            email,
            password: hashedPassword,
            org_id,
            role: "admin",
          };
          return newUser;
        })
        .then((newUser) => {
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
