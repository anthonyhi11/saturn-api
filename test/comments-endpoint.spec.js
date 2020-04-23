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
  makeStoriesArray,
  makeStagesArray,
  makeCommentsArray,
  seedComments,
  seedStages,
  seedStories,
} = require("../test/test-helpers");

describe("Comments Endpoints", () => {
  let db;
  const testOrganizations = makeOrganizationsArray();
  const testUsers = makeUsersArray();
  let testProjects = makeProjectsArray();
  let testStages = makeStagesArray();
  let testStories = makeStoriesArray();
  let testComments = makeCommentsArray();
  let adminUser = testUsers[0];
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

  describe("comments happy paths", () => {
    beforeEach("seeds db", () => {
      return seedOrganizations(db, testOrganizations).then(() => {
        return seedUsers(db, testUsers).then(() => {
          return seedProjects(db, testProjects).then(() => {
            return seedStages(db, testStages).then(() => {
              return seedStories(db, testStories).then(() => {
                return seedComments(db, testComments);
              });
            });
          });
        });
      });
    });

    it("gets comments", () => {
      return supertest(app).get("/api/comments/1").expect(200);
    });

    it("posts a comment", () => {
      let newComment = {
        user_id: 1,
        comment: "Something fresh homie",
      };
      return supertest(app)
        .post("/api/comments/1")
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .send(newComment)
        .expect(201);
    });

    it("deletes a comment", () => {
      return supertest(app).delete("/api/comments/1").expect(204);
    });
  });
});
