# [Project Wiki](http://localhost:8080/wiki)
For more information about the project and usefull links like swagger docs, postman collection visit wiki.
Start application using `docker-compose up`, then
it can be found here: [Project Wiki](http://localhost:8080/wiki)
[Swagger](http://localhost:8080/docs) can be found [here](http://localhost:8080/docs)

## Description

Boilerplate application, containing some functionality. Developed for evaluation

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod

#Or in docker-compose
docker-compose up

```

In order to have some randomly generated data, and properly migrated schema run

```
yarn db:reset
```
## Test

```bash
# unit tests
$ yarn test

# e2e tests
$ yarn test:e2e


# all tests with coverage report generation
$ yarn test:all:cov


```

## Running the app

```bash
# built
$ yarn build
$ yarn start

# watch mode
$ yarn start:dev

#Start axuilary containers like database etc
$ docker-compose up

# production mode
$ yarn start:prod
```

## Database utilities
```bash
# Shows changes in db compares currently build entities with db state
# NOTE: Ideally your app is running, as it takes into account dist folder
$ yarn db:changes 

# drops all schemas from database
$ yarn db:drop

# runs migrations, connects to db in docker
$ yarn migrate

```
### Generating migrations

 Typeorm, has a very useful feature that allows to generate migrations
from your entities.
In order to generate a new migration, for changes that had been done to entities please follow these steps

0. Run project `yarn start:dev`
1. Ensure that you have all migrations up to date `yarn migrate`
2. You can check what are changes with 'yarn db:changes'
3. Finally, when you ensured all is good and dandy, generate your new migrations
4. `yarn migration:generate`
5. Change a name of new migration that was created


``

### Remarks on e2e tests.
- e2e tests require docker to be installed on host machine.

- e2e tests are running its own docker containers and, mock configurations to
  connect to database or queues before test run on its own. No extra infrastructure
  is needed. This is accomplished using utility called `testcontainers`


## Notes
- Added header `role` to bypass per user limitation for fetching contracts data. TODO: implement authorization system, based on user roles.

## Limitation

- Use Node version 16.x.x to launch project. Async local storage, which is used for validation pipes, seems to not work as intended in newer versions of Node.

- Request was to use Sequelize. In order to focus as much as possible on production read setup, I decided to use TypeORM. In future implementation can be changed easily thanks to DAO abstraction.
