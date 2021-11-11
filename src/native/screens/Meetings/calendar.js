import React from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import {CalendarList} from 'react-native-calendars';
import moment from 'moment';
import * as Constants from '../../components/KoraText';
import {getTimeline, normalize} from '../../utils/helpers';
import {LocaleConfig} from 'react-native-calendars';
let deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;

LocaleConfig.locales.calendar = {
  monthNames: getTimeline('', 'getFullMonth'),
  monthNamesShort: getTimeline('', 'getShortMonth'),
  dayNames: [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ],
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
};
LocaleConfig.defaultLocale = 'calendar';

class Calendar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: this.props.selectedDate,
      monthAndYear: this.props.monthAndYear,
      markedDates: this.props.markedDates,
    };
  }
  getSelectedDayEvents(date) {
    const todaysDate = new Date().getDate();
    const selectedDate = new Date(date).getDate();
    let selectedColor, selectedTextColor;
    selectedColor = selectedTextColor = '';
    if (todaysDate === selectedDate) {
      selectedColor = '#0D6EFD';
      selectedTextColor = '#ffffff';
    } else {
      selectedColor = '#E7F1FF';
      selectedTextColor = '#0D6EFD';
    }
    let markedDates = {};
    markedDates[date] = {
      selected: true,
      disableTouchEvent: true,
      selectedColor,
      selectedTextColor,
    };
    let serviceDate = new Date(date);
    //serviceDate = serviceDate.format('DD.MM.YYYY');
    this.props.dateSelected(serviceDate, markedDates);
    this.setState({
      selectedDate: serviceDate,
      markedDates: markedDates,
    });
  }
  render() {
    return (
      <CalendarList
        horizontal={true}
        pagingEnabled={true}
        style={styles.calendar}
        calendarWidth={deviceWidth}
        calendarHeight={300}
        showSixWeeks={true}
        hideExtraDays={false}
        //showWeekNumbers={true}
        markedDates={this.state.markedDates}
        //firstDay={1}
        disableAllTouchEventsForDisabledDays={true}
        current={this.state.selectedDate || new Date()}
        disabled
        theme={{
          textDayFontSize: normalize(13),
          textDisabledColor: '#9AA0A6',
          textDayFontWeight: '400',
          dayTextColor: '#202124',
          todayTextColor: '#ffffff',
          todayBackgroundColor: '#0D6EFD',
          'stylesheet.calendar.header': {
            header: {
              height: 0,
              opacity: 0,
            },
            dayHeader: {
              color: '#202124',
              fontSize: normalize(12),
              fontFamily: Constants.fontFamily,
              paddingRight: 5,
              paddingBottom: 5,
            },
          },
        }}
        onDayPress={(day) => {
          this.getSelectedDayEvents(day.dateString);
        }}
        onVisibleMonthsChange={(months) => {
          let date = new Date(months[0].dateString);
          let monthAndYear = getTimeline(date, 'fullMonthAndYear');
          this.props.onMonthChange(monthAndYear);
        }}
      />
    );
  }
}
export default Calendar;

const styles = StyleSheet.create({
  calendar: {
    width: deviceWidth,
    paddingTop: 10,
  },
});
