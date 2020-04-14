const CommentsService = {
  getComments(knex, story_id) {
    return knex.select("*").from("comments").where("story_id", story_id);
  },

  addComment(knex, newComment) {
    return knex
      .insert(newComment)
      .into("comments")
      .returning("*")
      .then((rows) => rows[0]);
  },

  deleteComment(knex, comment_id) {
    return knex("comments").where("id", comment_id).delete();
  },
};

module.exports = CommentsService;
