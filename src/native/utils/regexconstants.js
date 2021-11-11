export const REGEX = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;
export const url_regex = new RegExp(REGEX);
export const spaceCheck = /[^@A-Za-z_]/g;
export const mentions_pattern = new RegExp(`\\B@[a-z0-9_-]+|\\B@`, `gi`);
export const getHostName = (url) => {
    var match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i);
    if (
      match != null &&
      match.length > 2 &&
      typeof match[2] === 'string' &&
      match[2].length > 0
    ) {
      return match[1] ? match[1] + match[2] : match[2];
    } else {
      return null;
    }
  };