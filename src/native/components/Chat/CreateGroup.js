// import React from "react";
// import { LogBox, StyleSheet, SafeAreaView, View } from "react-native";
// import {
//   Header,
//   Right,
//   Button,
//   Icon,
//   Text,
//   Footer,
//   Row,
//   Item,
//   Input,
//   Container,
// } from "native-base";
// import {
//   forwardMessage
// } from '../../../shared/redux/actions/message-preview.action';
// import { connect } from 'react-redux';
// import { goBack } from '../../navigation/NavigationService';
// import ChatComponent from "./extras/ChatComponent/ChatComponent";
// import ChatFooter from "./extras/ChatComponent/ChatForwardFooter";
// import { ScrollView } from "react-native";
// import { store } from '../../../shared/redux/store.js';
// import BackButton from '../../components/BackButton';
// import {normalize} from '../../utils/helpers';
// import Toast from 'react-native-simple-toast';
// import {ChatLoading} from '../../screens/ChatsThreadScreen/ChatLoadingComponent';

// export const HeaderView = (props) => {
//     return (
//       <SafeAreaView
//         style={{
//           backgroundColor: 'white',
//         }}>
//         <View style={styles.messageHeaderOuterContainer}>
//           <View style={styles.messageHeaderContainer}>
//             {/* <VectorIcon
//             color="#292929"
//             name="md-chevron-back-sharp"
//             style={{ paddingRight: 6 }}
//             onPress={() => goBack()}
//             size={30}
//           /> */}
//             <BackButton
//               onPress={() => goBack()}
//               viewStyle={{ paddingRight: 6 }}
//               color="#292929"
//             />
//             {/* <TouchableOpacity
//               style={{ flexDirection: 'row', alignItems: 'center', flexShrink: 1 }}
//               onPress={() => {
//                 if (thread?.groupChat) {
//                   navigate('Group_Details', { thread });
//                 } else {
//                   navigate('Contact_Details', { thread });
//                 }
//               }}> */}
//               <Text
//                 numberOfLines={1}
//                 style={[styles.headerTopicName, { flexShrink: 1, paddingRight: 10 }]}>
//                 Create Group
//               </Text>
//             {/* </TouchableOpacity> */}
//           </View>
//           {/* <TouchableOpacity
//             style={{ flexDirection: 'row', alignItems: 'center' }}
//             onPress={() => { props.onPressOptions() }}>
//             {props.multiSelectMode ? <Text style={styles.text}>Cancel</Text>
//               : <Icon name={'options'} size={24} color="#202124" />}
//           </TouchableOpacity> */}
//           {/* <VectorIcon
//             color="#292929"
//             name="md-chevron-back-sharp"
//             style={{paddingRight: 6}}
//             onPress={() => goBack()}
//             size={30}
//           /> */}
//         </View>
//       </SafeAreaView>
//     );
//   };
  

// import { getContactList } from '../../../shared/redux/actions/create-message.action';
// class CreatGroupChat extends React.Component {

//   constructor(props) {
//     super(props);
//     console.log('create group props params', this.props.route.params);
//     this.state = {
//     //   threads: [],
//     //   selectedChats: [],
//       selectedContacts: [],
//       contactData: this.props.route.params.contacts,
//       cancelCalled: false,
//       loading: false,
//     };
//   }


//   onCancel = () => {
//     this.setState({ cancelCalled: !this.state.cancelCalled });
//   }

//   // onForward = () => {
//   //   // alert('Under development');
//   //   var selectedMessages = this.props.route.params.selectedMessages;
//   //   var forwardToJson = [];
//   //   var messagesJson = [];
//   //   var messagesFinalBind = [];
//   //   for (let i = 0; i < this.state.selectedChats.length; i++) {
//   //     var messages = {};
//   //     messages['boardId'] = this.state.selectedChats[i].id;
//   //     messages['boardType'] = this.state.selectedChats[i].type;
//   //     console.log(
//   //       'selected message in selectedMessage suk',
//   //       this.state.selectedChats[i],
//   //     );
//   //     forwardToJson.push(messages);
//   //   }

//   //   for (let i = 0; i < this.state.selectedContacts.length; i++) {
//   //     var messages = {};
//   //     messages['to'] = [this.state.selectedContacts[i]];
//   //     console.log(
//   //       'selected message in selectedMessage suk',
//   //       this.state.selectedChats[i],
//   //     );
//   //     forwardToJson.push(messages);
//   //   }

