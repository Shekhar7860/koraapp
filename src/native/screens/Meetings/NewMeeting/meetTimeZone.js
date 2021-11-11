import React from 'react';
import {withTranslation} from 'react-i18next';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
} from 'react-native';
import {getTimeline, normalize} from '../../../utils/helpers';
import {BottomUpModal} from '../../../components/BottomUpModal';
import {timeZones} from '../../../utils/timeZone.json';
import {BottomUpModalShare} from '../../../components/BottomUpModal/BottomUpModalShare';

class MeetTimeZone extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: '',
      timeZoneSearch: '',
      timeZones: {},
    };
  }
  openModal(isSelected) {
    this.setState({isSelected, timeZones: timeZones});
    this.timeZoneModal.openBottomDrawer();
  }

  renderNoData = () => {
    return (
      <View style={{alignItems: 'center', margin: 20}}>
        <Text>No results found</Text>
      </View>
    );
  };

  filterTimeZones(searchValue) {
    let listOfTimezones = this.state.timeZones;
    listOfTimezones = timeZones.filter(function (item) {
      return (
        item.timezonename.includes(searchValue) ||
        item.name.includes(searchValue)
      );
    });
    this.setState({timeZones: listOfTimezones});
  }

  setTimeZone() {
    const {isSelected, timeZoneSearch, timeZones} = this.state;
    return (
      <>
        <Text style={styles.header}>Time Zones</Text>
        <TextInput
          onChangeText={(timeZoneSearch) => {
            this.filterTimeZones(timeZoneSearch);
            this.setState({timeZoneSearch});
          }}
          placeholder="Search time zone"
          value={timeZoneSearch}
          style={{
            borderWidth: 1,
            borderColor: '#E4E5E7',
            fontSize: normalize(16),
            borderRadius: 4,
            padding: 10,
            marginHorizontal: 15,
          }}
        />
        <FlatList
          data={timeZones}
          ListEmptyComponent={this.renderNoData}
          renderItem={({item}) => {
            const {timezonename, name} = item;
            return (
              <TouchableOpacity
                onPress={() => {
                  this.setState({isSelected: timezonename});
                  this.props.setTimeZone(timezonename, name);
                  this.timeZoneModal.closeBottomDrawer();
                }}
                style={[
                  styles.mainView,
                  {
                    backgroundColor:
                      isSelected === timezonename ? '#EFF0F1' : null,
                  },
                ]}>
                <Text style={styles.textStyle}>
                  {timezonename + ' - ' + name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </>
    );
  }

  render() {
    return (
      <BottomUpModalShare
        ref={(ref) => {
          this.timeZoneModal = ref;
        }}
        height={580}>
        {this.setTimeZone()}
      </BottomUpModalShare>
    );
  }
}

const styles = StyleSheet.create({
  textStyle: {fontWeight: '400', fontSize: normalize(16), color: '#202124'},
  header: {
    margin: 18.93,
    marginLeft: 30,
    fontWeight: '600',
    fontSize: normalize(16),
    color: '#202124',
  },
  mainView: {
    padding: 15,
    paddingLeft: 20,
    marginHorizontal: 10,
    borderRadius: 4,
  },
});

export default MeetTimeZone;
