if (process.env.NODE_ENV === "development") {
  require("dotenv").config();
}

const path = require("path");
const core = require("@actions/core");

// Action Handlers
const uploadArtifact = require("./src/action-handlers/upload-artifact");

const ACTION_HANDLERS = {
  "upload-artifact": uploadArtifact,
};

(async () => {
  try {
    const action =
      process.env.NODE_ENV === "development"
        ? process.env.ACTION
        : core.getInput("action");

    console.log("Current dir: ", path.dirname(__filename));
    console.log("Action", action);

    const actionHandler = ACTION_HANDLERS[action];
    if (!actionHandler) {
      const possibleActions = Object.keys(ACTION_HANDLERS).join(", ");
      throw new Error(
        `ActionHandler not found: ${action} possible actions: [${possibleActions}] `
      );
    }

    await actionHandler();
  } catch (error) {
    core.setFailed(error.message);
  }
})();
