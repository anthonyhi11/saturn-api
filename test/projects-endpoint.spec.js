const knex = require("knex");
const app = require("../src/app");
const {
  cleanTables,
  seedUsers,
  makeOrganizationsArray,
  makeUsersArray,
  seedOrganizations,
  makeProjectsArray,
  seedProjects,
  createJwt,
} = require("../test/test-helpers");

describe("Projects Endpoints", () => {
  let db;
  const testOrganizations = makeOrganizationsArray();
  const testUsers = makeUsersArray();
  let testProjects = makeProjectsArray();
  let project = testProjects[0];
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

  describe("POST projects", () => {
    beforeEach("seeds db", () => {
      return seedOrganizations(db, testOrganizations).then(() => {
        return seedUsers(db, testUsers).then(() => {
          return seedProjects(db, testProjects);
        });
      });
    });

    it("gets projects returns 200", () => {
      return supertest(app)
        .get("/api/projects")
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .expect(200);
    });

    it("returns a 201 with project created", () => {
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

    it("patches and returns with 204", () => {
      let newProjectInfo = {
        id: 1,
        name: "New Name",
        status: "Archive",
      };
      return supertest(app)
        .patch("/api/projects")
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .send(newProjectInfo)
        .expect(204);
    });
  });
});
