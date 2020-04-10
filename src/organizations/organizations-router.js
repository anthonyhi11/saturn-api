const express = require("express");
const OrganizationsService = require("./organizations-service");
const generator = require("generate-password");

const organizationsRouter = express.Router();
const jsonBodyParser = express.json();

organizationsRouter
  .route("/")
  .post(jsonBodyParser, (req, res, next) => {
    const { name } = req.body;
    if (name == null || name == " ") {
      return res.status(400).json({
        error: {
          message: "Missing organization name in request body",
        },
      });
    }
    const password = generator.generate({
      length: 10,
      numbers: true,
      excludeSimilarCharacters: true
    });

    let newOrganization = {
      name: name,
      org_passcode: password,
    };

    OrganizationsService.addOrganization(req.app.get("db"), newOrganization)
      .then((organization) => {
        res.status(201).end();
      })
      .catch(next);
  })
  .get(jsonBodyParser, (req, res, next) => {
    let { passcode } = req.body;
    if (passcode == null) {
      return res.status(400).json({
        error: { message: "Must enter passcode" },
      });
    }
    OrganizationsService.getOrganization(req.app.get("db"), passcode).then(
      (organization) => {
        res.status(200).json(organization);
      }
    );
  });

module.exports = organizationsRouter;
