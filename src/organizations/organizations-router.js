const express = require("express");
const OrganizationsService = require("./organizations-service");
const { requireAuth } = require("../jwt-auth/jwt-auth");
const organizationsRouter = express.Router();
const jsonBodyParser = express.json();

organizationsRouter
  .route("/:org_id")
  .patch(requireAuth, jsonBodyParser, (req, res, next) => {
    let userRole = req.user.role;

    if (userRole !== "admin") {
      return res
        .status(401)
        .json({ error: { message: "Unauthorized Request" } });
    }
    //need to make a decision on how they will update anything.
    let org_id = req.params.org_id;
    let { name } = req.body;
    let newOrgInfo = {
      name: name,
      date_modified: "now()",
    };

    OrganizationsService.updateOrganization(
      req.app.get("db"),
      org_id,
      newOrgInfo
    ).then((updatedOrganization) => {
      res.status(204).end();
    });
  });

module.exports = organizationsRouter;
