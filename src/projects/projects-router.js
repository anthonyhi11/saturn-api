const express = require("express");
const ProjectsService = require("./projects-service");
const { requireAuth } = require("../jwt-auth/jwt-auth");
const xss = require("xss");

const projectsRouter = express.Router();
const jsonBodyParser = express.json();

(serializeProject = (project) => ({
  name: xss(project.name),
  org_id: xss(project.org_id),
  id: project.id,
  status: project.status,
})),
  projectsRouter
    .route("/")
    .all(requireAuth)
    .get((req, res, next) => {
      ProjectsService.getProjects(req.app.get("db"), req.user.org_id)
        .then((projects) => {
          return res
            .status(200)
            .json(projects.map((project) => serializeProject(project)));
        })
        .catch(next);
    })
    .post(requireAuth, jsonBodyParser, (req, res, next) => {
      if (req.user.role !== "Admin") {
        return res
          .status(401)
          .json({ error: { message: "unauthorized request" } });
      }
      let newProject = {
        name: req.body.name,
        org_id: req.user.org_id,
        status: "Active",
      };
      ProjectsService.addProject(req.app.get("db"), newProject)
        .then((project) => res.status(201).json(serializeProject(project)))
        .catch(next);
    })
    .patch(requireAuth, jsonBodyParser, (req, res, next) => {
      if (req.user.role !== "Admin") {
        return res
          .status(401)
          .json({ error: { message: "Unauthorized request" } });
      }
      let newInfo = {
        id: req.body.id,
        name: req.body.name,
        status: req.body.status,
      };
      ProjectsService.updateProject(req.app.get("db"), req.body.id, newInfo)
        .then((project) => {
          return res.status(204).json(serializeProject(project));
        })
        .catch(next);
    });

module.exports = projectsRouter;
