const getAppConfig = (channel, os) => {
  if (!process.env.SUITEST_APP_CONFIG) {
    throw new Error("Suitest app config not found");
  }

  const config = JSON.parse(process.env.SUITEST_APP_CONFIG);
  const channelConfig = config.find((c) => c.channel === channel);
  if (!channelConfig) {
    throw new Error(`Suitest app config for channel:${channel} not found`);
  }

  const osConfig = channelConfig.config.find((c) => c.os === os);
  if (!osConfig) {
    throw new Error(
      `Suitest app config for channel:${channel} and os:${os} not found`
    );
  }

  const { appId, versionId, configId } = osConfig;
  return {
    appId,
    versionId,
    configId,
  };
};

module.exports = getAppConfig;
