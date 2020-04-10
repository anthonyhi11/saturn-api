require("dotenv");
const knex = require("knex");
const app = require("../src/app");
const {
  cleanTables,
  seedUsers,
  makeOrganizationsArray,
  makeUsersArray,
  seedOrganizations,
} = require("../test/test-helpers");

describe("Users Endpoints", () => {
  let db;
  const testOrganizations = makeOrganizationsArray();

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

  describe("POST User", () => {
    context("validation", () => {
      beforeEach("seeds", () => {
        seedOrganizations(db, testOrganizations);
      });

      const requiredFields = [
        "first_name",
        "last_name",
        "email",
        "password",
        "password_confirm",
      ];

      requiredFields.forEach((field) => {
        const signUpAttempt = {
          first_name: "aeadsf",
          last_name: "asdlfakjdf",
          email: "asldfkajsdf",
          password: "Password123!",
          password_confirm: "Password123!",
          passcode: "asdflkj",
        };

        it(`responds with 400 and an error when any ${field} is missing from request`, () => {
          delete signUpAttempt[field];

          return supertest(app)
            .post("/api/users/devsignup")
            .send(signUpAttempt)
            .expect(400);
        });
      });
      // it("responds with 400 if passcode is incorrect or not there", () => {
      //   let incorrectPasscodeAttempt = {
      //     first_name: "aeadsf",
      //     last_name: "asdlfakjdf",
      //     email: "asldfkajsdf",
      //     password: "Password123!",
      //     password_confirm: "Password123!",
      //     passcode: "asdflkj",
      //   };
      //   return supertest(app)
      //     .post("/api/users/devsignup")
      //     .send(incorrectPasscodeAttempt)
      //     .expect(400, {
      //       error: {
      //         message: "Organization doesn't exist",
      //       },
      //     });
      // });
    });

    context("HAPPY PATH POST USER", () => {
      beforeEach("seeds", () => {
        seedOrganizations(db, testOrganizations);
      });

      it("responds with a 201 and a serialized user", () => {
        let successfulUser = {
          first_name: "Successful",
          last_name: "User",
          email: "wig@gmail.com",
          password: "Password123!",
          password_confirm: "Password123!",
          passcode: testOrganizations[0].org_passcode,
        };
        return supertest(app)
          .post("/api/users/devsignup")
          .send(successfulUser)
          .expect(201);
      });
    });
    context("happy path for admin sign up", () => {
      it("responds with a 201 and serialized user", () => {
        let goodAdminAttempt = {
          first_name: "Anthony",
          last_name: "Hill",
          email: "admin@gmail.com",
          password: "AAaa11!!",
          password_confirm: "AAaa11!!",
          org_name: "Stardew Crew",
        };
        supertest(app)
          .post("/api/users/adminsignup")
          .send(goodAdminAttempt)
          .expect(201);
      });
    });
  });
});
