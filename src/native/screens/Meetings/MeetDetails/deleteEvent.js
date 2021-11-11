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
import {deleteEvent} from '../../../../shared/redux/actions/meetings.action';
import {BottomUpModalShare} from '../../../components/BottomUpModal/BottomUpModalShare.js';
class EventDelete extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      event: '',
      deleteEvent: true,
    };
  }
  openModal(event) {
    this.setState({event});
    this.delete.openBottomDrawer();
  }

  closeModal() {
    this.delete.closeBottomDrawer();
  }

  deleteModal() {
    return (
      <>
        <View style={styles.mainView}>
          <Text style={styles.textStyle}>
            Are you sure? Do you really want to delete the event?
          </Text>
        </View>
        <TouchableOpacity
          style={styles.clickEventStyle}
          onPress={() => {
            this.props.deleteEvent();
            this.delete.closeBottomDrawer();
          }}>
          <Text style={styles.deleteEvent}>Yes, Delete</Text>
        </TouchableOpacity>
      </>
    );
  }

  render() {
    const {event} = this.state;
    return (
      <BottomUpModalShare
        ref={(ref) => {
          this.delete = ref;
        }}
        height={200}>
        {this.deleteModal()}
      </BottomUpModalShare>
    );
  }
}

const styles = StyleSheet.create({
  textStyle: {fontSize: normalize(16), textAlign: 'center', fontWeight: '400'},

  mainView: {
    margin: 30,
  },
  deleteEvent: {
    fontWeight: '400',
    fontSize: normalize(16),
    color: '#ffffff',
  },
  clickEventStyle: {
    padding: 16,
    backgroundColor: '#DD3646',
    borderRadius: 4,
    marginHorizontal: 20,
    alignItems: 'center',
  },
});

export default EventDelete;
