import React from 'react';
import {connect} from 'react-redux';
import {View, TextInput, Text, StyleSheet} from 'react-native';
import {
  TouchableHighlight,
  TouchableOpacity,
} from 'react-native';
import {normalize} from '../../utils/helpers';
import {MuteUnmute} from '../../../shared/redux/actions/message-thread.action';
import {Icon} from '../../components/Icon/Icon';
import {KoraReactComponent} from '../../core/KoraReactComponent';
import {Header} from '../../navigation/TabStacks';
import * as Constants from '../../components/KoraText';

const KEYS = {
  GROUP_NAME: 'topicName',
  DESCRIPTION: 'description',
};

const properties = {
  topicName: {
    limit: 10,
    fontSize: normalize(20),
  },
  description: {
    limit: 30,
    fontSize: normalize(14),
  },
};

class GroupDetailsEdit extends KoraReactComponent {
  constructor(props) {
    super(props);
    const {threadId, key} = props.route.params;
    const text = props.route.params[key];
    if (key === KEYS.GROUP_NAME) {
      this.placeholder = 'Group Name';
    } else if (key === KEYS.DESCRIPTION) {
      this.placeholder = 'Description';
    }
    this.state = {
      text: text,
    };
  }

  get originalText() {
    const {threadId, key} = this.props.route.params;
    return this.props.route.params[key];
  }

  setText(text) {
    this.setState({text});
  }

  onDoneClick() {
    if (this.state.text === '') {
      return;
    }

    const {threadId, key} = this.props.route.params;
    let _params = {
      threadId: threadId,
    };
    let payload = {};
    payload[key] = this.state.text;
    this.props.MuteUnmute(_params, payload, {goBack: true});
  }

  doneButton() {
    const changeMade = this.originalText !== this.state.text;
    const showDoneButton = changeMade && this.state.text !== '';
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.05)"
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
          Done
        </Text>
      </TouchableHighlight>
    );
  }

  render() {
    const {threadId, key} = this.props.route.params;
    const _properties = properties[key];
    const {fontSize, limit} = _properties;
    return (
      <View>
        <Header
          title="Group Info"
          goBack={true}
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
          }}>
          <TextInput
            multiline={true}
            style={{...styles.textInputStyle, fontSize: fontSize}}
            placeholder={this.placeholder}
            value={this.state.text}
            onChangeText={(txt) => {
              this.setText(txt);
            }}
          />
          <View style={{paddingTop: 0, flexShrink: 1, marginTop:10}}>
            <TouchableOpacity onPress={() => this.setState({text: ''})}>
              <Icon name={'cross'} size={24} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  doneTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  textInputStyle: {
    fontWeight: 'normal',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginRight: 10,
    lineHeight: 20,
    flexShrink: 1,
    width: '100%',
  },
});

export default connect(null, {MuteUnmute})(GroupDetailsEdit);
