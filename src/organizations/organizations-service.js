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

  getOrganization(knex, passcode) {
    return knex
      .select("*")
      .from("organizations")
      .where("org_passcode", passcode); //returns the org info when supplied passcode
  },
};

module.exports = OrganizationsService;
