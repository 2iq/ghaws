# ghaws - GitHub Actions and AWS

Helpers to interact between GitHub Actions and AWS.

## Summary

ghaws is a small lib that collects helpers to interact between GitHub Actions and AWS.

At the moment, there is only one functionality: Create AWS credentials and upload those to GitHub Repo as Actions secrets.

## Usage

You can use it as a library in your project or as a CLI tool.

### Usage as a CLI tool

#### CLI Installation

To use it globally, you can install it via npm:

```shell
npm install -g @2iq/ghaws
```

After the step above, you should be able to execute it:

```shell
$ ghaws ...
...
```

It's also possible to use it as a local dependency.
In the example below, you can see how to add it as a dependency to the `package.json` file:

```js
{
  // ...
  "devDependencies": {
    "@2iq/ghaws": "0.0.0",
    // ...
  },
  // ...
}
```

After `npm install`, the lib is available and can be called via `npx`:

```shell
$ npx ghaws ...
...
```

#### CLI Usage

The CLI usage should be evident from the `--help` output:

```shell
Options:
      --help          Show help                                        [boolean]
      --version       Show version number                              [boolean]
  -o, --organization  Specify GitHub organization
                                            [string] [required] [default: "2iq"]
  -r, --repository    Specify GitHub repository name         [string] [required]
  -a, --aws-account   Specify AWS account to be used         [string] [required]
```

### Usage as a lib

First, add a ghaws dependency to the `package.json` file:

```js
{
  // ...
  "dependencies": {
    "@2iq/ghaws": "0.0.0",
    // ...
  },
  // ...
}
```

Then you can use it in the code:

```js
import ghaws from '@2iq/ghaws';

// ...

const config = {
  orgaName: 'GitHub organization',
  repoName: 'GitHub repository name',
  awsAccountName: 'AWS account name',
};

ghaws(config);
```

The last call will create new AWS credentials and upload them to the given GitHub repository secrets.
