/*
 * This function accepts as parameters the deployment information retrieved from environment variables.
 * The environment variables are redefined by Netlify, while deploying the production version. The function returns
 * a formatted message (HTML) containing the retrieved deployment information.
 */
function retrieveDeploymentInformation(
  repositoryUrl,
  branchInfo,
  lastCommitHash,
) {
  const urlToRender = `https://${repositoryUrl
    .split(":")
    .join("/")}/-/tree/${branchInfo}`;
  const commitUrl = `https://${repositoryUrl
    .split(":")
    .join("/")}/-/commit/${lastCommitHash}`;
  const message = `Welcome to the Rule editor! This version is based on the <a class='anchorTags' href='${urlToRender}' target='_blank'>${branchInfo}</a> branch.
    <br/>Commit hash: <a class='anchorTags' href='${commitUrl}' target='_blank'>${lastCommitHash.substring(
      0,
      9,
    )}</a>.`;

  return message;
}

export { retrieveDeploymentInformation };
