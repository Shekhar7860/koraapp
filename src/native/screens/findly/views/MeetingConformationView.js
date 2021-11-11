import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Text} from '../../../components/KoraText';
import {FlatList} from 'react-native';
import {format} from 'date-fns';
import moment from 'moment';
import ParentView from './ParentView';
import BotText from '../views/BotText';

import {normalize} from '../../../utils/helpers';
import {BORDER} from './TemplateType';

class MeetingConformationView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      meetings: [],
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.meetingsPayload;
    this.template_type = this.props.template_type;

    let meetings = payload.elements;

    this.setState({
      meetings: meetings,
      payload: payload,
    });
  }

  dateToFromNowDaily = (date) => {
    if (!date) {
      return '';
    }
    return format(new Date(date), 'EEE, MMM d');
  };

  // dateToFromNowDaily = (myDate) => {
  //     // var fromNow = moment(myDate).fromNow();

  //     return moment(myDate).calendar(null, {
  //         lastWeek: '[Last] dddd',
  //         lastDay: '[Yesterday]',
  //         sameDay: '[Today]',
  //         nextDay: '[Tomorrow]',
  //         nextWeek: 'dddd',
  //         sameElse: function () {
  //             return format(new Date(myDate), 'EEE, MMM d');//new Date(myDate).toLocaleDateString();
  //         },
  //     });
  // };

  getDisplayDateTime = (startdate, enddate) => {
    const startStr = this.dateToFromNowDaily(startdate);
    const endStr = this.dateToFromNowDaily(enddate);
    if (startStr === endStr) {
      return (
        startStr +
        ', ' +
        format(startdate, 'hh:mm a') +
        ' to ' +
        format(enddate, 'hh:mm a')
      );
    } else {
      return (
        startStr +
        ', ' +
        format(startdate, 'hh:mm a') +
        ' to ' +
        endStr +
        ', ' +
        format(enddate, 'hh:mm a')
      );
    }
  };

  getSingleMeetingViewForFlatList = (item, index) => {
    return this.getSingleMeetingView(item.item, index);
  };

  getSingleMeetingView = (item, index) => {
    return (
      <View key={index} style={styles.sub1Container}>
        <Text style={styles.title}>{item.title}</Text>

        {this.renderTimeSlots(item.slots)}

        {item.where && !item.where.trim() == '' ? (
          <Text>{item.where}</Text>
        ) : (
          <View />
        )}

        <Text style={styles.attendees}>
          {item.attendees[0].firstName} {item.attendees[0].lastName}
        </Text>
      </View>
    );
  };

  renderTimeSlots = (slots) => {
    if (slots) {
      if (slots.length === 1) {
        const time = this.getDisplayDateTime(slots[0].start, slots[0].end);
        return <Text style={styles.time}>{time}</Text>;
      } else {
        return (
          <View style={{flexDirection: 'column'}}>
            <Text style={styles.subTitle}>Selected Slots</Text>

            <FlatList
              data={slots}
              renderItem={(item) => {
                let obj = item.item;
                const time = this.getDisplayDateTime(obj.start, obj.end);
                return <Text style={styles.time}>{time}</Text>;
              }}
              keyExtractor={(item) => item.index}
            />
          </View>
        );
      }
    }

    return <View />;
  };

  renderMeetingsView = (list) => {
    // console.log("list-----------=============------------->>> :", list);
    return (
      <View style={styles.subContainer}>
        <FlatList
          data={list}
          renderItem={this.getSingleMeetingViewForFlatList}
          keyExtractor={(item) => item.index}
        />
      </View>
    );
  };

  render() {
    return this.state.payload ? (
      <View style={styles.mainContainer}>
        <View style={{marginBottom: 10}}>
          <BotText text={this.state?.payload?.text} />
        </View>

        {this.renderMeetingsView(this.state.meetings)}
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    flexDirection: 'column',
  },

  subContainer: {padding: 0, backgroundColor: 'white'},
  sub1Container: {
    flexWrap: 'wrap',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: 10,
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },
  title: {
    marginBottom: 5,
    alignSelf: 'flex-start',
    color: BORDER.TEXT_COLOR,
    fontSize: normalize(17),
  },
  attendees: {
    alignSelf: 'flex-start',
    color: BORDER.TEXT_COLOR,
    fontSize: normalize(15),
  },
  time: {
    marginBottom: 5,
    marginLeft: 10,
    alignSelf: 'flex-start',
    color: BORDER.TEXT_COLOR,
    fontSize: normalize(15),
  },
  subTitle: {
    marginBottom: 5,
    marginLeft: 10,
    alignSelf: 'flex-start',
    color: BORDER.TEXT_COLOR,
    fontSize: normalize(14),
  },
});

export default MeetingConformationView;
