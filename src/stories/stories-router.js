const express = require("express");
const StoriesService = require("./stories-service");
const { requireAuth } = require("../jwt-auth/jwt-auth");
const xss = require("xss");

const storiesRouter = express.Router();
const jsonBodyParser = express.json();

storiesRouter
  .route("/")
  .all(requireAuth)
  .get((req, res, next) => {
    let loggedUser = req.user;
    StoriesService.getStories(req.app.get('db'), loggedUser)

  });
