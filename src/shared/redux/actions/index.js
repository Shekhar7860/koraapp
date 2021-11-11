import * as login from './login.action';
import * as language from './language.action';
import * as offline from './offline.action';
import * as home from './home.action';

export default {...login, ...home, ...language, ...offline};
