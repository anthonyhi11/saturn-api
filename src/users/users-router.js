const express = require("express");
const UsersService = require("./users-service");
const xss = require("xss");
const OrganizationsService = require("../organizations/organizations-service");
const path = require("path");
const { requireAuth } = require("../jwt-auth/jwt-auth");
const generator = require("generate-password");
const StagesService = require("../stages/stages-service");
const usersRouter = express.Router();
const jsonBodyParser = express.json();

const serializeUser = (user) => ({
  first_name: xss(user.first_name),
  last_name: xss(user.last_name),
  email: xss(user.email),
  role: user.role,
  id: user.id,
});

usersRouter.route("/").get(requireAuth, (req, res, next) => {
  let user = req.user;
  UsersService.getUsersById(req.app.get("db"), user.id).then((user) => {
    res.status(200).json(UsersService.serializeUser(user));
  });
});

usersRouter.route("/all").get(requireAuth, (req, res, next) => {
  let user = req.user;
  UsersService.getUsers(req.app.get("db"), user.org_id).then((users) => {
    res.status(200).json(users.map((user) => UsersService.serializeUser(user)));
  });
});

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

  UsersService.hasEmail(req.app.get("db"), email).then((hasEmail) => {
    if (hasEmail) {
      return res
        .status(400)
        .json({ error: { message: `Email already taken` } });
    } else {
      //verify organization exists
      OrganizationsService.getOrganizationByPasscode(
        req.app.get("db"),
        passcode
      )
        .then((organization) => {
          if (organization[0] === undefined) {
            return res
              .status(404)
              .json({ error: { message: "Organization doesn't exist" } });
          } else {
            return organization;
          }
        })
        .then((organization) => {
          if (organization[0] === undefined) {
            return res.status(404, {
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
                  role: "Developer",
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

  UsersService.hasEmail(req.app.get("db"), email).then((hasEmail) => {
    if (hasEmail) {
      return res
        .status(400)
        .json({ error: { message: `Email already taken` } });
    } else {
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
                role: "Admin",
              };
              return newUser;
            })
            .then((newUser) => {
              return UsersService.addUser(req.app.get("db"), newUser).then(
                (user) => {
                  //adding the initial stages.........
                  let Stages = [
                    {
                      name: "New",
                      org_id: user.org_id,
                    },
                    {
                      name: "Working",
                      org_id: user.org_id,
                    },
                    {
                      name: "Blocked",
                      org_id: user.org_id,
                    },
                    {
                      name: "Done",
                      org_id: user.org_id,
                    },
                  ];
                  Stages.forEach((stage) => {
                    StagesService.addStages(req.app.get("db"), stage);
                  });
                  return res.status(201).json(UsersService.serializeUser(user));
                }
              );
            });
        })
        .catch(next);
    }
  });
});

usersRouter.route("/:userId").delete(requireAuth, (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(401).json({ error: { message: "Unauthorized request" } });
  }
  let user_id = req.params.userId;

  UsersService.deleteUser(req.app.get("db"), user_id).then(() => {
    res.status(204).end();
  });
});

usersRouter
  .route("/personalsettings")
  .patch(requireAuth, jsonBodyParser, (req, res, next) => {
    let loggedUserId = req.user.id;
    let { email, password, password_confirm, first_name, last_name } = req.body;
    //verify all required info is there.
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

    if (email !== req.user.email) {
      UsersService.hasEmail(req.app.get("db"), email).then((hasEmail) => {
        if (hasEmail) {
          return res.status(400).json({ error: `Email already taken` });
        } else {
          UsersService.hashPassword(password).then((hashedPass) => {
            let newInfo = {
              email,
              password: hashedPass,
              first_name,
              last_name,
            };

            UsersService.updateUser(
              req.app.get("db"),
              loggedUserId,
              newInfo
            ).then((updatedUser) => {
              res.status(201).end();
            });
          });
        }
      });
    } else {
      UsersService.hashPassword(password).then((hashedPass) => {
        let newInfo = {
          email,
          password: hashedPass,
          first_name,
          last_name,
        };

        UsersService.updateUser(req.app.get("db"), loggedUserId, newInfo).then(
          (updatedUser) => {
            res.status(201).end();
          }
        );
      });
    }
  });

module.exports = usersRouter;
