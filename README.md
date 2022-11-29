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
 - I'm using Hoppscotch to test the API, making simple requests adding data manually.
