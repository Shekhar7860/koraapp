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
class EventAlert extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      alertTitle: '',
    };
  }
  openModal(alertTitle) {
    this.setState({alertTitle});
    this.alert.openBottomDrawer();
  }

  closeModal() {
    this.alert.closeBottomDrawer();
  }

  alertModal() {
    return (
      <>
        <View style={styles.mainView}>
          <Text style={styles.textStyle}>{this.state.alertTitle}</Text>
        </View>
        <TouchableOpacity
          style={styles.clickEventStyle}
          onPress={() => {
            this.alert.closeBottomDrawer();
          }}>
          <Text style={styles.alertEvent}>Ok</Text>
        </TouchableOpacity>
      </>
    );
  }

  render() {
    const {event} = this.state;
    return (
      <BottomUpModalShare
        ref={(ref) => {
          this.alert = ref;
        }}
        height={150}>
        {this.alertModal()}
      </BottomUpModalShare>
    );
  }
}

const styles = StyleSheet.create({
  textStyle: {fontSize: normalize(16), textAlign: 'center', fontWeight: '400'},

  mainView: {
    margin: 25,
  },
  alertEvent: {
    fontWeight: '400',
    fontSize: normalize(16),
    color: '#ffffff',
  },
  clickEventStyle: {
    padding: 14,
    backgroundColor: '#0D6EFD',
    borderRadius: 4,
    marginHorizontal: 20,
    alignItems: 'center',
  },
});

export default EventAlert;
