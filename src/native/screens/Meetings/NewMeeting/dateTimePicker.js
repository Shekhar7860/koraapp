import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {StyleSheet, View, Text, TouchableOpacity, Linking} from 'react-native';
import {getTimeline, normalize} from '../../../utils/helpers';
import * as UsersDao from '../../../../dao/UsersDao';
import {BottomUpModal} from '../../../components/BottomUpModal';
import DatePicker from 'react-native-date-picker';
import {BottomUpModalShare} from '../../../components/BottomUpModal/BottomUpModalShare';

class DateTimePicker extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      type: '',
      date: new Date(),
      index: -1,
    };
  }
  openModal(type, date, index = -1) {
    this.setState({type, date, index});
    this.setTime.openBottomDrawer();
  }

  setMeetTime() {
    const {type, date, index} = this.state;
    return (
      <>
        <View style={styles.mainView}>
          <Text
            style={{
              margin: 20,
              fontWeight: '600',
              fontSize: normalize(16),
              color: '#202124',
            }}>
            {this.state.index === -1
              ? 'Set Meeting Time'
              : 'Select Date & Time'}
          </Text>
        </View>
        <View style={{alignItems: 'center', marginBottom: 20}}>
          <DatePicker
            date={date}
            mode={this.props?.isAllDay ? 'date' : 'datetime'}
            minimumDate={this.props?.setMinimumDate ? new Date() : null}
            androidVariant="nativeAndroid"
            onDateChange={(date) => this.setState({date})}
            minuteInterval={15}
          />
        </View>
        <TouchableOpacity
          style={styles.clickEventStyle}
          onPress={() => {
            this.props.setDateTime(type, date, index);
            this.setTime.closeBottomDrawer();
          }}>
          <Text style={styles.applyEvent}>Apply</Text>
        </TouchableOpacity>
      </>
    );
  }

  render() {
    return (
      <BottomUpModalShare
        ref={(ref) => {
          this.setTime = ref;
        }}
        height={390}>
        {this.setMeetTime()}
      </BottomUpModalShare>
    );
  }
}

const styles = StyleSheet.create({
  textStyle: {fontSize: normalize(22), textAlign: 'center'},

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
});

export default DateTimePicker;
