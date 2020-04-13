require("dotenv");
const knex = require("knex");
const app = require("../src/app");
const {
  cleanTables,
  seedUsers,
  makeOrganizationsArray,
  makeUsersArray,
  seedOrganizations,
  createJwt,
} = require("../test/test-helpers");

describe("Projects Endpoints", () => {
  let db;
  const testOrganizations = makeOrganizationsArray();
  const testUsers = makeUsersArray();
  const adminUser = testUsers[0];
  const devUser = testUsers[1];
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

  describe.only("POST projects", () => {
    beforeEach("seeds db", () => {
      seedOrganizations(db, testOrganizations).then(() => {
        seedUsers(db, testUsers);
      });
    });

    it("returns a 201 with project cretaed", () => {
      let testUser = testUsers[0];

      let goodProject = {
        name: "New Project!",
        org_id: testUser.org_id,
      };

      return supertest(app)
        .post("/api/projects")
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .send(goodProject)
        .expect(201);
    });
  });
});
