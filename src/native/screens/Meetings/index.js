import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TouchableHighlight,
  TextInput,
} from 'react-native';
import {Icon} from '../../components/Icon/Icon.js';
import {getTimeline, normalize} from '../../utils/helpers';
import ContentView from './mainContent';
import moment from 'moment';
import * as Constants from '../../components/KoraText';
import Calendar from './calendar';
class MeetingScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: false,
      searchMode: false,
      showCalendar: false,
      monthAndYear: '',
      searchText: '',
      selectedDate: '',
      markedDates: {},
      dayView: true,
    };
  }

  componentDidMount() {
    let monthAndYear = getTimeline(new Date(), 'fullMonthAndYear');
    this.setState({monthAndYear});
  }

  renderCalendar() {
    return (
      <View style={[styles.viewShadow, {zIndex: 5}]}>
        <Calendar
          selectedDate={this.state.selectedDate}
          monthAndYear={this.state.monthAndYear}
          markedDates={this.state.markedDates}
          dateSelected={(serviceDate, markedDates) => {
            this.setState({
              selectedDate: serviceDate,
              markedDates,
              selected: true,
              showCalendar: false,
            });
          }}
          onMonthChange={(monthAndYear) => {
            this.setState({monthAndYear});
          }}
        />
      </View>
    );
  }

  renderSearchHeader() {
    return (
      <View style={styles.searchViewStyle}>
        <TouchableOpacity
          style={styles.paddingStyle}
          onPress={() => this.setState({searchMode: false})}>
          <Icon name={'Left_Direction'} size={normalize(22)} color="black" />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <TextInput
            ref={(input) => {
              this.textInput = input;
            }}
            placeholder="Search"
            placeholderTextColor="#5F6368"
            maxLength={20}
            onChangeText={(searchText) => this.setState({searchText})}
            style={styles.textInputStyle}
          />
          <TouchableOpacity
            style={styles.crossIconStyle}
            onPress={() => this.textInput.clear()}>
            <Icon name={'cross'} size={normalize(15)} color="black" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity underlayColor="rgba(0,0,0,0.05)">
          <Text style={styles.filterTextStyle}>Filters</Text>
        </TouchableOpacity>
      </View>
    );
  }

  todayTapped() {
    this.setState({
      markedDates: new Date(),
      selectedDate: new Date(),
      selected: true,
    });
    let monthAndYear = getTimeline(new Date(), 'fullMonthAndYear');
    this.setState({monthAndYear});
  }

  headerView() {
    const {navigation} = this.props;
    return (
      <View style={{}}>
        <View style={styles.headerStyle}>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => {
              navigation.openDrawer();
              this.checkCalendarVisibility();
            }}
            style={styles.paddingStyle}>
            <Icon name={'Menu'} size={normalize(22)} color="black" />
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => {
              this.setState({showCalendar: !this.state.showCalendar});
            }}
            style={styles.paddingStyle}>
            <View style={styles.monthStyle}>
              <Text style={styles.monthTextStyle}>
                {this.state.monthAndYear}
              </Text>
              {this.state.showCalendar ? (
                <Icon name={'UpArrow'} size={normalize(22)} color="black" />
              ) : (
                <Icon name={'DownArrow'} size={normalize(22)} color="black" />
              )}
            </View>
          </TouchableHighlight>
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'flex-end',
            }}>
            {/* <TouchableOpacity
              underlayColor="rgba(0,0,0,0.05)"
              style={styles.paddingStyle}
              onPress={() => {
                this.setState({searchMode: true});
              }}>
              <Icon
                name={'Contact_Search'}
                size={normalize(22)}
                color="black"
              />
            </TouchableOpacity> */}
            <TouchableOpacity
              underlayColor="rgba(0,0,0,0.05)"
              style={{padding: 5}}
              onPress={() => {
                this.setState({dayView: !this.state.dayView});
                this.checkCalendarVisibility();
              }}>
              {this.state.dayView ? (
                <Icon name={'List_View'} size={normalize(22)} color="black" />
              ) : (
                <Icon name={'Day_View'} size={normalize(22)} color="black" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  checkCalendarVisibility() {
    let {showCalendar} = this.state;
    if (showCalendar === true) {
      this.setState({showCalendar: !showCalendar});
    }
  }

  render() {
    //console.log('Type', this.props.route?.params?.contentType);
    return (
      <SafeAreaView style={styles.container}>
        {this.state.searchMode ? this.renderSearchHeader() : this.headerView()}
        {/* <Placeholder name="home" /> */}
        <View style={[styles.height, {overflow: 'hidden'}]}>
          {this.state.showCalendar && this.renderCalendar()}
          <View style={[styles.height, {position: 'absolute'}]}>
            <ContentView
              selected={this.state.selected}
              selectedDate={this.state.selectedDate || new Date()}
              type={this.state.dayView}
              todayTapped={() => this.todayTapped()}
              showCalendar={this.state.showCalendar}
              dismissCalendar={() => this.checkCalendarVisibility()}
              contentType={this.props.route?.params?.contentType}
              //allEvents={this.props.route?.params?.event || []}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

export default connect(null, {})(withTranslation()(MeetingScreen));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  height: {
    height: '100%',
  },
  filterTextStyle: {
    fontWeight: '600',
    fontSize: normalize(14),
    color: '#0D6EFD',
  },
  crossIconStyle: {
    justifyContent: 'flex-end',
    padding: 5,
  },
  textInputStyle: {
    flex: 1,
    marginLeft: 5,
    fontSize: normalize(14),
    color: '#202124',
  },
  searchViewStyle: {
    flexDirection: 'row',
    margin: 10,
    alignContent: 'center',
    alignItems: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#0D6EFD',
    flex: 1,
    marginRight: 15,
    borderRadius: 4,
    padding: 5,
  },
  viewShadow: {
    shadowColor: '#000',
    shadowOffset: {width: 1, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 3,
    //elevation: 5,
    flexDirection: 'row',
  },
  headerStyle: {
    flexDirection: 'row',
    margin: 10,
    alignContent: 'center',
    alignItems: 'center',
  },
  paddingStyle: {
    padding: 6,
  },
  monthStyle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthTextStyle: {
    fontWeight: '500',
    fontSize: normalize(18),
    color: '#202124',
    marginLeft: 0,
    marginRight: 12,
  },
});
