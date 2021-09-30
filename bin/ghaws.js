#! /usr/bin/env node

import process from 'node:process';
import yargs from 'yargs';
import {hideBin} from 'yargs/helpers';
import ghaws from '../index.js';

const argv = yargs(hideBin(process.argv))
  .options({
    organization: {
      alias: 'o',
      demandOption: true,
      default: '2iq',
      describe: 'Specify GitHub organization',
      type: 'string',
    },
    repository: {
      alias: 'r',
      demandOption: true,
      describe: 'Specify GitHub repository name',
      type: 'string',
    },
    'aws-account': {
      alias: 'a',
      demandOption: true,
      describe: 'Specify AWS account to be used',
      type: 'string',
    },
  })
  .argv;

const config = {
  orgaName: argv.organization,
  repoName: argv.repository,
  awsAccountName: argv.awsAccount,
};

ghaws(config);
