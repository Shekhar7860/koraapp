import React from 'react';
import {
  View,
  Text,
  //SafeAreaView,
  StyleSheet,
  TouchableHighlight,
  StatusBar,
  TextInput,
  //ScrollView,
} from 'react-native';
import {ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native';
import Autocomplete from 'react-native-autocomplete-input';
import {Header} from '../navigation/TabStacks';
import * as Constants from '../components/KoraText';
import {Icon} from '../components/Icon/Icon';
import DatePicker from 'react-native-datepicker';
import {connect} from 'react-redux';
import {normalize} from '../utils/helpers';
import {navigate, goBack} from '../navigation/NavigationService';
import SliderScreen from '../components/Chat/extras/slider';
import {getBoardFiles} from '../../shared/redux/actions/message-thread.action';
import {withTranslation, useTranslation} from 'react-i18next';
import {Avatar} from '../components/Icon/Avatar';
import RNPickerSelect from '../components/Library/react-native-picker-select';
import {
  getContactList,
  getRecentContactList,
} from '../../shared/redux/actions/create-message.action';
//import {black} from 'react-native-paper/lib/typescript/src/styles/colors';
// export const Dropdown = (props) => {
//   return (
//     <RNPickerSelect
//       onValueChange={(value) => console.log(value)}
//       items={props.items}
//       placeholder={props.placeholder}
//       useNativeAndroidPickerStyle={false}
//       containerStyle={styles.dropdownView}
//       styles={styles.dropdownView}
//     />
//   );
// };

const typeOption = [
  {label: 'Image', value: 'Image'},
  {label: 'Audio', value: 'Audio'},
  {label: 'Video', value: 'Video'},
  {label: 'Attachment', value: 'Attachment'},
];

const currentDate = new Date();
// const typeOption = [
//   // {key: 1, text: 'All'},
//   {key: 2, text: 'Image'},
//   {key: 3, text: 'Audio'},
//   {key: 4, text: 'Video'},
//   {key: 5, text: 'Attachment'},
// ];
let workspaceOptions = [];

class fileSearchFilter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fromUserName: '',
      fromUserId: '',
      defaultType: 'All',
      typeEnabled: false,
      defaultDate: 'Select after & before date',
      defaultSize: 'Select a size range',
      dateEnabled: false,
      sizeEnabled: false,
      afterdate: '',
      beforeDate: '',
      minValue: '',
      maxValue: '',
      autoCompleteEnabled: false,
      query: '',
      fromContactSearch: [],
    };
  }

  get boardId() {
    return this.props.route.params.boardId;
  }

  componentDidMount() {
    this.props.getRecentContactList();
  }

  headerView() {
    return (
      <Header
        {...this.props}
        title={'Filters'}
        goBack={true}
        rightContent={this.resetButton()}
      />
    );
  }

  Dropdown = (props) => {
    return (
      <RNPickerSelect
        onValueChange={(value) =>
          this.dropDownValueChanged(value, props.dropDownItem)
        }
        items={props.items}
        placeholder={props.placeholder}
        placeholderTextColor="black"
        value={this.state.defaultType}
        useNativeAndroidPickerStyle={false}
        containerStyle={styles.dropdownView}
        styles={styles.dropdownView}
      />
    );
  };

  dropDownValueChanged = (text, type) => {
    if (type === 'type') {
      this.setState({defaultType: text});
    }
  };

  resetAll() {
    this.setState({
      fromUserId: '',
      fromUserName: '',
      query: '',
      defaultType: 'All',
      typeEnabled: false,
      dateEnabled: false,
      sizeEnabled: false,
      afterdate: '',
      beforeDate: '',
      minValue: '',
      maxValue: '',
    });
  }
  resetButton() {
    const {t} = this.props;
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.05)"
        onPress={() => this.resetAll()}
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          borderRadius: 5,
        }}>
        <Text
          style={{
            color: '#0D6EFD',
            fontSize: normalize(17),
            fontWeight: '500',
          }}>
          {t('Reset')}
        </Text>
      </TouchableHighlight>
    );
  }

  renderSize() {
    const {t} = this.props;
    let size = this.state.minValue + ' - ' + this.state.maxValue;
    if (size !== ' - ') {
      return (
        <Text style={styles.dateValue}>
          {size}
          {t(' kb')}
        </Text>
      );
    } else {
      return <Text style={styles.dropDownValue}>{this.state.defaultSize}</Text>;
    }
  }

  renderDate() {
    let date = this.state.afterdate + ' - ' + this.state.beforeDate;
    if (date !== ' - ') {
      return <Text style={styles.dateValue}>{date}</Text>;
    } else {
      return <Text style={styles.dropDownValue}>{this.state.defaultDate}</Text>;
    }
  }
  getDate(date) {
    let [d, m, y] = date.split('-'); //Split the string
    return [y, m - 1, d]; //Return as an array with y,m,d sequence
  }

  applyFilter() {
    let str = this.getDate(this.state.afterdate);
    let fromDate = new Date(...str);
    str = this.getDate(this.state.beforeDate);
    let toDate = new Date(...str);

    let payload = {
      size: {
        min: this.state.minValue || 0,
        max: this.state.maxValue || 1024,
      },
    };
    if (this.state.afterdate && this.state.beforeDate) {
      payload.date = {
        from: fromDate,
        to: toDate,
      };
    }
    if (this.state.defaultType !== 'All') {
      payload.type = this.state.defaultType.toLowerCase();
    }
    if (this.state.fromUserName) {
      payload.name = this.state.fromUserName;
      payload.from = this.state.fromUserId;
    }
    let _params = {
      boardId: this.boardId,
    };
    console.log('Filter', payload);
    this.props.getBoardFiles(_params, payload);
    goBack();
  }

  renderArrowIcon(enabled) {
    return (
      <View style={styles.arrowStyle}>
        {!enabled ? (
          <Icon name={'DownArrow'} size={normalize(18)} color="#202124" />
        ) : (
          <Icon name={'UpArrow'} size={normalize(18)} color="#202124" />
        )}
      </View>
    );
  }
  filterName(query) {
    query = query.toUpperCase();
    let searchResults = this.props.contactData?.filter((s) => {
      let name = s.fN + ' ' + s.lN;
      return name?.toUpperCase().includes(query);
    });
    this.setState({fromContactSearch: searchResults});
  }

  onPressOfList = (item) => {
    this.setState({
      query: item.fN,
      autoCompleteEnabled: false,
      fromUserId: item.id,
      fromUserName: item.fN + ' ' + item.lN,
    });
  };

  textChanged = (text) => {
    if (text.length > 0) {
      this.filterName(text);
    }
  };

  render() {
    const {t} = this.props;
    const query = this.state.query;
    var data = [];
    if (this.state.autoCompleteEnabled) {
      data = this.state.fromContactSearch;
    }
    return (
      <View style={styles.containerStyle}>
        {this.headerView()}
        <ScrollView>
          <View style={styles.contentViewStyle}>
            <Text style={styles.textLabel}>{t('People')}</Text>
            <Autocomplete
              data={data}
              placeholder="Type name"
              placeholderTextColor="#BDC1C6"
              //placeholderStyle={{fontSize: 30}}
              defaultValue={query}
              inputContainerStyle={styles.searchTextStyle}
              listStyle={styles.listStyle}
              containerStyle={styles.autoCompleteContainer}
              onChangeText={(text) => this.textChanged(text)}
              onFocus={() =>
                this.setState({
                  fromContactSearch: this.props.contactData,
                  autoCompleteEnabled: true,
                })
              }
              renderItem={(data) => (
                <TouchableHighlight
                  underlayColor="rgba(0,0,0,0.05)"
                  style={{}}
                  onPress={() => this.onPressOfList(data.item)}>
                  <View style={styles.row}>
                    <Avatar
                      profileIcon={data.item.icon}
                      userId={data.item.id}
                      name={data.item.fN + ' ' + data.item.lN}
                      color={data.item.color}
                    />
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignContent: 'center',
                        height: 44,
                      }}>
                      <Text style={styles.nameTextStyle}>{data.item.fN}</Text>
                    </View>
                  </View>
                </TouchableHighlight>
              )}
            />
          </View>
          {this.state.autoCompleteEnabled ? (
            <View style={{marginTop: 50}} />
          ) : null}
          <View style={{margin: 25, marginBottom: 0, marginTop: 0}}>
            <Text style={styles.textLabel}>{t('Type')}</Text>
            {this.Dropdown({
              items: typeOption,
              placeholder: {
                label: 'All',
                value: null,
                color: '#9EA0A4',
                // selected:
              },
              dropDownItem: 'type',
            })}
          </View>
          <View style={styles.mainView}>
            <Text style={styles.textLabel}>{t('Size range')}</Text>
            <TouchableHighlight
              underlayColor={'rgba(0,0,0,0.1)'}
              style={styles.dropdownView}
              onPress={() =>
                this.setState({sizeEnabled: !this.state.sizeEnabled})
              }>
              <View style={{flexDirection: 'row'}}>
                {this.renderSize()}
                {this.renderArrowIcon(this.state.sizeEnabled)}
              </View>
            </TouchableHighlight>
            {this.state.sizeEnabled ? (
              <SliderScreen
                minValue={10}
                maxValue={1024}
                getRangeValue={(min, max) => {
                  this.setState({minValue: min, maxValue: max});
                }}
              />
            ) : null}
          </View>
          <View style={styles.mainView}>
            <Text style={styles.textLabel}>{t('Date range')}</Text>
            <TouchableHighlight
              underlayColor={'rgba(0,0,0,0.1)'}
              style={styles.dropdownView}
              onPress={() =>
                this.setState({dateEnabled: !this.state.dateEnabled})
              }>
              <View style={{flexDirection: 'row'}}>
                {this.renderDate()}
                {this.renderArrowIcon(this.state.dateEnabled)}
              </View>
            </TouchableHighlight>
            {this.state.dateEnabled ? (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  marginTop: 10,
                  paddingVertical: 5,
                }}>
                <View>
                  <DatePicker
                    style={{width: 150}}
                    date={this.state.afterdate}
                    mode="date"
                    placeholder="After date"
                    format="MM-DD-YYYY"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{
                      dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 8,
                        marginLeft: 0,
                      },
                      dateInput: {
                        marginLeft: 36,
                        top: 5,
                      },
                      btnTextConfirm: {
                        color: '#0D6EFD',
                      },
                    }}
                    onDateChange={(date) => {
                      this.setState({afterdate: date});
                    }}
                  />
                </View>
                <View
                  style={{
                    flex: 1,
                    alignItems: 'flex-end',
                  }}>
                  <DatePicker
                    style={{width: 150}}
                    date={this.state.beforeDate}
                    mode="date"
                    placeholder="Before date"
                    format="MM-DD-YYYY"
                    confirmBtnText="Confirm"
                    cancelBtnText="Cancel"
                    customStyles={{
                      dateIcon: {
                        position: 'absolute',
                        left: 0,
                        top: 8,
                        marginLeft: 0,
                      },
                      dateInput: {
                        marginLeft: 36,
                        top: 5,
                      },
                      btnTextConfirm: {
                        color: '#0D6EFD',
                      },
                    }}
                    onDateChange={(date) => {
                      this.setState({beforeDate: date});
                    }}
                  />
                </View>
              </View>
            ) : null}
          </View>
        </ScrollView>
        <SafeAreaView>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => this.applyFilter()}
            style={{
              borderRadius: 5,
              backgroundColor: '#0D6EFD',
              padding: 8,
              margin: 15,
              width: '92%',
              alignItems: 'center',
              height: 45,
            }}>
            <Text
              style={{
                color: '#ffffff',
                fontSize: normalize(16),
                fontWeight: '400',
              }}>
              {t('Apply')}
            </Text>
          </TouchableHighlight>
        </SafeAreaView>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainView: {
    margin: 25,
    marginBottom: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minHeight: 44,
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 10,
    marginRight: 10,
    // padding: 20,
    //backgroundColor: 'red',
  },
  dropdownView: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    marginTop: 1,
    flexDirection: 'row',
    height: 42,
    alignItems: 'center',
  },
  arrowStyle: {
    justifyContent: 'center',
    marginEnd: 10,
  },
  dateValue: {
    flex: 1,
    fontWeight: '400',
    fontSize: normalize(16),
    lineHeight: 20,
    margin: 8,
  },
  dropDownValue: {
    flex: 1,
    fontWeight: '400',
    fontSize: normalize(13),
    lineHeight: 20,
    margin: 8,
    color: '#BDC1C6',
  },
  allValueStyle: {
    flex: 1,
    fontWeight: '400',
    fontSize: normalize(16),
    lineHeight: 20,
    margin: 8,
    color: '#202124',
  },
  contentViewStyle: {
    zIndex: 1,
    //flex: 1,
    margin: 25,
    marginBottom: 27,
  },
  textLabel: {
    marginBottom: 11,
    fontSize: normalize(16),
    fontWeight: '500',
    color: '#202124',
    fontFamily: Constants.fontFamily,
  },
  searchTextStyle: {
    flex: 1,
    paddingStart: 8,
    fontWeight: 'normal',
    fontSize: normalize(20),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    marginTop: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    borderRadius: 4,
  },
  nameTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    marginLeft: 15,
    fontFamily: Constants.fontFamily,
    alignItems: 'center',
  },
  listStyle: {
    maxHeight: 200,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#ddd',
    borderBottomWidth: 0,
    shadowColor: 'black',
    shadowOffset: {width: 5, height: 10},
    shadowOpacity: 12,
    shadowRadius: 10,
    zIndex: 1,
  },
  autoCompleteContainer: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  containerStyle: {
    flex: 1,
    backgroundColor: 'white',
  },
});

const mapStateToProps = (state) => {
  let {createMessage} = state;
  return {
    contactlist: createMessage.contactlistData,
    contactData: createMessage.recentData,
  };
};

export default connect(mapStateToProps, {
  getBoardFiles,
  getContactList,
  getRecentContactList,
})(withTranslation()(fileSearchFilter));
