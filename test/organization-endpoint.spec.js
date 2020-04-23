require("dotenv");
const knex = require("knex");
const app = require("../src/app");
const {
  cleanTables,
  createJwt,
  seedOrganizations,
  makeOrganizationsArray,
  seedUsers,
  makeUsersArray,
} = require("./test-helpers");

describe("Organization Endpoint", function () {
  let db;
  const testOrganizations = makeOrganizationsArray();
  const testUsers = makeUsersArray();
  const adminUser = testUsers[0];
  const adminSub = adminUser.email;
  const adminPayload = { user_id: adminUser.id };

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set("db", db);
  });

  after("disconnect from db", () => db.destroy());

  before("cleanup", () => cleanTables(db));

  afterEach("cleanup", () => cleanTables(db));

  describe("ORGANIZATIONS", () => {
    beforeEach("seeds db", () => {
      return seedOrganizations(db, testOrganizations).then(() => {
        seedUsers(db, testUsers);
      });
    });
    it("returns a 200 and the org", () => {
      return supertest(app)
        .get("/api/organizations")
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .expect(200);
    });
    it("returns a 201", () => {
      let testOrg = testOrganizations[0];
      let newInfo = {
        name: "new name",
      };
      return supertest(app)
        .patch(`/api/organizations/${testOrg.id}`)
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .send(newInfo)
        .expect(201);
    });
  });
});
