import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableHighlight,
} from 'react-native';
import {withTranslation, useTranslation} from 'react-i18next';
import * as Constants from '../../../components/KoraText';
import {goBack} from '../../../navigation/NavigationService';
import {Header} from '../../../navigation/TabStacks';
import {updateDiscussion} from '../../../../shared/redux/actions/discussions.action';
import {connect} from 'react-redux';
import {getAllWSMembers} from '../../../../shared/redux/actions/workspace.action';
import {normalize} from '../../../utils/helpers';
import {TouchableOpacity} from 'react-native-gesture-handler';
const KEYS = {
  ROOM_NAME: 'name',
  DESCRIPTION: 'desc',
};
class DiscussionRoomEdit extends React.Component {
  constructor(props) {
    super(props);
    // const {key} = props.route.params;
    // const text = props.route.params[key];
    const {key} = props.route.params;
    const text = props.route.params[key];

    if (key === KEYS.ROOM_NAME) {
      this.placeholder = 'Room Name';
    } else if (key === KEYS.DESCRIPTION) {
      this.placeholder = 'Description';
    }
    this.state = {
      text: text,
    };
  }

  setText = (text) => {
    this.setState({text});
  }

  onDoneClick() {
    //let updatedName = this.state.text;
    const {key} = this.props.route.params;
    if (this.state.text === '') {
      return;
    } else {
      //console.log('THIS.STATE.TEXT', updatedName);
      // console.log('boardName', this.props.route.params.board);
      const board = this.props.route.params.board;
      let _params = {
        wsId: board.wsId,
        rId: board.id,
      };
      let payload = {};
      payload[key] = this.state.text;
      // {boardName: updatedName}
      // let payload={}
      //  this.props.updateDiscussion(_params,payload);
      this.props.updateDiscussion(_params, payload);

      // navigate(ROUTE_NAMES.ROOM_DETAILS, {
      //   updatedName,
      // });
      goBack();
      //this.props(updatedName);
    }
  }

  get originalText() {
    // return this.props.route.params?.board?.desc;
    const {key} = this.props.route.params;
    return this.props.route.params[key];
  }

  doneButton() {
    const {t} = this.props;
    const changeMade = this.originalText !== this.state.text;
    const showDoneButton = changeMade && this.state.text !== '';
    return (
      <TouchableOpacity
        onPress={() => this.onDoneClick()}
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 5,
          borderRadius: 5,
        }}>
        <Text
          style={{
            ...styles.doneTextStyle,
            color: showDoneButton ? '#0D6EFD' : 'grey',
          }}>
          {t('Done')}
        </Text>
      </TouchableOpacity>
    );
  }
  render() {
    const {t} = this.props;
    const {key} = this.props.route.params;
    console.log('key value', key);
    return (
      <View>
        <Header
          title="Room Info"
          goBack={true}
          // backIcon={<Icon name={'cross'} size={30} />}
          navigation={this.props.navigation}
          rightContent={this.doneButton()}
        />
        <View
          style={{
            marginTop: 5,

            paddingVertical: 18,
            paddingHorizontal: 20,
            backgroundColor: 'white',
            borderBottomWidth: 0.5,
            borderBottomColor: 'grey',
            flexDirection: 'row',
            justifyContent: 'space-between',
            flexShrink: 1,
            alignItems: 'center',
          }}>
          <TextInput
            multiline={true}
            style={styles.textInputStyle}
            placeholder={'Name'}
            value={this.state.text}
            onChangeText={this.setText}
          />
        </View>
      </View>
    );
  }
}

export default connect(null, {updateDiscussion, getAllWSMembers})(
  withTranslation()(DiscussionRoomEdit),
);

const styles = StyleSheet.create({
  doneTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  textInputStyle: {
    fontWeight: 'bold',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginRight: 10,
    lineHeight: 16,
    flexShrink: 1,
    width: '100%',
  },
});

// function* updateDiscussion(action) {
//   try {
//     const response = yield call(invokeAPICall, {
//       url: 'api/1.1/ka/ws/' + action._params.wsId + '/boards/' + action._params.rId,
//       method: API_CONST.PUT,
//       data: action.payload,
//     });
//     yield put({
//       type: Type.EDIT_DISCUSSION_SUCCESSFUL,
//       payload: { editDiscussionName: response.data, updataDiscData:action.updataDiscData }
//     })

//   } catch (e) {
//     yield put({
//       type: action.type,
//       error: e.message
//     })
//   }
// }
