const OrganizationsService = {
  addOrganization(knex, organization) {
    return knex
      .insert(organization)
      .into("organizations")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  getOrganizationByPasscode(knex, passcode) {
    return knex
      .select("*")
      .from("organizations")
      .where("org_passcode", passcode); //returns the org info when supplied passcode
  },
  updateOrganization(knex, id, newInfo) {
    return knex("organizations")
      .where("id", id)
      .update(newInfo)
      .returning("*")
      .then(([org]) => org);
  },
};

module.exports = OrganizationsService;
