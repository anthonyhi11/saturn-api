const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../src/config");

function makeOrganizationsArray() {
  return [
    {
      id: 1,
      name: "Stardew",
      org_passcode: "12345",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
    {
      id: 2,
      name: "Valley",
      org_passcode: "54321",
      date_created: new Date("2029-01-22T16:28:32.615Z"),
    },
  ];
}

function seedOrganizations(db, organizations) {
  return db.into("organizations").insert(organizations);
  // .then(() =>
  //   db.raw(`SELECT setval('organizations_id_seq', ?)`, [
  //     organizations[organizations.length - 1].id,
  //   ])
  // );
}

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: "Anthony",
      last_name: "Hill",
      email: "anthony@gmail.com",
      password: "Password123!",
      role: "admin",
      org_id: 1,
    },
    {
      id: 2,
      first_name: "Jamie",
      last_name: "Hill",
      email: "Jamie@gmail.com",
      password: "Password123!",
      role: "dev",
      org_id: 1,
    },
    {
      id: 3,
      first_name: "April",
      last_name: "Hill",
      email: "april@gmail.com",
      password: "Password123!",
      role: "admin",
      org_id: 2,
    },
  ];
}

function seedUsers(db, users) {
  const preppedUsers = users.map((user) => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1),
  }));
  return db
    .into("users")
    .insert(preppedUsers)
    .then(() =>
      db.raw(`SELECT setval('users_id_seq', ?)`, [users[users.length - 1].id])
    );
}

function createJwt(subject, payload) {
  return jwt.sign(payload, config.JWT_SECRET, {
    subject,
    algorithm: "HS256",
  });
}

function cleanTables(db) {
  return db.transaction((trx) =>
    trx
      .raw(
        `TRUNCATE
          users,
          organizations,
          projects,
          stages,
          stories,
          comments
        `
      )
      .then(() =>
        Promise.all([
          trx.raw(
            `ALTER SEQUENCE organizations_id_seq minvalue 0 START WITH 1`
          ),
          trx.raw(`ALTER SEQUENCE users_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE projects_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE stages_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE stories_id_seq minvalue 0 START WITH 1`),
          trx.raw(`ALTER SEQUENCE comments_id_seq minvalue 0 START WITH 1`),
          trx.raw(`SELECT setval('organizations_id_seq', 0)`),
          trx.raw(`SELECT setval('users_id_seq', 0)`),
          trx.raw(`SELECT setval('stages_id_seq', 0)`),
          trx.raw(`SELECT setval('projects_id_seq', 0)`),
          trx.raw(`SELECT setval('stories_id_seq', 0)`),
          trx.raw(`SELECT setval('comments_id_seq', 0)`),
        ])
      )
  );
}

module.exports = {
  cleanTables,
  makeUsersArray,
  seedUsers,
  makeOrganizationsArray,
  seedOrganizations,
  createJwt,
};
