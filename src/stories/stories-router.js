const express = require("express");
const StoriesService = require("./stories-service");
const { requireAuth } = require("../jwt-auth/jwt-auth");
const xss = require("xss");

const storiesRouter = express.Router();
const jsonBodyParser = express.json();

const sanitizeStory = (story) => ({
  title: xss(story.title),
  id: story.id,
  story_desc: xss(story.story_desc),
  stage_id: story.stage_id,
  project_id: story.project_id,
  user_id: story.user_id,
});

storiesRouter
  .route("/")
  .all(requireAuth)
  .get(jsonBodyParser, (req, res, next) => {
    let { project_id } = req.body;
    StoriesService.getStories(req.app.get("db"), project_id)
      .then((stories) => {
        res.status(200).json(stories.map((story) => sanitizeStory(story)));
      })
      .catch(next);
  })
  .post(requireAuth, jsonBodyParser, (req, res, next) => {
    let { user_id, project_id, stage_id, title, story_desc } = req.body;
    let newStory = {
      title: title,
      user_id: user_id,
      project_id: project_id,
      stage_id: stage_id,
      story_desc: story_desc,
    };
    StoriesService.addStory(req.app.get("db"), newStory)
      .then((story) => {
        res.status(201).json(sanitizeStory(story));
      })
      .catch(next);
  });

storiesRouter
  .route("/:storyId")
  .delete(requireAuth, (req, res, next) => {
    let { storyId } = req.params;
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ error: { message: "Unauthorized Request" } });
    }
    StoriesService.deleteStory(req.app.get("db"), storyId)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonBodyParser, requireAuth, (req, res, next) => {
    let { storyId } = req.params;
    let { title, user_id, stage_id, story_desc } = req.body;
    let newInfo = {
      title,
      user_id,
      stage_id,
      story_desc,
    };
    if (req.user.role !== "admin") {
      return res
        .status(401)
        .json({ error: { message: "Unauthorized reqest" } });
    }

    StoriesService.updateStory(req.app.get("db"), storyId, newInfo).then(
      (story) => {
        res.status(201).json(sanitizeStory(story));
      }
    );
  });

module.exports = storiesRouter;
