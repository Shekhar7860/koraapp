import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {Icon} from '../../../components/Icon/Icon.js';
import {getTimeline, normalize} from '../../../utils/helpers';
import * as UsersDao from '../../../../dao/UsersDao';
import {BottomUpModal} from '../../../components/BottomUpModal';
import {SvgIcon} from '../../../components/Icon/SvgIcon.js';
import EventAlert from '../MeetDetails/eventAlert.js';

const alertModal = React.createRef();
const input = React.createRef();
const options = [
  {text: 'Google Meet', icon: 'GoogleMeet', width: 30, height: 30},
  {text: 'Zoom Meeting', icon: 'ZoomIcon', width: 24, height: 24},
];
class MeetLink extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: '',
      linkValue: '',
    };
  }

  openModal(meetingLink) {
    this.setState({linkValue: meetingLink});
    this.addLink.openBottomDrawer();
  }

  validURL(str) {
    var pattern = new RegExp(
      '^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$',
      'i',
    ); // fragment locator
    return !!pattern.test(str);
  }

  setLink() {
    const {linkValue, selected} = this.state;
    return (
      <View style={{marginBottom: 10}}>
        <View style={styles.mainView}>
          <Text style={styles.headerText}>Add a Meeting Link</Text>
        </View>
        <View style={{marginTop: 15, marginHorizontal: 20}}>
          <TextInput
            ref={input}
            onFocus={() => this.setState({selected: ''})}
            onChangeText={(linkValue) => this.setState({linkValue})}
            placeholder="Enter meeting Link"
            value={linkValue}
            style={styles.textInputStyle}
          />
        </View>
        <View style={styles.seperatorView}>
          <View style={styles.lineView} />
          <View>
            <Text style={styles.orText}>Or</Text>
          </View>
          <View style={styles.lineView} />
        </View>
        <View style={{marginBottom: 30}}>
          {options.map((item, index) => {
            return (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  input.current?.blur();
                  this.setState({selected: item.text, linkValue: ''});
                }}
                style={[
                  styles.optionView,
                  {backgroundColor: selected === item.text ? '#EFF0F1' : null},
                ]}>
                <View
                  style={
                    item?.icon === 'GoogleMeet'
                      ? {paddingHorizontal: 7}
                      : {paddingHorizontal: 10}
                  }>
                  <SvgIcon
                    name={item?.icon}
                    width={item?.width}
                    height={item?.height}
                  />
                </View>
                <Text
                  style={{
                    fontSize: normalize(16),
                    color: '#202124',
                    //paddingLeft: 14,
                  }}>
                  {item.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity
          style={styles.clickEventStyle}
          onPress={() => {
            if (linkValue) {
              this.addLink.closeBottomDrawer();
              if (this.validURL(linkValue)) {
                this.props.setLink(linkValue);
              } else {
                setTimeout(
                  () =>
                    alertModal.current.openModal(
                      'Please enter a valid meeting link',
                    ),
                  200,
                );

                //Alert.alert(null, 'Please enter a valid meeting link');
              }
            } else if (selected) {
              this.props.setLink(selected);
              this.addLink.closeBottomDrawer();
            }
          }}>
          <Text style={styles.applyEvent}>Apply</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <>
        <EventAlert ref={alertModal} />
        <BottomUpModal
          ref={(ref) => {
            this.addLink = ref;
          }}
          height={450}>
          {this.setLink()}
        </BottomUpModal>
      </>
    );
  }
}

const styles = StyleSheet.create({
  textStyle: {fontSize: normalize(22), textAlign: 'center'},
  headerText: {
    margin: 20,
    fontWeight: '600',
    fontSize: normalize(16),
    color: '#202124',
  },
  mainView: {
    borderBottomWidth: 1,
    borderColor: '#E4E5E7',
  },
  applyEvent: {
    fontWeight: '400',
    fontSize: normalize(16),
    color: '#ffffff',
  },
  clickEventStyle: {
    padding: 16,
    backgroundColor: '#0D6EFD',
    borderRadius: 4,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  textInputStyle: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#9AA0A6',
    fontSize: normalize(16),
    borderRadius: 4,
    padding: 10,
  },
  seperatorView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  orText: {
    width: 50,
    textAlign: 'center',
    color: '#5F6368',
    fontSize: normalize(16),
  },
  lineView: {width: 100, height: 1, backgroundColor: '#E4E5E7'},
  optionView: {
    marginVertical: 5,
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 5,
    flexDirection: 'row',
  },
});

export default MeetLink;
