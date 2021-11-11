import {
  LOGIN,
  PWD_LOGIN,
  PWD_RESET,
  SSO_LOGIN,
} from '../constants/login.constants';

export function userLogin(emailId) {
  return {
    type: LOGIN,
    emailId,
  };
}

export function SSOLogin(payload) {
  return {
    type: SSO_LOGIN,
    payload,
  };
}

export function PasswordLogin(payload) {
  return {
    type: PWD_LOGIN,
    payload,
  };
}

export function ResetPassword(payload) {
  return {
    type: PWD_RESET,
    payload,
  };
}

// export function userLogin(emailId) {
//   return function (dispatch) {
//     invokeAPICall({
//       url: 'api/1.1/check_id_status?emailId=' + emailId,
//       method: API_CONST.GET,
//       onSuccess: (res) => {
//         dispatch({
//           type: LOGIN,
//           payload: res,
//         });
//       },
//       onFailure: (res) => {
//         console.log(res);
//       },
//     });
//   };
// }
// export function userLogin(emailId, offlineId) {
//   const url = 'api/1.1/check_id_status?emailId=' + emailId;
//   return function (dispatch, getState) {
//     const isOffline = getState().offline.isOffline;
//     if (isOffline) {
//       dispatch({
//         type: ADD_TO_OFFLINE_QUEUE,
//         payload: {
//           name: 'userLogin',
//           preference: TAKE_LAST,
//           data: emailId,
//         },
//       });
//     } else {
//       invokeAPICall({
//         url,
//         method: API_CONST.GET,
//         onSuccess: (res) => {
//           if (offlineId !== undefined) {
//             dispatch({
//               type: REMOVE_FROM_OFFLINE_QUEUE,
//               payload: offlineId,
//             });
//           }
//           dispatch({
//             type: LOGIN,
//             payload: res,
//           });
//         },
//         onFailure: (res) => {
//           console.log(res);
//         },
//       });
//     }
//   };
// }

// export function SSOLogin(payload) {
//   return function (dispatch) {
//     invokeAPICall({
//       url: '/api/1.1/sso/login',
//       method: API_CONST.POST,
//       data: payload,
//       onSuccess: (res) => {
//         dispatch({
//           type: SSO_LOGIN,
//           payload: res,
//         });
//       },
//       onFailure: (res) => {
//         console.log(res);
//       },
//     });
//   };
//}

// export function PasswordLogin(payload) {
//   return function (dispatch) {
//     invokeAPICall({
//       url: '/api/1.1/oAuth/token',
//       method: API_CONST.POST,
//       data: payload,
//       onSuccess: (res) => {
//         dispatch({
//           type: PWD_LOGIN,
//           payload: res,
//         });
//       },
//       onFailure: (res) => {
//         dispatch({
//           type: PWD_LOGIN,
//           payload: res,
//         });
//         console.log(res);
//       },
//     });
//   };
// }

// export function ResetPassword(payload) {
//   return function (dispatch) {
//     invokeAPICall({
//       url: '/api/1.1/passwordReset',
//       method: API_CONST.POST,
//       data: payload,
//       onSuccess: (res) => {
//         dispatch({
//           type: PWD_RESET,
//           payload: res,
//         });
//       },
//       onFailure: (res) => {
//         dispatch({
//           type: PWD_RESET,
//           payload: res,
//         });
//       },
//     });
//   };
// }
