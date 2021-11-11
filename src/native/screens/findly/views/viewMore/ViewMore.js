import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import CardView from 'react-native-cardview';
import { FlatList } from 'react-native';
import { format } from 'date-fns';
import moment from 'moment';
import ParentView from '../ParentView';
import { TemplateType } from '../TemplateType';

import * as Constants from '../../../../components/KoraText';
import { normalize } from '../../../../utils/helpers';
class KoraViewMore extends ParentView {
  template_type = '';
  onListItemClick = null;
  callGoBack = null;
  state = {
    meetingList: [],
  };

  componentDidMount() {
    const { route } = this.props;
    const payload = route.params.listPayload;
    this.template_type = route.params.template_type;
    this.onListItemClick = route.params.onListItemClick;
    this.callGoBack = route.params.callGoBack;

    let elements = payload.elements.map((element) => {
      return {
        ...element,
        reqTextToDispForDetails: null,
        reqTextToDisp: null,
      };
    });
    const list = elements;
    let sortedList = list.sort(
      (a, b) => new Date(a.duration.start) - new Date(b.duration.start),
    );
    let data = this.groupData(sortedList);

    this.setState({
      meetingList: data,
    });
  }

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

      const eventStartDate = this.getDDMMYYYY(obj.duration.start); //new Date(Date.parse(format((new Date(obj.duration.start)), "dd/MM/yyyy")));

      // To calculate the time difference of two dates
      const Difference_In_Time = obj.duration.end - obj.duration.start;

      // To calculate the no. of days between two dates
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
            //  ed = _start + (30 * 60000);
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
        if (
          !obj.reqTextToDisp &&
          this.getDDMMYYYY(_start).getTime() === this.getDDMMYYYY(_end) &&
          this.getOneDayMiliseconds(_end - _start) >= 23.98
        ) {
          obj.reqTextToDisp = 'All Day';
          obj.reqTextToDispForDetails = this.getDayDate(_start);
        }

        result[index++] = obj;
      }
    }
    return result;
  };

  getDayDate = (startdate) => {
    return format(startdate, 'EE, MMM dd');
  };

  getMorethanDayDate = (startdate, enddate) => {
    //"EE, MMM dd"
    //format((new Date(date)), "yyyy/MM/dd")
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
    let tempIndex = 0;

    for (let i = 0; i < data.length; i++) {
      let obj = data[i];

      const date = this.dateToFromNowDaily(obj.duration.start); //(new Date(obj.duration.start)).toDateString();//this.dateToFromNowDaily(obj.duration.start);//(new Date(obj.duration.start)).toDateString();
      if (!groups[date]) {
        groups[date] = [];
        //  groups[date + "-head"] = [];
        tempIndex = tempIndex + 1;
        let head = {
          index: index,
          date,
          isHeader: true,
        };
        result[index++] = head;
        //groups[date].push(head);
        // index = tempIndex++;
      }
      tempIndex = tempIndex + 1;
      obj = {
        index: index,
        ...obj,
        isHeader: false,
      };
      result[index++] = obj;
      groups[date].push(obj);
    }
    return result;
  };

  getSingleMeetingViewForFlatList = (item) => {
    return this.getSingleMeetingView(item.item);
  };

  // call this function, passing-in your date
  dateToFromNowDaily = (myDate) => {
    // get from-now for this date
    var fromNow = moment(myDate).fromNow();

    // ensure the date is displayed with today and yesterday
    return moment(myDate).calendar(null, {
      // when the date is closer, specify custom values
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

  getSingleMeetingView = (item) => {
    return item.isHeader ? (
      <View style={{ width: 380, flexDirection: 'column' }}>
        <Text style={styles.dateTextStyle}>{item.date}</Text>
        <View
          style={styles.dateStyle}
        />
      </View>
    ) : (
      <TouchableOpacity
        onPress={() => {
          if (this.onListItemClick) {
            if (this.template_type === TemplateType.CANCEL_CALENDAR_EVENTS) {
              let chosenDate = this.getChosenDate(item);
              item = {
                ...item,
                chosenDate: chosenDate,
              };
            }

            this.onListItemClick(this.template_type, item);

            if (
              this.template_type &&
              this.template_type === TemplateType.CANCEL_CALENDAR_EVENTS
            ) {
              if (this.callGoBack) {
                this.callGoBack();
              }
            }
          }
        }}>
        <View>
          <View style={{ flexDirection: 'row' }}>
            <View
              style={{
                backgroundColor: 'white',
                width: 80,
                flexDirection: 'column',
                alignItems: 'flex-end',
                paddingEnd: 5,
              }}>
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
              style={{
                marginEnd: 5,
                marginStart: 5,
                backgroundColor: item.color,
                opacity: 0.8,
                width: 3,
                height: 30,
                flexDirection: 'row',
              }}></View>
            <View
              style={{
                flex: 1,
                backgroundColor: 'white',
                flexDirection: 'column',
              }}>
              <Text style={styles.titleTextStyle}>{item.title}</Text>
              <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                <Text style={styles.attendeeTextStyle}>
                  {item.attendees[0].name
                    ? item.attendees[0].name
                    : item.attendees[0].email}{' '}
                  and {item.attendees.length - 1} others
                </Text>
              </View>
              <View
                style={styles.attendeesStyle}></View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
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
      <View style={{ padding: 5, margin: 0 }}>
        <CardView
          cardElevation={0}
          cardMaxElevation={0}
          padding={10}
          cornerRadius={1}>
          <View style={{ backgroundColor: 'white' }}>
            <FlatList
              data={list}
              renderItem={this.getSingleMeetingViewForFlatList}
              keyExtractor={(item) => item.index + ''}
            //stickyHeaderIndices={this.state.stickyHeaderIndices}
            />
            {/* {list.map((item) => {
                            return this.getSingleMeetingView(item)
                        })} */}
          </View>
        </CardView>
      </View>
    );
  };

  render() {
    return (
      <View style={styles.viewMoreStyle}>
        {this.renderMeetingsView(this.state.meetingList)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  dateTextStyle: {
    color: '#485260',
    fontWeight: '400',
    fontSize: normalize(19),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  displayTextStyle: {
    fontWeight: '400',
    fontSize: normalize(15),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#485260',
  },
  startDateTextStyle: {
    fontWeight: '400',
    fontSize: normalize(15),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#485260',
  },
  endDateTextStyle: {
    fontWeight: '400',
    fontSize: normalize(15),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#485260',
  },
  titleTextStyle: {
    fontWeight: '400',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#485260',
  },
  attendeeTextStyle: {
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#485260',
  },
  viewMoreStyle:{width: '100%'},
  attendeesStyle:{
    marginTop: 8,
    marginBottom: 18,
    backgroundColor: '#485260',
    width: '100%',
    height: 1,
    opacity: 0.3,
    flexDirection: 'row',
  },
  dateStyle:{
    marginTop: 5,
    marginBottom: 10,
    backgroundColor: '#485260',
    width: '100%',
    height: 1,
    opacity: 0.3,
    flexDirection: 'row',
  },
});

export default KoraViewMore;
