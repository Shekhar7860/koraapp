// import React from 'react';
// import {FlatList, TouchableHighlight, View} from 'react-native';
// import {connect} from 'react-redux';
// import {forwardMessage} from '../../../shared/redux/actions/message-preview.action';
// import {goBack} from '../../navigation/NavigationService';
// import {Header} from '../../navigation/TabStacks';
// import {ThreadsListViewItem} from '../ChatsThreadScreen/chats-thread';

// class _ForwardMessageScreen extends React.Component {
//   constructor(props) {
//     super();
//     this.state = {threads: []};
//   }

//   componentDidMount() {
//     this.populateThreads();
//   }
//   populateThreads() {
    
//   }

//   renderItem({item}) {
//     return (
//       <ThreadsListViewItem
//         onThreadClick={({item}) => {
//           console.log('CLICK', item.threadId);
//           this.props?.forwardMessage(
//             {threadId: item.threadId},
//             this.props.forwardMessageObject,
//           );
//           goBack();
//           //   navigateToChat({threadId: item.threadId});
//         }}
//         item={item}
//       />
//     );
//   }

//   render() {
//     const {threads} = this.state;
//     return (
//       <>
//         <Header {...this.props} title={'Forward To'} goBack={true} />
//         <FlatList
//           style={{paddingHorizontal: 10, backgroundColor: 'white'}}
//           bounces={false}
//           renderItem={this.renderItem}
//           data={threads}
//         />
//       </>
//     );
//   }
// }

// const mapStateToProps = (state) => {
//   let {preview} = state;
//   return {
//     forwardMessageObject: preview.forwardedMsgObject,
//   };
// };

// export const ForwardMessageScreen = connect(mapStateToProps, {forwardMessage})(
//   _ForwardMessageScreen,
// );
