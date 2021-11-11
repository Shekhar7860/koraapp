import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableHighlight,
  StatusBar,
  TextInput,
  Picker,
  TouchableOpacity,
} from 'react-native';
import {Header} from '../navigation/TabStacks';
import * as Constants from '../components/KoraText';
import {Icon} from '../components/Icon/Icon';
import {Avatar} from '../components/Icon/Avatar';
import {ScrollView} from 'react-native';

import DatePicker from 'react-native-datepicker';
import {KoraCheckBox} from './checkBox.js';
import {connect} from 'react-redux';
import Autocomplete from 'react-native-autocomplete-input';
import UnviversalSearchDropDown from '../../native/screens/ChatsThreadScreen/UniversalSearchDropDown';
import {normalize} from '../utils/helpers';
import {setUniversalSearchFilterData} from '../../shared/redux/actions/native.action';
import {da} from 'date-fns/locale';
import {getContactList} from '../../shared/redux/actions/create-message.action';
import RNPickerSelect from '../../native/components/Library/react-native-picker-select/index';
import {emptyArray} from '../../shared/redux/constants/common.constants';

const currentDate = new Date();
const typeOption = [
  {label: 'All', value: 'All'},
  {label: 'Message', value: 'Message'},
  {label: 'People', value: 'People'},
  {label: 'Rooms', value: 'Rooms'},
];
let workspaceOptions = [];
class searchFilter extends React.Component {
  Dropdown = (props) => {
    return (
      <RNPickerSelect
        onValueChange={(value) =>
          this.dropDownValueChanged(value, props.dropDownItem)
        }
        items={props.items}
        value={props.defaultType}
        //placeholder={props.placeholder}
        useNativeAndroidPickerStyle={false}
        containerStyle={styles.dropdownView}
        styles={styles.dropdownView}
      />
    );
  };

  dropDownValueChanged = (text, type) => {
    if (type === 'type') {
      this.setState({defaultType: text});
    } else if (type === 'workspace') {
      this.setState({defaultWorkspace: text});
    }
  };

  constructor(props) {
    var workSpaceList = [{label: 'All', value: 'All'}];
    props.workspacelist.forEach((element) => {
      var data = {label: element.name, value: element.name};
      workSpaceList.push(data);
    });
    super(props);
    this.state = {
      fromUser: '',
      toUser: '',
      defaultType: 'All',
      typeEnabled: false,
      defaultWorkspace: 'All',
      workspaceEnabled: false,
      workSpacesList: workSpaceList,
      defaultDate: 'Select after & before date',
      dateEnabled: false,
      afterdate: '',
      beforeDate: '',
      checkUnread: true,
      checkAttachment: true,
      checkHasLink: true,
      autoCompleteEnabled: false,
      fromContactSearch: [],
    };
  }
  componentDidMount() {
    this.props.getContactList('');
  }

  filterName(query) {
    query = query.toUpperCase();
    let searchResults = this.props.contactData?.filter((s) => {
      let name = s.fN + ' ' + s.lN;
      return name?.toUpperCase().includes(query);
    });
    this.setState({fromContactSearch: searchResults});
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

  onSubmitFilter = () => {
    let payload = {
      from: this.state.fromUser,
      hasAttachments: this.state.checkAttachment,
      hasLinks: this.state.checkHasLink,
    };
    this.props.setUniversalSearchFilterData(payload);
  };

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

  resetAll() {
    this.setState({
      fromUser: '',
      toUser: '',
      defaultType: 'All',
      typeEnabled: false,
      defaultWorkspace: 'All',
      workspaceEnabled: false,
      defaultDate: 'Select after & before date',
      dateEnabled: false,
      afterdate: '',
      beforeDate: '',
      checkUnread: true,
      checkAttachment: true,
      checkHasLink: true,
      query: '',
    });

    // this.toInput.clear();
    this.props.setUniversalSearchFilterData([]);
  }
  resetButton() {
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
          Reset
        </Text>
      </TouchableHighlight>
    );
  }
  textChanged = (text) => {
    if (text.length > 0) {
      // this.setState({autoCompleteEnabled: true});
      this.filterName(text);
    }
  };

  onPressOfList = (item) => {
    this.setState({
      query: item.fN + ' ' + item.lN,
      autoCompleteEnabled: false,
      fromUser: item.id,
    });
  };

  // const handleClick = useCallback(() => {    console.log('Clicked!');  }, []);

