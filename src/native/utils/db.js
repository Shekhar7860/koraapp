export function convertRealmArrayToPlainArray(realmObjectsArray) {
  return realmObjectsArray;
  //   let jsonArray = JSON.parse(JSON.stringify(copyOfJsonArray));
  //   return jsonArray;
}

// export const convertToObject = (realmObject, maxDepth = 3, depth = 0) => {
//   return JSON.parse(JSON.stringify(realmObject));
// };

function isString(object) {
  return typeof object === 'string';
}

function isArrayLike(object) {
  return Object(object).hasOwnProperty('length');
}
