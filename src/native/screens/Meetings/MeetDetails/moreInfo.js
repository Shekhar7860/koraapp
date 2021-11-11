import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {StyleSheet, View, Text, TouchableOpacity, Linking} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Toast from 'react-native-simple-toast';
import {Icon} from '../../../components/Icon/Icon.js';
import {getTimeline, normalize} from '../../../utils/helpers';
import * as UsersDao from '../../../../dao/UsersDao';
import {BottomUpModal} from '../../../components/BottomUpModal';
import {BottomUpModalShare} from '../../../components/BottomUpModal/BottomUpModalShare.js';

class MeetMoreInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: '',
      meetingInfo: true,
    };
  }
  openModal(event) {
    this.setState({event});
    this.details.openBottomDrawer();
  }

  moreModal(event) {
    const {meetJoin, conferenceData} = event;
    let phNumber, pin;
    if (conferenceData?.meetPoints) {
      phNumber =
        '(' +
        conferenceData?.meetPoints[2]?.regionCode +
        ')' +
        conferenceData?.meetPoints[2]?.label;
      pin = 'PIN: ' + conferenceData?.meetPoints[2]?.pin;
    }

    return (
      <>
        <View style={styles.moreInfoView}>
          <Text style={styles.moreInfoText}>More info</Text>
        </View>
        <Text style={styles.joiningInfo}>Joining Info</Text>
        <View style={styles.mainView}>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL(meetJoin?.meetingUrl);
            }}>
            <Text style={styles.meetingLink}>{meetJoin?.meetingUrl}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{padding: 15}}
            onPress={() => {
              Clipboard.setString(meetJoin?.meetingUrl);
              Toast.showWithGravity('Copied', Toast.SHORT, Toast.BOTTOM);
            }}>
            <Icon name="Copy" size={normalize(22)} color="#202124" />
          </TouchableOpacity>
        </View>

        <Text style={styles.phoneNumber}>Phone Number</Text>
        {conferenceData?.meetPoints ? (
          <View style={{marginHorizontal: 20}}>
            <Text style={styles.contact}>{phNumber}</Text>
            <Text style={styles.contact}>{pin}</Text>
          </View>
        ) : null}
      </>
    );
  }

  render() {
    const {event} = this.state;
    return (
      <BottomUpModalShare
        ref={(ref) => {
          this.details = ref;
        }}
        height={300}>
        {this.moreModal(event)}
      </BottomUpModalShare>
    );
  }
}

const styles = StyleSheet.create({
  moreInfoText: {fontWeight: '600', fontSize: normalize(16)},
  mainView: {
    flexDirection: 'row',
    marginLeft: 20,
    alignItems: 'center',
  },
  moreInfoView: {
    padding: 20,
    borderBottomColor: '#E4E5E7',
    borderBottomWidth: 1,
  },
  joiningInfo: {
    fontWeight: '400',
    fontSize: normalize(16),
    margin: 20,
    marginBottom: 8,
  },
  phoneNumber: {
    fontWeight: '400',
    fontSize: normalize(16),
    margin: 20,
    marginTop: 8,
  },
  contact: {
    fontWeight: '400',
    color: '#5F6368',
    fontSize: normalize(16),
    marginVertical: 5,
  },
  meetingLink: {color: '#0D6EFD', fontSize: normalize(16)},
});
export default MeetMoreInfo;
