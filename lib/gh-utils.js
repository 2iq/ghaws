import {Buffer} from 'node:buffer';
import fs from 'node:fs';
import os from 'node:os';
import yaml from 'js-yaml';
import sodium from 'tweetsodium';

export const getToken = () => {
  const readToken = () => {
    /* eslint-disable operator-linebreak */
    const token =
        readTokenFromEnvVariable() ||
        readTokenFromHostsFile();
    /* eslint-enable operator-linebreak */

    // TODO what happens if no token was found?

    return token;
  };

  // eslint-disable-next-line arrow-body-style
  const readTokenFromEnvVariable = () => {
    // TODO check if GITHUB_TOKEN env variable exists and return if yes
    //
    return null;
  };

  const readTokenFromHostsFile = () => {
    const homedir = os.homedir();
    const ghHostsFile = `${homedir}/.config/gh/hosts.yml`;

    let ghHostFile;
    try {
      ghHostFile = yaml.load(fs.readFileSync(ghHostsFile, 'utf8'));
    } catch (error) {
      throw new Error(`Could not read '${ghHostsFile}' file. Caused by: ${error}`);
    }

    const token = ghHostFile?.['github.com']?.oauth_token;
    if (!token) {
      throw new Error(`Token for github.com is not existent in '${ghHostsFile}' file.`);
    }

    return token;
  };

  return readToken();
};

export const encryptSecret = (secretPlaintext, publicKey) => {
  const secretPlaintextBytes = Buffer.from(secretPlaintext);
  const publicKeyBytes = Buffer.from(publicKey, 'base64');

  const secretEncryptedBytes = sodium.seal(secretPlaintextBytes, publicKeyBytes);

  const secretEncrypted = Buffer.from(secretEncryptedBytes).toString('base64');

  return secretEncrypted;
};
