# Devagram

An instagram infra abstraction created with a serverless architecture.

## Tech stack

- [Serverless framework](https://www.serverless.com/)
- Node.js
- Typescript
- AWS (DynamoDB, S3, Lambda, Cognito)

## Commands

- `sls deploy` to deploy changes to AWS and get the list of endpoints created.

#### Command Params

- `--region {name}` sets the regions in which the infra will deploy.
- `--stage {name}` sets the stage environment. ie: `dev`, `dev2`, `hml`, `prod` etc.
- `--param="level={levelName}` sets the level of logs which should log on CloudWatch.

## API

- Endpoints are created in `src/functions` folder. each function, in each file, is a different endpoint.
- The API configuration is on `serverless.yml` file, on `functions` block.

## Testing the API

- I'm using [Hoppscotch](https://hoppscotch.io/) to test the API, making simple requests adding data manually.

## Logs

- I'm using [Winston](https://github.com/winstonjs/winston/tree/2.x) to manage logs with logs levels. As you can see in `serverless.yml` file, there is a cli param called level (`--param="level={levelName}"`) where you can inform which log level you want, setting an ENV variable. So `info` and `debug` logs will only display if the ENV variable is set to do so, making the logs organized by the log levels you want.
