# Devagram

## Technologies used

- Serverless framework
- Node
- Typescript
- AWS
- DynamoDB, S3, Lambda

## Commands

- `sls deploy` to deploy changes to AWS and get the list of endpoints created.

## API

- endpoints are created in `src/functions` folder. each function, in each file, is a different endpoint, which builds and url `{random-url-generated-by-aws}/{function-name}`.
- the api configuration is on `serverless.yml` file.

## Testing the API

- I'm using [Hoppscotch](https://hoppscotch.io/) to test the API, making simple requests adding data manually.

## Logs

- I'm using [Winston](https://github.com/winstonjs/winston/tree/2.x) to manage logs with logs levels. As you can see in `serverless.yml` file, there is a cli param called level (`--param="level={levelName}"`) where you can inform which log level you want, setting an ENV variable. So `info` and `debug` logs will only display if the ENV variable is set to do so, making the logs organized by the log levels you want.
