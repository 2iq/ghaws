import {
  fromIni as fromAwsCredentialsFile,
} from '@aws-sdk/credential-provider-ini';
import {
  IAMClient,
  CreateAccessKeyCommand,
} from '@aws-sdk/client-iam';
import {Octokit} from '@octokit/rest';
import {
  getToken as getGitHubToken,
  encryptSecret,
} from './lib/gh-utils.js';

export default async function ghaws(passedConfig) {
  const config = await enrichConfig(passedConfig);
  const accessKey = await createAwsAccessKey(config);
  await setGitHubRepoActionsSecrets(accessKey, config);
}

const enrichConfig = async passedConfig => {
  const orgaName = passedConfig.orgaName; // TODO default from git from current directory
  const repoName = passedConfig.repoName; // TODO default from git from current directory
  const awsAccountName = passedConfig.awsAccountName; // TODO default from serverless.yml file?

  const config = {
    orgaName,
    repoName,
    awsAccountName,
    ghaAccessUserName: `${repoName}-gha-access`, // TODO from cf-stack `GhaUser`
    ghaSecretPrefix: awsAccountName.toUpperCase(),
  };

  return Promise.resolve(config);
};

const createAwsAccessKey = async ({awsAccountName, ghaAccessUserName}) => {
  console.log(`create accesskey for ${awsAccountName} aws account`);

  const iam = new IAMClient({
    credentials: fromAwsCredentialsFile({profile: awsAccountName}),
  });
  const createAccessKeyCmd = new CreateAccessKeyCommand({
    UserName: ghaAccessUserName,
  });

  try {
    const response = await iam.send(createAccessKeyCmd);
    return response.AccessKey;
  } catch (error) {
    throw new Error(`Could not create new aws AccessKey. Caused by:\n${error}`);
  }
};

const setGitHubRepoActionsSecrets = async ({AccessKeyId, SecretAccessKey}, {orgaName, repoName, ghaSecretPrefix}) => {
  console.log('create/update GitHub secrets');

  const octokit = new Octokit({
    auth: getGitHubToken(),
  });

  const deployRepoActionsSecrets = async () => {
    const ghRepo = await fetchGhRepoPublicKey();

    const awsAccessKeyId = encryptSecret(AccessKeyId, ghRepo.key);
    const awsSecretAccessKey = encryptSecret(SecretAccessKey, ghRepo.key);

    // TODO can be done in parallel
    await createOrUpdateRepoActionSecret('AWS_ACCESS_KEY_ID', awsAccessKeyId, ghRepo.keyId);
    await createOrUpdateRepoActionSecret('AWS_SECRET_ACCESS_KEY', awsSecretAccessKey, ghRepo.keyId);
  };

  const fetchGhRepoPublicKey = async () => {
    const repoPublicKey = await octokit.actions.getRepoPublicKey({
      owner: orgaName,
      repo: repoName,
    });

    return {
      keyId: repoPublicKey.data.key_id,
      key: repoPublicKey.data.key,
    };
  };

  const createOrUpdateRepoActionSecret = (ghaSecretSuffix, encryptedValue, keyId) => {
    /* eslint-disable camelcase */
    octokit.actions.createOrUpdateRepoSecret({
      owner: orgaName,
      repo: repoName,
      secret_name: `${ghaSecretPrefix}__${ghaSecretSuffix}`,
      encrypted_value: encryptedValue,
      key_id: keyId,
    });
    /* eslint-enable camelcase */
  };

  await deployRepoActionsSecrets();
};
