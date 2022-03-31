/* eslint valid-jsdoc: "off" */

'use strict'

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {})

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1648557643089_2010'

  // add your middleware config here
  config.middleware = ['errorHandler']

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }

  config.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/youtube',
      options: {},
      // mongoose global plugins, expected a function or an array of function and options
      plugins: []
    }
  }
  config.security = {
    csrf: {
      enable: false
    }
  }

  config.jwt = {
    secret: 'f4d8c0c5-1c22-4191-904d-2278edfce5bb',
    expiresIn: '1d'
  }

  config.cors = {
    origin: '*'
  }

  return {
    ...config,
    ...userConfig
  }
}
