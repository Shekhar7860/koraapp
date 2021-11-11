import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {FlatList} from 'react-native';
import {format} from 'date-fns';
import moment from 'moment';
import PropTypes from 'prop-types';
import {normalize} from '../../../utils/helpers';
import {Icon} from '../../../components/Icon/Icon.js';
import * as Constants from '../../../components/KoraText';

import ParentView from './ParentView';
import {TemplateType} from './TemplateType';
import BotText from '../views/BotText';

import {BORDER} from './TemplateType';

const MAX_MEETINGS_COUNT = 3;

class MeetingsView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      meetings: [],
      isShowMore: false,
      meetingCount: 0,
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.meetingsPayload;
    this.template_type = this.props.template_type;

    let elements = this.props.meetingsPayload.elements.map((element) => {
      return {
        ...element,
        reqTextToDispForDetails: null,
        reqTextToDisp: null,
      };
    });
    const list = this.computeList(elements, payload);
    let count = list.length;
    let isShowMore = list && list.length > MAX_MEETINGS_COUNT;
    let sortedList = list.sort(
      (a, b) => new Date(a.duration.start) - new Date(b.duration.start),
    );
    let data = this.groupData(sortedList);
    this.setState({
      isShowMore: isShowMore,
      meetings: data,
      meetingCount: count,
      payload: payload,
    });
  }

  getSingleMeetingViewForFlatList = (item) => {
    return this.getSingleMeetingView(item.item, item.index);
  };

  dateToFromNowDaily = (myDate) => {
    var fromNow = moment(myDate).fromNow();

    return moment(myDate).calendar(null, {
      lastWeek: '[Last] dddd',
      lastDay: '[Yesterday]',
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      sameElse: function () {
        return new Date(myDate).toLocaleDateString();
      },
    });
  };

  getSingleMeetingView = (item, index) => {
    return item.isHeader ? (
      <View style={{flexDirection: 'column'}}>
        {index != 0 && <View style={styles.sub_container} />}
        <Text style={[styles.dateTextStyle, {padding: 10}]}>{item.date}</Text>
        <View style={styles.line} />
      </View>
    ) : (
      <TouchableOpacity
        disabled={this.isViewDisabled()}
        onPress={() => {
          if (this.props.onListItemClick) {
            if (this.template_type === TemplateType.CANCEL_CALENDAR_EVENTS) {
              let chosenDate = this.getChosenDate(item);
              item = {
                ...item,
                chosenDate: chosenDate,
              };
            }
            this.props.onListItemClick(this.template_type, item);
          }
        }}>
        <View>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.meeting_item_view}>
              {item.reqTextToDisp ? (
                <View>
                  <Text style={styles.displayTextStyle}>
                    {item.reqTextToDisp}
                  </Text>
                </View>
              ) : (
                <View>
                  <Text style={styles.startDateTextStyle}>
                    {format(new Date(item.duration.start), 'h:mm a')}
                  </Text>
                  <Text style={styles.endDateTextStyle}>
                    {format(new Date(item.duration.end), 'h:mm a')}
                  </Text>
                </View>
              )}
            </View>
            <View
              style={[
                styles.vertical_line,
                {backgroundColor: item.color},
              ]}></View>
            <View style={styles.meeting_title_view}>
              <Text style={[styles.titleTextStyle, styles.titleTextStyle1]}>
                {item.title}
              </Text>
              <View style={styles.meeting_desc}>
                <Text style={styles.attendeeTextStyle}>
                  {item.attendees[0].name
                    ? item.attendees[0].name
                    : item.attendees[0].email}{' '}
                  and {item.attendees.length - 1} others
                </Text>
              </View>
              {this.isShowLine(index) && <View style={styles.line1}></View>}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  isShowLine = (index) => {
    const allMeetings = this.state.meetings;
    if (!allMeetings || !index) {
      return false;
    }
    if (index === 1 && allMeetings > 2) {
      return true;
    }
    if (index === allMeetings.length) {
      return false;
    }
  };

  dateToFromNowTitle = (myDate) => {
    // var fromNow = moment(myDate).fromNow();

    return moment(myDate).calendar(null, {
      lastWeek: '[Last] dddd',
      lastDay: '[Yesterday]',
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      sameElse: function () {
        return format(new Date(myDate), 'dd/MM/yyyy'); //new Date(myDate).toLocaleDateString();
      },
    });
  };

  getChosenDate = (item) => {
    const startStr = this.dateToFromNowDaily(item.duration.start);
    const endStr = this.dateToFromNowDaily(item.duration.end);
    let dateTime = '';
    if (startStr === endStr) {
      dateTime =
        startStr +
        ', ' +
        format(item.duration.start, 'hh:mm a') +
        ' - ' +
        format(item.duration.end, 'hh:mm a');
    } else {
      dateTime =
        startStr +
        ', ' +
        format(item.duration.start, 'hh:mm a') +
        ' - ' +
        endStr +
        ', ' +
        format(item.duration.end, 'hh:mm a');
    }

    return item.title + ' : ' + dateTime;
  };

  renderMeetingsView = (list) => {
    return (
      <View style={styles.container}>
        <FlatList
          data={list}
          renderItem={this.getSingleMeetingViewForFlatList}
          keyExtractor={(item) => item.index + ''}
          //stickyHeaderIndices={this.state.stickyHeaderIndices}
        />
        {this.state.isShowMore && (
          <TouchableOpacity
            disabled={this.isViewDisabled()}
            onPress={() => {
              if (this.props.onViewMoreClick) {
                this.props.onViewMoreClick(
                  this.template_type,
                  this.state.payload,
                );
              }
            }}>
            <View style={styles.view_more}>
              <Text style={styles.viewMoreTextStyle}>View more</Text>
              <View style={styles.icon_view}>
                <Icon size={16} name="Right_Direction" color="black" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  getDDMMYYYY = (date) => {
    return new Date(Date.parse(format(new Date(date), 'yyyy/MM/dd')));
  };

  computeList = (data, payload) => {
    let result = [];
    let groups = [];
    let index = 0;
    let objMaxCount = 0;

    const cursorStart = format(new Date(payload.cursor.start), 'yyyy/MM/dd');
    const cursorEnd = format(new Date(payload.cursor.end), 'yyyy/MM/dd');

    const cursorStartDate = this.getDDMMYYYY(payload.cursor.start);
    const cursorEndDate = this.getDDMMYYYY(payload.cursor.end);

    for (let i = 0; i < data.length; i++) {
      let obj = data[i];

      let _start = obj.duration.start;
      let _end = obj.duration.end;

      const date = new Date(
        Date.parse(new Date(obj.duration.start).toDateString()),
      );

      const eventStartDate = this.getDDMMYYYY(obj.duration.start);
      const Difference_In_Time = obj.duration.end - obj.duration.start;

      const _days = Math.round(Difference_In_Time / (1000 * 3600 * 24));

      if (_days > 0) {
        let _ostart = obj.duration.start;
        let _oend = obj.duration.end;

        let st = 0;
        let ed = obj.duration.end;

        for (let i = 0; i <= _days; i++) {
          if (eventStartDate.getTime() < cursorStartDate.getTime()) {
            _start += 24 * 60 * 60 * 1000;
            _start = this.getDDMMYYYY(_start).getTime();
            eventStartDate = this.getDDMMYYYY(_start);
            continue;
          }

          if (this.getDDMMYYYY(st).getTime() === cursorEndDate.getTime()) break;

          let txt = '';

          if (i == 0) {
            if (obj.isAllDay) {
              txt = 'All Day\nDay (' + (i + 1) + '/' + (_days + 1) + ')';
              obj.reqTextToDispForDetails = this.getMorethanDayDate(
                _ostart,
                _oend,
              );
            } else {
              txt =
                'From\n' +
                format(obj.duration.start, 'hh:mm a') +
                '\nDay (' +
                (i + 1) +
                '/' +
                (_days + 1) +
                ')';
              obj.reqTextToDispForDetails = this.getMorethanDayDateTime(
                _ostart,
                _oend,
              );
            }
            obj.reqTextToDisp = txt;

            st += _start;
          } else if (i == _days) {
            if (obj.isAllDay) {
              txt = 'All Day\nDay (' + (i + 1) + '/' + (_days + 1) + ')';
              obj.reqTextToDispForDetails = this.getMorethanDayDate(
                _ostart,
                _oend,
              );
            } else {
              if (
                this.getDDMMYYYY(_start).getTime() ===
                  this.getDDMMYYYY(_end).getTime() &&
                this.getOneDayMiliseconds(_end - _start) >= 23.98
              ) {
                txt = 'All Day';
              } else {
                txt =
                  'Till\n' +
                  format(obj.duration.end, 'hh:mm a') +
                  '\nDay (' +
                  (i + 1) +
                  '/' +
                  (_days + 1) +
                  ')';
              }
              obj.reqTextToDispForDetails = this.getMorethanDayDateTime(
                _ostart,
                _oend,
              );
            }
            obj.reqTextToDisp = txt;

            st = _end;
            st = this.getDDMMYYYY(st).getTime();
            ed = _end;
          } else {
            txt = 'All Day\nDay (' + (i + 1) + '/' + (_days + 1) + ')';
            obj.reqTextToDisp = txt;
            if (obj.isAllDay) {
              obj.reqTextToDispForDetails = this.getMorethanDayDate(
                _ostart,
                _oend,
              );
            } else {
              obj.reqTextToDispForDetails = this.getMorethanDayDateTime(
                _ostart,
                _oend,
              );
            }

            if (st == 0) {
              st += _start;
            } else {
              st += 24 * 60 * 60 * 1000;
              st = this.getDDMMYYYY(st).getTime();
            }
          }

          obj.duration.start = st;
          obj.duration.end = ed;
          result[index++] = obj;
        }
      } else {
        result[index++] = obj;
      }
    }
    return result;
  };

  getMorethanDayDate = (startdate, enddate) => {
    return (
      format(startdate, 'EE, MMM dd') + ' - ' + format(enddate, 'EE, MMM dd')
    );
  };

  getMorethanDayDateTime = (startdate, enddate) => {
    return (
      format(startdate, 'EE, MMM dd, hh:mm a') +
      ' - ' +
      format(enddate, 'EE, MMM dd, hh:mm a')
    );
  };

  getOneDayMiliseconds = (diffvalue) => {
    let seconds = diffvalue / 1000;
    let hours = seconds / (60 * 60);
    return hours;
  };

  groupData = (data) => {
    let result = [];
    let groups = [];
    let index = 0;
    let objMaxCount = 0;

    for (let i = 0; i < data.length; i++) {
      let obj = data[i];

      const date = this.dateToFromNowDaily(obj.duration.start);
      if (!groups[date]) {
        groups[date] = [];

        let head = {
          index: index,
          date,
          isHeader: true,
        };
        if (objMaxCount < MAX_MEETINGS_COUNT) {
          result[index++] = head;
        }
      }
      obj = {
        index: index,
        ...obj,
        isHeader: false,
      };
      if (objMaxCount < MAX_MEETINGS_COUNT) {
        result[index++] = obj;
      }
      objMaxCount++;
      groups[date].push(obj);
      if (objMaxCount === MAX_MEETINGS_COUNT) {
        break;
      }
    }
    return result;
  };

  render() {
    return (
      <View>
        {this.state.payload && (
          <View>
            <BotText text={this.state?.payload?.text} />

            {this.renderMeetingsView(this.state.meetings)}
          </View>
        )}
      </View>
    );
  }
}

MeetingsView.defaultProps = {
  onClick: () => {},
};

MeetingsView.propTypes = {
  onClick: PropTypes.func,
};

const styles = StyleSheet.create({
  line1: {
    marginTop: 8,
    marginBottom: 18,
    backgroundColor: BORDER.COLOR,
    width: '100%',
    height: 1,
    opacity: 0.3,
    flexDirection: 'row',
  },
  meeting_desc: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 10,
  },
  meeting_title_view: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginEnd: 5,
  },
  vertical_line: {
    marginEnd: 5,
    marginStart: 5,
    opacity: 0.8,
    width: 3,
    height: 30,
    flexDirection: 'row',
  },
  meeting_item_view: {
    backgroundColor: 'white',
    width: '20%',
    flexDirection: 'column',
    alignItems: 'flex-end',
    paddingEnd: 5,
  },
  line: {
    marginBottom: 10,
    backgroundColor: BORDER.COLOR,
    height: BORDER.WIDTH,
    flexDirection: 'row',
  },
  sub_container: {
    marginTop: 5,
    backgroundColor: BORDER.COLOR,
    height: BORDER.WIDTH,
    flexDirection: 'row',
  },
  icon_view: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
    margin: 0,
  },
  view_more: {alignItems: 'center', flexDirection: 'row', padding: 10},
  container: {
    marginTop: 10,
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },

  dateTextStyle: {
    color: BORDER.TEXT_COLOR,
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  displayTextStyle: {
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: BORDER.TEXT_COLOR,
  },
  startTimeTextStyle: {
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: BORDER.TEXT_COLOR,
  },
  endTimeTextStyle: {
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: BORDER.TEXT_COLOR,
  },
  attendeeNameTextStyle: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: BORDER.TEXT_COLOR,
  },
  titleTextStyle: {
    fontWeight: '400',
    fontSize: normalize(17),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: BORDER.TEXT_COLOR,
  },
  titleTextStyle1: {margin: 0, padding: 0, backgroundColor: 'white'},
  viewMoreTextStyle: {
    flex: 1,
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: BORDER.TEXT_COLOR,
    alignSelf: 'flex-start',
  },
  headerTextStyle: {
    color: '#485260',
    fontWeight: '400',
    fontSize: normalize(19),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginStart: 15,
  },
  textToDisplay: {width: '100%'},
});

export default MeetingsView;