//   //   // if(this.state.selectedContacts.length > 0) {
//   //   //   var contactsTo = {};
//   //   //   contactsTo['to'] = this.state.selectedContacts;
//   //   //   forwardToJson.push(contactsTo);
//   //   // }
//   //   // messagesJson = this.props.selectedMessage
//   //   // .map((obj) => obj.messageId);
//   //   for (let i = 0; i < selectedMessages.length; i++) {
//   //     var messages = [];
//   //     let messageId = selectedMessages[i];
//   //     // messages['boardId'] = messageId.boardId;
//   //     console.log(
//   //       'selected message in selectedMessage suk',
//   //       this.state.selectedChats[i],
//   //     );
//   //     messagesJson.push(messageId.messageId);
//   //   }
//   //   // for (let i = 0; i < messagesJson.length; i++) {
//   //   //   for (let j = 0; j < forwardToJson.length; j++) {
//   //   //     var messageBind = {};
//   //   //     messageBind['messageId'] = messagesJson[i]['messageId'];
//   //   //     messageBind['threadId'] = forwardToJson[j]['threadId'];
//   //   //     messagesFinalBind.push(messageBind);
//   //   //   }
//   //   // }

//   //   let payload = {
//   //     forwardTo: forwardToJson,
//   //     messages: messagesJson,
//   //     boardId: selectedMessages[0].boardId,
//   //     boardType: this.props.route.params.boardType,
//   //     };
//   //   console.log('selected message in messagesJson suk', {
//   //     selectedMessages
//   //   });
//   //   this.setState({loading: true});
//   //   this.props.forwardMessage(payload, (type) => this.onSuccess(type));
//   // };

//   onForward = () => {

//     // alert('Under development');
//     var selectedMessages = this.props.route.params.selectedMessage;
//     console.log('this.props.selectedMessage', selectedMessages);
//     var forwardToJson = [];
//     var messagesJson = [];
//     var messagesFinalBind = [];
//     // for (let i = 0; i < this.state.selectedChats.length; i++) {
//     //   var messages = {};
//     //   messages['threadId'] = this.state.selectedChats[i];
//     //   console.log('selected message in selectedMessage suk', this.state.selectedChats[i]);
//     //   forwardToJson.push(messages);
//     // }
//     if(this.state.selectedContacts.length > 0) {
//       var contactsTo = {};
//       contactsTo['to'] = this.state.selectedContacts;
//       forwardToJson.push(contactsTo);
//     }
//     // messagesJson = this.props.selectedMessage
//     // .map((obj) => obj.messageId);
//     for (let i = 0; i < selectedMessages.length; i++) {
//       var messages = {};
//       let messageId = selectedMessages[i];
//       let messageIdValue = messageId.messageId;
//       messagesJson.push(messageIdValue);
//     }
//     for (let i = 0; i < messagesJson.length; i++) {
//       for (let j = 0; j < forwardToJson.length; j++) {
//         var messageBind = {};
//         messageBind['messageId'] = messagesJson[i]['messageId'];
//         messageBind['threadId'] = forwardToJson[j]['threadId'];
//         messagesFinalBind.push(messageBind);
//       }
//     }

//     let payload = {
//       forwardTo: forwardToJson,
//       messages: messagesJson,
//       boardId: selectedMessages[0].boardId,
//       boardType: this.props.route.params.boardType,
//     };
//     console.log('selected message in messagesJson suk', {
//       forwardTo: forwardToJson,
//       messages: messagesJson,
//     });
//     this.setState({ loading: true });
//     this.props.forwardMessage(payload, () => this.onSuccess());
//     // goBack();
//   };

//   onSuccess() {
//     this.setState({ loading: false });
//     Toast.showWithGravity(
//       'Forwarded successfully',
//       Toast.SHORT,
//       Toast.CENTER,
//     );
//       goBack();
//    }

//   componentDidUpdate(prevProps) {
//     // if (prevProps !== this.props) {
//     // console.log('props of forward', prevProps);
//     // }
//   }

