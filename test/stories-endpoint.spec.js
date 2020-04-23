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
  seedStages,
  seedStories,
} = require("../test/test-helpers");

describe("Stories Endpoints", () => {
  let db;
  const testOrganizations = makeOrganizationsArray();
  const testUsers = makeUsersArray();
  let testProjects = makeProjectsArray();
  let testStages = makeStagesArray();
  let testStories = makeStoriesArray();
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

  describe("Stories /projectId path", () => {
    beforeEach("seeds db", () => {
      return seedOrganizations(db, testOrganizations).then(() => {
        return seedUsers(db, testUsers).then(() => {
          return seedProjects(db, testProjects).then(() => {
            return seedStages(db, testStages).then(() => {
              return seedStories(db, testStories);
            });
          });
        });
      });
    });
    it("gets stories and returns a 200", () => {
      return supertest(app)
        .get("/api/stories/1")
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .expect(200);
    });
    it("posts story and returns 201", () => {
      let newStory = {
        title: "New",
        user_id: 1,
        project_id: 1,
        stage_id: 2,
        story_desc: "Something new",
      };
      return supertest(app)
        .post("/api/stories/1")
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .send(newStory)
        .expect(201);
    });
  });

  describe("STORIES /storyId", () => {
    beforeEach("seeds db", () => {
      return seedOrganizations(db, testOrganizations).then(() => {
        return seedUsers(db, testUsers).then(() => {
          return seedProjects(db, testProjects).then(() => {
            return seedStages(db, testStages).then(() => {
              return seedStories(db, testStories);
            });
          });
        });
      });
    });
    it("deletes story returning 204", () => {
      return supertest(app)
        .delete("/api/stories/1")
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .expect(204);
    });
    it("edits and returns 201", () => {
      let newInfo = {
        title: "new",
        user_id: 1,
        stage_id: 3,
        story_desc: "blah blah",
      };
      return supertest(app)
        .patch("/api/stories/1")
        .set("Authorization", `bearer ${createJwt(adminSub, adminPayload)}`)
        .send(newInfo)
        .expect(201);
    });
  });
});
