require("dotenv");
const knex = require("knex");
const app = require("../src/app");
const {
  cleanTables,
  seedOrganizations,
  makeOrganizationsArray,
} = require("./test-helpers");

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
});
