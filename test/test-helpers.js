const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../src/config");

function makeOrganizationsArray() {
  return [
    {
      name: "Stardew",
      org_passcode: "foo",
      id: 1,
    },
    {
      name: "Valley",
      org_passcode: "bar",
      id: 2,
    },
  ];
}

function seedOrganizations(db, organizations) {
  return db.insert(organizations).into("organizations");
}

function makeUsersArray() {
  return [
    {
      id: 1,
      first_name: "Anthony",
      last_name: "Hill",
      email: "anthony@gmail.com",
      password: "Password123!",
      role: "Admin",
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
      role: "Admin",
      org_id: 2,
    },
  ];
}

function makeStagesArray() {
  return [
    {
      id: 1,
      org_id: 1,
      name: "New",
    },
    {
      id: 2,
      org_id: 1,
      name: "New",
    },
    {
      id: 3,
      org_id: 1,
      name: "New",
    },
    {
      id: 4,
      org_id: 1,
      name: "New",
    },
    {
      id: 5,
      org_id: 2,
      name: "New",
    },
    {
      id: 6,
      org_id: 2,
      name: "New",
    },
    {
      id: 7,
      org_id: 2,
      name: "New",
    },
    {
      id: 8,
      org_id: 2,
      name: "New",
    },
  ];
}
function seedStages(db, stages) {
  return db.insert(stages).into("stages");
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

function makeProjectsArray() {
  return [
    {
      name: "project 1",
      org_id: 1,
      status: "Active",
    },
    { name: "project 2", org_id: 2, status: "Active" },
    { name: "project 3", org_id: 1, status: "Active" },
  ];
}

function seedProjects(db, projects) {
  return db.into("projects").insert(projects);
}

function makeStoriesArray() {
  return [
    {
      project_id: 1,
      user_id: 1,
      stage_id: 1,
      title: "Test Title",
      story_desc:
        "This is a story. As a user I want to click on a story and see all the comments",
    },
    {
      project_id: 1,
      user_id: 2,
      stage_id: 1,
      title: "Test Title",
      story_desc:
        "This is a story. As a user I want to click on a story and see all the comments",
    },
    {
      project_id: 2,
      user_id: 3,
      stage_id: 2,
      title: "Test Title",
      story_desc:
        "THis is a story. As a user I want to click on a story and see all the comments",
    },
    {
      project_id: 2,
      user_id: 3,
      stage_id: 4,
      title: "Test Title",
      story_desc:
        "THis is a story. As a user I want to click on a story and see all the comments",
    },
  ];
}

function seedStories(db, stories) {
  return db.into("stories").insert(stories);
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
  seedProjects,
  makeProjectsArray,
  makeStoriesArray,
  seedStories,
  createJwt,
  seedStages,
  makeStagesArray,
};
