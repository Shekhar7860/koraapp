const URLS = {
  development: {
    appServer: 'https://workassist-qa.kore.ai/',
    presenceServer: 'https://workassist-qa.kore.ai/',
    botServer: 'https://qa.findly.ai/',
  },
  production: {
    appServer: 'https://workassist.kore.ai/',
    presenceServer: 'https://workassist.kore.ai/',
    botServer: 'https://koradev-bots.kora.ai/',
  },
  qa: {
    appServer: 'https://qa1-app.kora.ai/',
    presenceServer: 'https://qa1-app.kora.ai/',
    botServer: 'https://koradev-bots.kora.ai/',
  },
  pilot: {
    appServer: 'https://qa1-app.kora.ai/',
    presenceServer: 'https://qa1-app.kora.ai/',
    botServer: 'https://koradev-bots.kora.ai/',
  },
};
const API_URL = URLS[process.env.NODE_ENV || 'development'];
module.exports = API_URL;
