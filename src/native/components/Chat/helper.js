import * as UsersDao from '../../../dao/UsersDao';

export function getPrettifiedFileSize(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

export function getFileKilobyteSize(bytes) {
  return (bytes / 1024).toFixed(2) + ' kb';
}
export const getTimeline = (time, type) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const daysF = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const givenDate = new Date(time);
  const day = days[givenDate.getDay()];
  const dayF = daysF[givenDate.getDay()];
  let month = months[givenDate.getMonth()];
  const date = givenDate.getDate();

  const currentDate = new Date();
  const todayDay = days[currentDate.getDay()];
  const todayMonth = months[currentDate.getMonth()];
  const todayDate = currentDate.getDate();

  const yesterday = new Date((new Date()).valueOf() - 1000 * 60 * 60 * 24);
  const yesterdayDay = days[yesterday.getDay()];
  const yesterdayMonth = months[yesterday.getMonth()];
  const yesterdayDate = yesterday.getDate();

  const tomorrow = new Date((new Date()).valueOf() + 1000 * 60 * 60 * 24);
  const tomorrowDay = days[tomorrow.getDay()];
  const tomorrowMonth = months[tomorrow.getMonth()];
  const tomorrowDate = tomorrow.getDate();

  let dd = givenDate.getDate();
  let mm = givenDate.getMonth();
  mm = mm + 1;
  let yy = givenDate.getFullYear();
  dd = dd < 10 ? ('0' + dd) : dd;
  mm = mm < 10 ? ('0' + mm) : mm;

  if (type === 'time') {
      return getTime(time);
  } else if (type === 'thread') {
      if (day + month + date === todayDay + todayMonth + todayDate) {
          return getTime(time);
      } else if (day + month + date === yesterdayDay + yesterdayMonth + yesterdayDate) {
          return 'Yesterday';
      } else {
          var finalDate = months[givenDate.getMonth()] + ' ' + givenDate.getDate();
          return finalDate;
      }
  } else if (type === 'message') {
      if (day + month + date === todayDay + todayMonth + todayDate) {
          return 'Today';
      } else if (day + month + date === yesterdayDay + yesterdayMonth + yesterdayDate) {
          return 'Yesterday';
      } else {
          var finalDate = months[givenDate.getMonth()] + ' ' + givenDate.getDate() + ', ' + givenDate.getFullYear();
          return finalDate;
      }
  } else if (type === 'monthNameDateFullyear') {
      var finalDate = months[givenDate.getMonth()] + ' ' + givenDate.getDate() + ', ' + givenDate.getFullYear();
      return finalDate;
  } else if (type === 'M/DD/YYYY') {
      let finalData = mm + '/' + dd + '/' + givenDate.getFullYear();
      return finalData;
  }else if (type === 'DD/M/YYYY') {
      let finalData = dd + '/' + mm + '/' + givenDate.getFullYear();
      return finalData;
  }else if (type === 'YYYY-MM-DD') {
      let finalData = givenDate.getFullYear() + '-' + mm + '-' + dd ;
      return finalData;
  }  else if (type === 'numberDateTime') {
      let finalData = dd + '/' + mm + '/' + yy + ' ' + '-' + ' ' + getTime(time);
      return finalData;
  } else if (type === 'fulldate') {
      let creationDate = day + ', ' + month + ' ' + givenDate.getDate() + ', ' + givenDate.getFullYear() + ', ' + getTime(time);
      return creationDate;
  } else if (type === 'postViaEmail') {
      let creationDate = dayF + ', ' + givenDate.getDate() + ' ' + month + ' ' + givenDate.getFullYear() + ' ' + getTime(time);
      return creationDate;
  } else if (type === 'remiderTime') {
      let creationDate
      if (day + month + date === todayDay + todayMonth + todayDate) {
          creationDate = getTime(time) +  ', ' + 'Today';
      }
      else if (day + month + date === tomorrowDay + tomorrowMonth + tomorrowDate) {
          creationDate = getTime(time) + ', ' + 'Tomorrow';
      }
      else {
          creationDate = getTime(time) + ', ' + month + ' ' + givenDate.getDate() + ', ' + givenDate.getFullYear();
      }
      return creationDate;
  }
  else if (type === 'dateAndTime') {
      let finalData = days[givenDate.getDay()] + ', ' + months[mm - 1] + ' ' + dd + ' , ' + getTime(time);
      return finalData;
  } else if (type === 'post') {
      let finalData = months[mm - 1] + ' ' + dd + ', ' + getTime(time);
      if (day + month + date === todayDay + todayMonth + todayDate) {
          return getTime(time);
      } else {
          return finalData;
      }
  } else if (type === 'discList') {
      //let finalData =  months[mm - 1] + ' ' + dd;
      let finalData = dd + '/' + mm + '/' + yy.toString().substr(-2);
      if (day + month + date === todayDay + todayMonth + todayDate) {
          return getTime(time);
      } else if (day + month + date === yesterdayDay + yesterdayMonth + yesterdayDate) {
          return 'Yesterday';
      } else {
          return finalData;
      }
  }
}
function getTime(time) {
  givenDate = new Date(time);
  var hours = givenDate.getHours();
  var minutes = givenDate.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = (hours) ? hours : 12;
  const mMinutes = (minutes < 10) ? '0' + minutes : minutes;
  var strTime = (hours.toString().length == 1 ? '0' + hours : hours) + ':' + mMinutes + ' ' + ampm;
  return strTime;
}
export function msgTimelineObj(
  {eventInitiator, eventType, resources},
  currentUserId = UsersDao.getUserId(),
) {
  let actionReceiverArray = [];
  let actionTakerText = '';
  let middleText = '';
  let postText = '';
  resources.forEach(function (value) {
    if (currentUserId === value.userId) {
      actionReceiverArray.push('You');
    } else {
      actionReceiverArray.push(value.firstName + ' ' + value.lastName);
    }
  });
  if (eventInitiator.userId === currentUserId) {
    actionTakerText = 'You';
  } else {
    actionTakerText = eventInitiator.firstName + ' ' + eventInitiator.lastName;
  }
  if (eventType === 'thread_subject_change') {
    actionReceiverArray = [resources[0].threadSubject];
    middleText = ' changed the group name of this chat to ';
  }
  if (eventType === 'board_clear_history') {
    middleText = ' cleared the conversation';
    actionReceiverArray = [];
  }

  if (
    eventType === 'thread_add_member' ||
    eventType === 'board_add_member' ||
    eventType === 'ws_add_member'
  ) {
    middleText = ' added '; // + resources.length+ 'others';
    if (resources.length === 1) {
      postText = ' to this ';
      if (eventType === 'thread_add_member') {
        postText += 'chat';
      } else if (eventType === 'board_add_member') {
        postText += 'chat';
      } else if (eventType === 'ws_add_member') {
        postText += 'workspace';
      }
    }
  } else if (
    eventType === 'thread_remove_member' ||
    eventType === 'board_remove_member' ||
    eventType === 'ws_remove_member'
  ) {
    middleText = ' removed ';
    if (resources.length === 1) {
      postText = ' from this ';
      if (eventType === 'thread_remove_member') {
        postText += 'chat';
      } else if (eventType === 'board_remove_member') {
        postText += 'chat';
      } else if (eventType === 'ws_remove_member') {
        postText += 'workspace';
      }
    }
  } else if (
    eventType === 'board_name_change' ||
    eventType === 'board_subject_change'
  ) {
    actionReceiverArray = [resources[0].boardSubject || resources[0].topicName];
    middleText = ' updated the chat name to ';
  } else if (eventType === 'board_description_change') {
    actionReceiverArray = [''];
    middleText = ' updated the chat description';
  } else if (eventType === 'board_email_change') {
    actionReceiverArray = [resources[0]['emailId']];
    middleText = ' updated the room email to ';
  } else if (eventType === 'board_logo_change') {
    actionReceiverArray = [''];
    middleText = ' updated the room logo';
  } else if (eventType === 'board_email') {
    actionReceiverArray = [resources[0]['emailId']];
    middleText = ' enabled the room link';
  } else if (eventType === 'board_email_enabled') {
    actionReceiverArray = [''];
    middleText = ' enabled the room email';
  } else if (eventType === 'board_email_disabled') {
    actionReceiverArray = [''];
    middleText = ' disabled the room email';
  } else {
    // console.log('DEFINE EVENT', eventType);
  }

  let actionReceiverText = actionReceiverArray.join('');
  if (actionReceiverArray.length > 1) {
    actionReceiverText = `${actionReceiverArray.length} others to this chat`;
  }
  if (
    eventType === 'thread_member_left' ||
    eventType === 'thread_member_left' ||
    eventType === 'board_member_left' ||
    eventType === 'ws_member_left'
  ) {
    middleText = ' left this ';
    if (eventType === 'thread_member_left') {
      middleText += 'chat';
    } else if (eventType === 'board_member_left') {
      middleText += 'room';
    } else if (eventType === 'ws_member_left') {
      middleText += 'workspace';
    }
    actionReceiverText = '';
  } else {
    // console.log('DEFINE EVENT', eventType);
  }
  return {actionTakerText, actionReceiverText, middleText, postText};
}

// function ____msgMemberTimeline(
//   {resources, eventType, eventInitiator},
//   currentUserId = userAuth.getUserId(),
// ) {
//   let memberName = [],
//     name = '';
//   resources.forEach(function (value) {
//     memberName.push(value.firstName + ' ' + value.lastName);
//   });
//   if (eventInitiator.userId === currentUserId) {
//     name = 'You';
//   } else {
//     name = eventInitiator.firstName + ' ' + eventInitiator.lastName;
//   }
//   if (eventType === 'thread_add_member') {
//     if (resources.length > 1) {
//       return name + ' added ' + resources.length+ 'others';
//     }
//     return name +
//   } else if (eventType === 'thread_remove_member') {
//     if (resources.length > 1) {
//       return name + ' removed ' + resources.length;
//     }
//   } else if (eventType === 'thread_member_left') {
//     return name + ' left this conversation';
//   } else if (eventType === 'thread_subject_change') {
//     const newGroupName = resources[0].threadSubject;
//     return (
//       name + ' changed the group name of this conversation to ' + newGroupName
//     );
//   }
//   return eventType;
// }
