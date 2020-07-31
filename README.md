# Saturn

### This is an API for Saturn. A project management tool for software development teams.

This is the API for the Saturn-Client

Live Client: https://saturn-blush.now.sh

CLIENT REPO: https://github.com/anthonyhi11/saturn-client


![](https://media.giphy.com/media/Ynf1JVlfTPQoYA6zMn/giphy.gif)

## GETTING STARTED

### INSTALLING

`npm install`

### Create database and test database

### Run migrations

`npm run migrate`

### Running the tests

`npm run test`

## ENDPOINTS

### /api/users

- GET -- gets logged-in user info, mainly for verification and views on certain paths.

  ## /all

- GET -- gets every user, used by the client to show list of team members for a certain organization. Only by an admin.

  ## /adminsignup

  - POST -- creates an organization and admin user associated to that organization.

  ## /devsignup

  - POST -- creates a new dev user and associates it with an existing organization.

  ## /:userId

  - DELETE -- deletes user. Can only be done by an admin role.

  - PATCH -- edits the current user.

### /api/login

- POST -- logs in user. User must already be signed up via devsignup or adminsignup.

### /api/organizations

- GET -- gets organization of logged-in user. For Display purposes

  ## /:org_id

  - PATCH -- Edit the organization name or passcode // admin only

### /api/projects

- POST -- Creates a new project to associate to the organization. Admin only
- GET -- gets projects associated to the signed in user's organization id.

- PATCH -- Updates the project to either archived or active. This is for toggling to show on the main page.

### /api/stories

## /:project_id

- GET -- gets the stories related the project ID.

- POST -- Posts a new story to the specific project.

## /:storyId

- DELETE -- deletes the specific story. Admin only.

- PATCH -- edits the story. Admin only.

### /api/comments

## /:story_id

- GET -- gets comments related to a specific story

- POST -- creates a new comment and relates it to the story

## /:commentID

- DELETE -- deletes comment. Only allowed by user who posted teh comment

### /api/stages

- GET -- gets the stages associated to the organization

## TECH USED

Built using Node, Express, PostgreSQL, JWT, Mocha, Chai, knex

## ROADMAP

### v1.2

1. Archive stories to remove from kanban.
2. Edit the stage names. COMING VERY SOON

### v1.3

1. Email notifications for when a story is assigned to a dev
2. give admin access to a dev account