//   checkBoxSelected = (selectedItems) => {
//     console.log('checkbox selection items', selectedItems);
//     if(selectedItems.length == 0) {
//         this.setState({
//             selectedContacts: [],
//             cancelCalled: false,
//           });
//           return;
//     }
//     const selectedContacts = selectedItems.selectedContacts;
//     if (selectedContacts.length == 0) {
//       this.setState({
//         selectedContacts: selectedContacts,
//         cancelCalled: false,
//       });
//     } else {
//       this.setState({
//         selectedContacts: selectedContacts,
//       });
//     }

//   }

//   componentDidMount = () => {
//     var recentObj = store
//       .getState()
//       .messageThreadList?.thread?.threads;
//     console.log('recent list forward', recentObj);
//     //To remove warning and error notifications while app is running on the simulator or the device
//     // LogBox.ignoreLogs(["Warning: Each", "Warning: Failed"]);
//     // LogBox.ignoreAllLogs(true);
//     this.props.getContactList('');
//     this.populateThreads();
//   };

//   populateThreads() {
    
//   }

  
//   render() {
//     console.log('contact data fetched', this.props);
//     var threadsEdit = [];
//     // if (this.state.threads.length > 0) {
//     //   threadsEdit = [...this.state.threads];
//     //   // console.log('threads in threadedit', threadsEdit);
//     //   threadsEdit.map(client => ({ ...client, isChecked: true }));
//     // }
//     {this.state.loading ?
//       // <View
//       //   style={{ flex: 1 }}
//       // >
//       //Add other content here

//       <View style={{
//         position: 'absolute',
//         left: 0,
//         right: 0,
//         top: 0,
//         bottom: 0,
//         // opacity: 0.5,
//         zIndex: 5,
//         backgroundColor: 'clear',
//         justifyContent: 'center',
//         alignItems: 'center'
//       }}>
//         <ChatLoading></ChatLoading>
//       </View> : null
//     }

//     return (
//       <>
//         <Container>

//           <HeaderView/>  
//             {/* <Item style={{ backgroundColor: "#fff" }}>
//               <Icon name="ios-search" onPress={() => this.handleSubmit()} />
//               <Input
//                 placeholder="Search"
//                 onChangeText={(e) => this.handleSearch(e)}
//               />
//             </Item>
//             <Button transparent onPress={() => alert("Cancel pressed")}>
//               <Text>Cancel</Text>
//             </Button> */}
         
         
//           <ScrollView style={{ paddingStart: 5, paddingEnd: 5 }}>
            
//               <ChatComponent
//                 threads={[]}
//                 checkBoxSelected={(selectedChats) =>
//                   this.checkBoxSelected(selectedChats)
//                 }
//                 contactData={this.state.contactData}
//                 onCancelPressed={this.state.cancelCalled}
//                 selectedMessage={this.props.route.params.selectedMessages}
//               />
           
//           </ScrollView>
//           {(this.state.selectedContacts.length > 0) && (
//             <ChatFooter
//               style={{ marginLeft: 5, marginRight: 5, marginBottom: 0 }}
//               forwardList={() => this.onForward()}
//               onCancle={() => this.onCancel()}
//             />
//           )}
//         </Container>
//       </>
//     );
//   }
// }
// const mapStateToProps = (state) => {
//   const { createMessage } = state;

//   return {
//     contactData: createMessage.contactlistData,
//   };
// };
// export default connect(mapStateToProps, {
//   getContactList,
//   forwardMessage,
// })(CreatGroupChat);
// const styles = StyleSheet.create({
//     headerTopicName: {
//       fontSize: normalize(18),
//       fontWeight: 'bold',
//       marginLeft: 10,
//     },
//     text: {
//       color: '#0D6EFD',
//       fontSize: normalize(16),
//       fontWeight: '500',
//     },
//     messageHeaderContainer: {
//       padding: 18,
//       paddingVertical: 6,
//       flexDirection: 'row',
//       alignItems: 'center',
//       shadowColor: 'grey',
//       borderBottomWidth: 0.5,
//       borderBottomColor: 'grey',
//       height: 54,
//       width: '85%',
//       justifyContent: 'flex-start',
//     },
//     messageHeaderOuterContainer: {
//       marginRight: 10,
//       flexDirection: 'row',
//       alignItems: 'center',
//       shadowColor: 'grey',
//       borderBottomWidth: 0.5,
//       borderBottomColor: 'grey',
//       justifyContent: 'space-between',
//       height: 54,
//     },
//     headerContactName: { fontSize: 18, fontWeight: 'bold', marginLeft: 10 },
//   });