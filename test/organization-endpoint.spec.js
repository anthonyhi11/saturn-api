require("dotenv");
const knex = require("knex");
const app = require("../src/app");
const { cleanTables, seedOrganizations, makeOrganizationsArray } = require("./test-helpers");

describe("Organization Endpoint", function () {
  let db;
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

  describe("POST organization", () => {
    context("Validation", () => {
      it("responds with 400 and an error when name is missing", () => {
        const newOrg = {
          name: " ",
        };
        return supertest(app)
          .post("/api/organizations")
          .send(newOrg)
          .expect(400, {
            error: {
              message: "Missing organization name in request body",
            },
          });
      });

      context("Happy path!", () => {
        it("responds with a 201", () => {
          const newOrg = {
            name: "Test Name",
          };
          return supertest(app)
            .post("/api/organizations")
            .send(newOrg)
            .expect(201);
        });
      });
    });
  });
});