  render() {
    const query = this.state.query;
    var data = [];
    if (this.state.autoCompleteEnabled) {
      data = this.state.fromContactSearch;
    }
    console.log('Workspace list', this.state.workSpacesList);
    return (
      <View style={styles.containerStyle}>
        {this.headerView()}
        <ScrollView>
          <View style={styles.contentViewStyle}>
            <Text style={styles.textLabel}>From user</Text>
            <Autocomplete
              data={data}
              placeholder="Type name"
              placeholderTextColor="#BDC1C6"
              defaultValue={query}
              inputContainerStyle={styles.searchTextStyle}
              listStyle={styles.listStyle}
              containerStyle={styles.containerStyle}
              onChangeText={(text) => this.textChanged(text)}
              onFocus={() =>
                this.setState({
                  fromContactSearch: this.props.contactData,
                  autoCompleteEnabled: true,
                })
              }
              onSubmitEditing={() =>
                this.setState({
                  autoCompleteEnabled: false,
                })
              }
              renderItem={(data) => (
                <TouchableOpacity onPress={() => this.onPressOfList(data.item)}>
                  <View style={styles.row}>
                    <Avatar
                      profileIcon={data.item.icon}
                      userId={data.item.id}
                      name={data.item.fN.trim() + ' ' + data.item.lN.trim()}
                      color={data.item.color}
                    />
                    {/* <Image source={item.image} style={styles.pic} /> */}
                    <View
                      style={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignContent: 'center',
                        height: 44,
                      }}>
                      <Text style={styles.nameTextStyle}>
                        {data.item.fN.trim() + ' ' + data.item.lN.trim()}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
            {/* <TextInput
              style={styles.searchTextStyle}
              placeholder="Type name"
              placeholderTextColor="#BDC1C6"
              ref={(input) => {
                this.fromInput = input;
              }}
              maxLength={20}
              onChangeText={(text) => {
                this.setState({fromUser: text});
              }}
                />
                {/* ) : null} */}
          </View>
          {/* <View style={{marginLeft: 25, marginRight: 25}}> to user commented, functionality not there
            <Text style={styles.textLabel}>To user</Text>
            <TextInput
              ref={(input) => {
                this.toInput = input;
              }}
              style={styles.searchTextStyle}
              placeholder="Type name"
              placeholderTextColor="#BDC1C6"
              maxLength={20}
              onChangeText={(text) => {
                this.setState({ toUser: text });
              }}
            />
          </View> */}
          <View style={{marginLeft: 27, marginRight: 27, marginBottom: 10}}>
            <Text style={styles.textLabel}>Type</Text>
            {this.Dropdown({
              items: typeOption,
              defaultType: this.state.defaultType,
              dropDownItem: 'type',
            })}

            {/* <TouchableOpacity
              onPress={() => {
                this.setState({ typeEnabled: !this.state.typeEnabled });
              }}
            >
              <View style={styles.dropdownView}>
                <Text style={styles.dropDownValue}>{this.state.defaultType}</Text>
                <TouchableHighlight
                  underlayColor={'rgba(0,0,0,0.1)'}
                  style={styles.arrowStyle}
                  onPress={() =>
                    this.setState({ typeEnabled: !this.state.typeEnabled })
                  }>
                  {!this.state.typeEnabled ? (
                    <Icon name={'DownArrow'} size={16} color="#5F6368" />
                  ) : (
                      <Icon name={'UpArrow'} size={16} color="#5F6368" />
                    )}
                </TouchableHighlight>
              </View>
            </TouchableOpacity> */}
          </View>
          <View style={styles.mainView}>
            <Text style={styles.textLabel}>Workspaces</Text>
            {this.Dropdown({
              items: this.state.workSpacesList,
              defaultType: this.state.defaultWorkspace,
              dropDownItem: 'workspace',
            })}
            {/* <TouchableOpacity
              onPress={() => {
                this.setState({
                  workspaceEnabled: !this.state.workspaceEnabled,
                });
              }}
            >
              <View style={styles.dropdownView}>
                <Text style={styles.dropDownValue}>
                  {this.state.defaultWorkspace}
                </Text>
                <TouchableHighlight
                  underlayColor={'rgba(0,0,0,0.1)'}
                  style={styles.arrowStyle}
                  onPress={() => {

                  }}>
                  {!this.state.workspaceEnabled ? (
                    <Icon name={'DownArrow'} size={16} color="#5F6368" />
                  ) : (
                      <Icon name={'UpArrow'} size={16} color="#5F6368" />
                    )}
                </TouchableHighlight>
              </View>
            </TouchableOpacity> */}
            {this.state.workspaceEnabled ? (
              <View style={{}}>
                {this.props.workspacelist?.map((option) => {
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        this.setState({
                          workspaceEnabled: !this.state.workspaceEnabled,
                        });
                        this.setState({defaultWorkspace: option.name});
                      }}>
                      <Text style={{margin: 8}}>{option.name}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </View>
          <View style={styles.mainView}>
            <TouchableOpacity
              onPress={() => {
                this.setState({dateEnabled: !this.state.dateEnabled});
              }}>
              <Text style={styles.textLabel}>Date Range</Text>
              <View style={styles.dropdownView}>
                <Text style={styles.dropDownValue}>{this.renderDate()}</Text>
                <TouchableHighlight
                  underlayColor={'rgba(0,0,0,0.1)'}
                  style={styles.arrowStyle}
                  onPress={() =>
                    this.setState({dateEnabled: !this.state.dateEnabled})
                  }>
                  {!this.state.dateEnabled ? (
                    <Icon name={'DownArrow'} size={16} color="#5F6368" />
                  ) : (
                    <Icon name={'UpArrow'} size={16} color="#5F6368" />
                  )}
                </TouchableHighlight>
              </View>
            </TouchableOpacity>
            {this.state.dateEnabled ? (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}>
                <DatePicker
                  style={{width: 150, marginRight: 20}}
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
            ) : null}
          </View>
          <View
            style={{
              marginLeft: 25,
              marginRight: 25,
              marginTop: 20,
              marginBottom: 40,
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={{flexDirection: 'row'}}>
                <KoraCheckBox
                  isChecked={this.state.checkUnread}
                  onValueChange={(newValue) =>
                    this.setState({checkUnread: newValue})
                  }
                />
                <Text
                  style={{
                    fontSize: normalize(16),
                    marginLeft: 8,
                    marginRight: 0,
                  }}>
                  Unread thread
                </Text>
              </View>
              <View style={{flexDirection: 'row', justifyContent: 'center'}}>
                <KoraCheckBox
                  isChecked={this.state.checkAttachment}
                  onValueChange={(newValue) =>
                    this.setState({checkAttachment: newValue})
                  }
                />
                <Text
                  style={{
                    fontSize: normalize(16),
                    marginLeft: 8,
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                  }}>
                  Has attachment
                </Text>
              </View>
            </View>
            <View style={{flexDirection: 'row', marginTop: 20}}>
              <KoraCheckBox
                isChecked={this.state.checkHasLink}
                onValueChange={(newValue) =>
                  this.setState({checkHasLink: newValue})
                }
              />
              <Text
                style={{
                  fontSize: normalize(16),
                  marginLeft: 8,
                  marginRight: 40,
                  justifyContent: 'center',
                }}>
                Has link
              </Text>
            </View>
          </View>
          <View style={{alignItems: 'center'}}>
            <TouchableHighlight
              underlayColor="rgba(0,0,0,0.05)"
              onPress={() => this.onSubmitFilter()}
              style={{
                borderRadius: 5,
                backgroundColor: '#0D6EFD',
                padding: 8,
                margin: 15,
                width: '90%',
                alignItems: 'center',
                height: 38,
              }}>
              <Text
                style={{
                  color: '#ffffff',
                  fontSize: normalize(16),
                  fontWeight: '400',
                }}>
                Apply
              </Text>
            </TouchableHighlight>
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
    backgroundColor: '#fff',
  },
  mainView: {
    margin: 25,
    marginBottom: 10,
  },
  dropdownView: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    marginTop: 1,
    flexDirection: 'row',
  },
  arrowStyle: {
    justifyContent: 'center',
    marginEnd: 10,
  },
  dropDownValue: {
    flex: 1,
    fontSize: normalize(14),
    lineHeight: 20,
    margin: 8,
    color: '#202124',
  },
  contentViewStyle: {
    margin: 25,
    marginBottom: 30,
    zIndex: 999,
  },
  textLabel: {
    marginBottom: 7,
    fontSize: normalize(17),
    fontWeight: '400',
    color: '#202124',
    fontFamily: Constants.fontFamily,
  },
  searchTextStyle: {
    flex: 1,
    paddingStart: 8,
    fontWeight: '400',
    fontSize: normalize(15),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    marginTop: 1,
    minHeight: 38,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    borderRadius: 4,
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
  containerStyle: {
    position: 'relative',
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  nameTextStyle: {
    backgroundColor: 'white',
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    marginLeft: 15,
    fontFamily: Constants.fontFamily,
    alignItems: 'center',
  },
  containerStyle: {
    flex: 1,
    backgroundColor: 'white',
  },
});
const mapStateToProps = (state) => {
  const {workspace, native, createMessage, home} = state;
  return {
    workspacelist: workspace.workspacelist?.ws || emptyArray,
    activeWsId: workspace.activeWsId,
    activeWsMembers: workspace.activeWsMembers?.members || emptyArray,
    exceptionList: native.exceptionList,
    contactData: createMessage.contactlistData,
    showLoader: home.showLoader,
    setFilterData: native.setUniversalSearchFilterData,
  };
};

export default connect(mapStateToProps, {
  setUniversalSearchFilterData,
  getContactList,
})(searchFilter);
