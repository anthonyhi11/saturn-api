const express = require("express");
const OrganizationsService = require("./organizations-service");

const organizationsRouter = express.Router();
const jsonBodyParser = express.json();

organizationsRouter.route("/").get(jsonBodyParser, (req, res, next) => {
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
