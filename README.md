# Serverless AWS Test Events

A serverless plugin to generate repeatable test events for AWS lambda.

>> This pacakge is still very much a work in progress. Right now the supported event types are very limited. Please request other event types or submit PRs to make this pacakge better!

This pacakge helps to generate consistant local JSON files to use as test events for your serverless AWS lambda functions.

## Installation

```bash
serverless plugin install serverless-aws-test-events
```

If you would like to use the `create-npm-shortcuts` you will need to have a based `invoke` function in the `scripts` in your `package.json` file.
An example would be

```json
"invoke": "serverless invoke -r us-west-2",
```

Here it is important to add any options you want to have when invoking any serverless function for test events (region, profile, etc).

## Commands

### `generate-events`

This command generates events for all or a select function (See "Configuration Options") defined in your `serverless.yml` file.

When run this command will look at your `serverless.yml` and the `events` declared for each of your functions in the current Serverless project.
From this information it will try to create a `default` test event from AWS templates (similar to those in the "Configure test event" dialog in the Lambada web console) based on the event type(s) declared.

#### Supported Event Types

* `schedule` - Creates an event based on the ["Amazon CloudWatch" template](./src/templates/schedule.json)

Any other event type will create a test event JSON file with an empty JSON object.

### `create-npm-shortcuts`

This command scans your test event directory and your current `package.json` file and will add any missing test event invocation scripts for all functions and test events, all the test events for a single function, or only a single test event for a single function (See "Configuration Options"). This command creates a base invoke command for each set of function and event as well as a `:dev` version which adds the `--stage dev` flag for ease of use.

For example if your test events are:

```
|-/test-events
|  |-/hello-world
|  |  |-cat.json
|  |  |-dog.json
|  |-/alexa
|  |  |-default.json
```

The command `serverless create-npm-shortcuts` would add the following to your `package.json` scripts:

```json
"invoke:hello-world:cat": "yarn invoke -f helloWorld -p test-events/hello-world/cat.json",
"invoke:hello-world:cat:dev": "yarn invoke:hello-world:cat -s dev",
"invoke:hello-world:dog": "yarn invoke -f helloWorld -p test-events/hello-world/dog.json",
"invoke:hello-world:dog:dev": "yarn invoke:hello-world:dog -s dev",
"invoke:alexa": "yarn invoke -f alex -p test-events/alexa/default.json",
"invoke:alexa:dev": "yarn invoke:alexa:dog -s dev",
```

If a script already exists with a given key, then this script will not overwrite it.

## Configuration Options

Both commands in this package take the following optional configuration options:

```
generate-events ............... Checks and generates any missing default events for serverless functions
    --test-event-dir / -d .............. directory to store test event json files (defaults to "test-events")
    --function / -f .................... function to create an event for
    --test-event-name / -e ............. name for test event (defaults to "default")
create-npm-shortcuts .......... Creates convenient npm scripts for all of your test events
    --test-event-dir / -d .............. directory to store test event json files (defaults to "test-events")
    --function / -f .................... function to create an event for
    --test-event-name / -e ............. name for test event
```

For both commands if a function name is provided, only that function will be acted on; otherwise the command will go through all of the functions declared in `serverless.yml`.

For `create-npm-shortcuts` if no `test-event-name` is provided then all events for a given function will have a script added. If a value is provided only that event will have a script added to `pacakge.json`


## Future Improvements

As this package evolves the following are possible improvements/features

* More event types
* Ability to populate the test events in the web console from test-events on disk
* Interactive CLI experience
