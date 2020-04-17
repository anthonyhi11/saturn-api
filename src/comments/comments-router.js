const express = require("express");
const CommentsService = require("./comments-service");
const { requireAuth } = require("../jwt-auth/jwt-auth");
const xss = require("xss");

const commentsRouter = express.Router();
const jsonBodyParser = express.json();

const serializeComments = (comment) => ({
  user_id: comment.user_id,
  comment: comment.comment,
  story_id: comment.story_id,
  id: comment.id,
});

commentsRouter
  .route("/:story_id")
  .get((req, res, next) => {
    let { story_id } = req.params;
    CommentsService.getComments(req.app.get("db"), story_id)
      .then((comments) => {
        res
          .status(200)
          .json(comments.map((comment) => serializeComments(comment)));
      })
      .catch(next);
  })
  .post(jsonBodyParser, requireAuth, (req, res, next) => {
    let { story_id } = req.params;
    let user_id = req.user.id;
    let { comment } = req.body;

    let newComment = {
      story_id,
      user_id,
      comment,
    };

    CommentsService.addComment(req.app.get("db"), newComment).then(
      (comment) => {
        res.status(201).json(serializeComments(comment));
      }
    );
  });

commentsRouter.route("/:commentId").delete((req, res, next) => {
  let comment_id = req.params.commentId;
  CommentsService.deleteComment(req.app.get("db"), comment_id).then(() => {
    res.status(204).end();
  });
});

module.exports = commentsRouter;
