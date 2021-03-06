const { readFile } = require("fs").promises;
const axios = require("axios");
const core = require("@actions/core");
const getAppConfig = require("../helpers/appConfig");

const checkProcessStatus = async (url) => {
  return new Promise((res) => {
    setTimeout(async () => {
      const processResult = await axios({
        method: "get",
        url,
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

      console.log(`Suitest process status: ${processResult.data.status}`);

      if(processResult.data.status === "done"){
        res();
      }else{
        checkProcessStatus(url);
      }
    }, 5000);
  });
};

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
        "x-suitest-instrument": os === "AndroidTV" ? "auto" : "manuel",
        "x-suitest-filename": fileName,
        "X-TokenId": process.env.SUITEST_TOKEN_ID,
        "X-TokenPassword": process.env.SUITEST_TOKEN_PASSWORD,
        Accept: "application/json",
        "Content-Type": "application/octet-stream",
      },
    });

    console.log("Upload Suitest package done");
    await checkProcessStatus(packageResult.data);
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = uploadArtifact;
