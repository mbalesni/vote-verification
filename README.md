# Paperday Verification App 

## Deploying to Heroku

This is ready for deployment, assuming you have an account with Heroku and have installed the Heroku CLI tools.
Note: This repo uses NPM. For yarn, you will have to change the command in package.json to `"heroku-postbuild": "cd client && yarn && yarn build"`

1. Clone this repo.
2. In the root directory of the repo, run `heroku create`.
3. Run `git push heroku master` which will build the frontend and deploy it and the backend to Heroku.
