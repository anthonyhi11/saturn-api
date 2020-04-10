const express = require("express");
const OrganizationsService = require("./organizations-service");

const organizationsRouter = express.Router();
const jsonBodyParser = express.json();

organizationsRouter
  .route("/:org_id")
  .patch(jsonBodyParser, (req, res, next) => {
    //need to make a decision on how they will update anything.
    let org_id = req.params.org_id;
    let { name } = req.body;
    let newOrgInfo = {
      name: name,
      date_modified: 'now()',
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
