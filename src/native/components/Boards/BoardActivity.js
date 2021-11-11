// import React from 'react';
// import {View, StyleSheet} from 'react-native';
// import withObservables from '@nozbe/with-observables';

// import * as Constants from '../KoraText';
// import {normalize} from '../../utils/helpers';
// import MessageActivity from './MessageActivity';
// import PostActivity from './PostActivity';

// class BoardActivity extends React.Component {
//   constructor(props) {
//     super(props);
//   }

//   render() {
//     const {message, post, creator} = this.props;
//     if (message) {
//       return (
//         <View style={styles.draftMessageTextStyle}>
//           <MessageActivity message={message} creator={creator} />
//         </View>
//       );
//     } else if (post) {
//       return (
//         <View style={styles.draftMessageTextStyle}>
//           <PostActivity post={post} creator={creator} />
//         </View>
//       );
//     } else {
//       return <View style={styles.draftMessageTextStyle} />;
//     }
//   }
// }

// const enhance = withObservables(
//   ['lastActivity', 'creator'],
//   ({lastActivity, creator}) => ({
//     lastActivity: lastActivity.observe(),
//     creator: creator ? creator.observe() : null,
//     message: lastActivity.message ? lastActivity.message.observe() : null,
//     post: lastActivity.post ? lastActivity.post.observe() : null,
//   }),
// );

// export default enhance(BoardActivity);

// const styles = StyleSheet.create({
//   messageTextStyle: {
//     fontSize: normalize(14),
//     flexShrink: 1,
//     paddingRight: 50,
//     fontWeight: '400',
//     fontStyle: 'normal',
//     color: '#5F6368',
//     fontFamily: Constants.fontFamily,
//   },
//   draftMessageTextStyle: {
//     flexDirection: 'row',
//     maxWidth: '100%',
//     flexShrink: 1,
//   },
// });
