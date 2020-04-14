StoriesService = {
  getStories(knex, project_id) {
    return knex.select("*").from("stories").where("project_id", project_id);
  },

  addStory(knex, newStory) {
    return knex
      .insert(newStory)
      .into("stories")
      .returning("*")
      .then((stories) => {
        return stories[0];
      });
  },

  deleteStory(knex, story_id) {
    return knex("stories").where("id", story_id).delete();
  },

  updateStory(knex, story_id, newInfo) {
    return knex("stories")
      .where("id", story_id)
      .update(newInfo)
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
};

module.exports = StoriesService;
