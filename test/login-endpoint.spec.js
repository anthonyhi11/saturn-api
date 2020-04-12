require("dotenv");
const knex = require("knex");
const jwt = require("jsonwebtoken");
const {
  makeUsersArray,
  cleanTables,
  seedUsers,
  makeOrganizationsArray,
  seedOrganizations,
} = require("./test-helpers");
const app = require("../src/app");

describe(`Login Endpoints`, () => {
  let db;
  const testUsers = makeUsersArray();
  const testUser = testUsers[0];
  const testOrgs = makeOrganizationsArray();

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

  describe("post /api/login", () => {
    beforeEach("insert users", () => {
      seedOrganizations(db, testOrgs);
      seedUsers(db, testUsers);
    });

    const requiredFields = ["email", "password"];

    requiredFields.forEach((field) => {
      const loginAttempt = {
        email: testUser.email,
        password: testUser.password,
      };

      it(`responds with 400 when ${field} is missing`, () => {
        delete loginAttempt[field];

        return supertest(app)
          .post("/api/login")
          .send(loginAttempt)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it("responds 400 when bad email", () => {
      const invalidUser = {
        email: "not",
        password: "exists",
      };
      return supertest(app).post("/api/login").send(invalidUser).expect(400, {
        error: `Incorrect email or password`,
      });
    });

    it("responds 400 when bad pass", () => {
      const invalidPass = {
        email: testUser.email,
        password: "bad",
      };
      return supertest(app).post("/api/login").send(invalidPass).expect(400, {
        error: `Incorrect email or password`,
      });
    });

    it("responds with 200 and JWT auth token when valid", () => {
      const userValidCreds = {
        email: testUser.email,
        password: testUser.password,
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id },
        process.env.JWT_SECRET,
        {
          subject: testUser.email,
          algorithm: "HS256",
        }
      );
      return supertest(app)
        .post("/api/login")
        .send(userValidCreds)
        .then(() => {
          expect(200, {
            authToken: expectedToken,
          });
        });
    });
  });
});
