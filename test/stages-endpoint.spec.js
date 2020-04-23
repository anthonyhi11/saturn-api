const knex = require("knex");
const app = require("../src/app");
const {
  cleanTables,
  seedUsers,
  makeOrganizationsArray,
  makeUsersArray,
  seedOrganizations,
  createJwt,
  seedStages,
  makeStagesArray,
} = require("../test/test-helpers");

describe("STAGES endpoint", () => {
  let db;
  let testOrganizations = makeOrganizationsArray();
  let testUsers = makeUsersArray();
  let adminUser = testUsers[0];
  let testStages = makeStagesArray();
  let sub = adminUser.email;
  let payload = { user_id: adminUser.id };

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

  describe("get stages", () => {
    beforeEach("seed db", () => {
      return seedOrganizations(db, testOrganizations).then(() => {
        return seedUsers(db, testUsers).then(() => {
          return seedStages(db, testStages);
        });
      });
    });
    it("returns a 200 with stages", () => {
      return supertest(app)
        .get("/api/stages")
        .set("Authorization", `bearer ${createJwt(sub, payload)}`)
        .expect(200);
    });
  });
});
