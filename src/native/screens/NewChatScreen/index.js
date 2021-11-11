// import React, {useRef, useState} from 'react';
// import {SafeAreaView, View} from 'react-native';
// import MessageComposebar from '../../components/Composebar/MessageComposebar';
// import MessagesListView from '../../components/Chat';
// import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
// import ContactsTag from './ContactsTag';
// import {MessagesHeaderView} from '../ChatScreen';
// import {connect} from 'react-redux';
// import uuid from 'react-native-uuid';

// import userAuth from '../../../shared/utils/userAuth';
// import {
//   saveThread,
// } from '../../../shared/redux/actions/message-preview.action';
// import {navigate} from '../../navigation/NavigationService';
// import {Header} from '../../navigation/TabStacks';
// import {TABLE_THREAD} from '../../realm/dbconstants';
// import { TouchableOpacity } from 'react-native-gesture-handler';

// class _NewChatScreen extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       threadId: '',
//       isNewChat: true,
//     };
//   }

//   componentDidUpdate(prevProps) {
//     const {navigation} = this.props;
//     if (
//       prevProps.thread !== this.props.thread &&
//       this.props.thread?.message &&
//       this.state.threadId === ''
//     ) {
//       navigation.setOptions({
//         headerTitle: <MessagesHeaderView thread={this.props.thread?.message}/>,
//       });
//       this.setState({threadId: this.props.thread?.message?.threadId});
//     }
//   }

//   sendAction(text) {
//     this.setState({isNewChat: false});
//     const toList = this.props.contactData;
//     let components = [
//       {
//         componentId: userAuth.generateId(6),
//         componentType: 'text',
//         componentBody: text ? text.trim() : '',
//       },
//     ];

//     let to = toList?.map((user) => user.id);
//     let threadId = this.props.threadId || uuid.v1();
//     const message = {
//       components,
//       messageId: 'local_message',
//       encrypted: false,
//       to: toList,
//       listRecepients: [],
//       topicName: '',
//       author: userAuth.getUser(),
//       from: userAuth.getUser(),
//       sendingState: 0,
//       clientId: uniqueId,
//       threadId: threadId,
//       sentOn: new Date(),
//     };

//     const threadPayload = {
//       threadId: threadId,
//       topicName: '',
//       lastMessage: message,
//       groupChat: to.length > 1 ? true : false,
//       clientId: uniqueId,
//       participants: [...to, userAuth.getUserId()],
//     };

//     insertItem(true, TABLE_THREAD, threadPayload);
//   }

//   render() {
//     return (
//       <>
//         {this.state.threadId !== '' ? (
//           <MessagesHeaderView thread={this.props.thread?.message} />
//         ) : (
//           <Header {...this.props} title={'New Conversation'} goBack={true}/>
//         )}
//         <KoraKeyboardAvoidingView
//           style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
//           {!this.state.isNewChat ? null : (
//             <ContactsTag visible={this.state.isNewChat} />
//           )}
//           {this.state.threadId === '' ? (
//             <View style={{display: 'flex', flex: 1}}></View>
//           ) : (
//             <MessagesListView
//               style={{padding: 10}}
//               boardId={this.props.thread?.message?.threadId}
//             />
//           )}
//           <SafeAreaView style={{flexShrink: 1}}>
//             <MessageComposebar
//               onSendButtonClick={(data) => {
//                 this.sendAction(data);
//               }}
//               textDidChange={(data) => {}}
//             />
//           </SafeAreaView>
//         </KoraKeyboardAvoidingView>
//       </>
//     );
//   }
// }

// const mapStateToProps = (state) => {
//   const {createMessage, preview, messageThreadList, login} = state;
//   return {
//     contactlistData: createMessage.contactlistData,
//     contactData: createMessage.contactData,
//     thread: preview.thread,
//     messageThreadList: messageThreadList,
//     grpName: createMessage.grpName,
//     currentUser: login.currentUser,
//     newChat: messageThreadList.newChat,
//   };
// };

// export const NewChatScreen = connect(mapStateToProps, {
//   saveThread,
// })(_NewChatScreen);
