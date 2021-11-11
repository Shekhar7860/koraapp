import React from 'react';
import {SafeAreaView, View, StyleSheet} from 'react-native';
import {connect} from 'react-redux';
import {editPost} from '../../../shared/redux/actions/discussions.action';
import {Loader} from '../ChatsThreadScreen/ChatLoadingComponent';
import MessageComposebar from '../../components/Composebar/MessageComposebar';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import {Header} from '../../navigation/TabStacks';
import {getBoardFromDb} from '../../../shared/redux/actions/message-thread.action';
import {store} from '../../../shared/redux/store';
import {postPayload} from '../../../helpers';
import {upsertNewPost} from '../../../dao/PostsDao';
import MessageUploadQueue from '../FileUploader/MessageUploadQueue';
import {goBack} from '../../navigation/NavigationService';
class _EditPostScreen extends React.Component {
  constructor(props) {
    super(props);
    this.post = this.props.route.params.post;
    this.composeBarRef = React.createRef();
    let payload = {
      boardId: this.post?.boardId,
    };
    store.dispatch(
      getBoardFromDb(payload, (type, board) => {
        if (type) {
          this.members = board.members?.filter(function (e) {
            return (e != null && e?.fN) || e?.lN;
          });
        }
      })
    );
  }

  componentDidMount() {
    this.setComposeBarText();
  }

  setComposeBarText() {
    console.log('this.post.components', this.post);
    const text = this.post.components
      ?.filter((obj) => obj.componentType === 'text')
      ?.map((obj) => obj.componentBody)
      ?.join(' ');
    this.composeBarRef.current?.setText(text);
  }

  renderHeader() {
    return <Header {...this.props} title={'Edit Post'} goBack={true} />;
  }

  sendButtonClicked = async (composebarObj) => {
    const {postId, boardId, clientId} = this.post;
   
    const componentId = this.post.components.find(
      (obj) => obj.componentType === 'text',
    ).componentId;

    postPayload(
      {data: composebarObj, boardId: boardId, isEdited: true},
      async (payload) => {
        const index = payload.components?.findIndex(({componentType}) => {
          return componentType === 'text';
        });

        payload.postId = postId;
        payload.clientId = clientId;
        payload.boardId = boardId;
        payload.components[index].componentId = componentId;
        payload.deliveredOn = this.post.deliveredOn;
        let nMessage = await upsertNewPost(payload);
        MessageUploadQueue.addPost(nMessage, this.post);
        goBack();
      },
    );
  };

  render() {
    return (
      <KoraKeyboardAvoidingView style={{flex: 1, backgroundColor: 'white'}}>
        {this.renderHeader()}
        <View style={{flex: 1, flexDirection: 'column-reverse'}}>
          {this.props.showLoader ? <Loader /> : null}
        </View>
        <SafeAreaView style={{backgroundColor: 'white'}}>
          <MessageComposebar
            ref={this.composeBarRef}
            // boardData={{...this.post, isPost: true}}
            isGroupChat={true}
            contactData={this.members}
            onSendButtonClick={this.sendButtonClicked}
            isShowCamera={true}
            containerStyle={styles.composerbar_container}
            buttons_container={styles.buttons_container}
            sendViewStyle={styles.sendViewStyle}
            send_button_container={styles.send_btn_container_style}
            buttons_sub_container={styles.buttons_sub_container}
            iconStyle={styles.iconStyle}
          />
        </SafeAreaView>
      </KoraKeyboardAvoidingView>
    );
  }
}

const mapStateToProps = (state) => {
  const {home} = state;
  return {
    showLoader: home.showLoader,
  };
};

export const EditPostScreen = connect(mapStateToProps, {editPost})(
  _EditPostScreen,
);
const styles = StyleSheet.create({
  composerbar_container: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingLeft: 15,
    paddingRight: 15,
    minHeight: 50,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderColor: '#E6E7E9',
  },
  send_btn_style: {
    padding: 7,
    marginStart: 12,
    width: 34,
    //marginVertical: -2.8,
    // paddingVertical: -2.8,
    justifyContent: 'center',
    alignItems: 'center',

    // marginTop: 0,
  },
  send_btn_container_style: {
    flexDirection: 'row',
    alignSelf: 'center',
    // justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    height: 50,
  },

  icon_Style: {marginStart: 10},
  buttons_container: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    // justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    height: 50,
  },
  buttons_sub_container: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    // justifyContent: 'space-between',
    alignItems: 'flex-end',
    backgroundColor: 'white',
    height: 50,
  },
  sendViewStyle: {
    // height: '100%',
    //  backgroundColor: 'white',
    justifyContent: 'center',
    // marginStart: 10,
    alignItems: 'center',
    borderRadius: 5,
    alignSelf: 'center',
    marginStart: 16,
    padding: 8,
    width: 35,
  },
});
