const express = require("express");
const StagesService = require("./stages-service");
const { requireAuth } = require("../jwt-auth/jwt-auth");
const xss = require("xss");

const stagesRouter = express.Router();
const jsonBodyParser = express.json();

const sanitizeStages = (stage) => ({
  name: xss(stage.name),
  id: stage.id,
});

stagesRouter
  .route("/")
  .get(requireAuth, (req, res, next) => {
    let loggedUser = req.user;
    StagesService.getStages(req.app.get("db"), loggedUser.org_id).then(
      (stages) => {
        return res
          .status(200)
          .json(stages.map((stage) => sanitizeStages(stage)));
      }
    );
  })
  .patch(requireAuth, jsonBodyParser, (req, res, next) => {
    let loggedUser = req.user;
    if (loggedUser.role !== "admin") {
      return res
        .status(401)
        .json({ error: { message: "Unauthorized Request" } });
    }
    let { name, id } = req.body;
    updatedStage = {
      name: name,
      id: id,
    };

    StagesService.updateStages(
      req.app.get("db"),
      loggedUser.org_id,
      id,
      updatedStage
    ).then(() => {
      return res.status(201).end();
    });
  });

module.exports = stagesRouter;
