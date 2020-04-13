const StagesService = {
  getStages(knex, orgId) {
    return knex.select("*").from("stages").where("org_id", orgId);
  },

  addStages(knex, newStage) {
    return knex
      .insert(newStage)
      .into("stages")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  updateStages(knex, org_id, id, newInfo) {
    return knex("stages")
      .where("org_id", org_id)
      .where("id", id)
      .update(newInfo)
      .returning("*")
      .then(([stage]) => stage);
  },
};

module.exports = StagesService;
