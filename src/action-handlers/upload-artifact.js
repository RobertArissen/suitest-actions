const { readFile } = require('fs').promises
const axios = require("axios");
const core = require("@actions/core");
const getAppConfig = require("../helpers/appConfig");

const uploadArtifact = async () => {
  try {
    const channel =
      process.env.NODE_ENV !== "development"
        ? core.getInput("channel")
        : process.env.CHANNEL;

    const fileName =
      process.env.NODE_ENV !== "development"
        ? core.getInput("artifact_filename")
        : process.env.ARTIFACT_FILENAME;

    const folder =
      process.env.NODE_ENV !== "development"
        ? core.getInput("artifact_folder")
        : process.env.ARTIFACT_FOLDER;

    const os =
      process.env.NODE_ENV !== "development"
        ? core.getInput("os")
        : process.env.OS;

    const { appId, versionId, configId } = getAppConfig(channel, os);
    const fileContent = await readFile(`${folder}/${fileName}`);

    const packageResult = await axios({
      method: "put",
      url: `https://the.suite.st/api/public/v4/apps/${appId}/versions/${versionId}/configs/${configId}/package`,
      data: fileContent,
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        "x-suitest-instrument": os === "AndroidTV" ? 'auto' : 'manuel',
        "x-suitest-filename": fileName,
        "X-TokenId": process.env.SUITEST_TOKEN_ID,
        "X-TokenPassword": process.env.SUITEST_TOKEN_PASSWORD,
        Accept: "application/json",
        "Content-Type": "application/octet-stream",
      },
    });

    console.log('Upload package done')

    // Wait 5 sec
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const processResult = await axios({
      method: "get",
      url: packageResult.data,
      headers: {
        "X-TokenId": process.env.SUITEST_TOKEN_ID,
        "X-TokenPassword": process.env.SUITEST_TOKEN_PASSWORD,
      },
    });

    if (
      processResult.data.status !== "pending" &&
      processResult.data.status !== "done"
    ) {
      throw new Error(processResult.data.error.errorType);
    }

    console.log(`Uploading ${fileName} in process`)
  } catch (error) {
    throw new Error(error);
  }
};
 
module.exports = uploadArtifact;
