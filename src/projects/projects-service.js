const ProjectsService = {
  getProjects(knex, orgId) {
    return knex.select("*").from("projects").where("org_id", orgId);
  },

  addProject(knex, newProject) {
    return knex
      .insert(newProject)
      .into("projects")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  updateProject(knex, projectId, newInfo) {
    return knex("projects")
      .where("id", projectId)
      .update(newInfo)
      .returning("*")
      .then(([project]) => project);
  },
};

module.exports = ProjectsService;
