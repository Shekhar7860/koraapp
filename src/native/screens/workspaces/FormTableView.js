import {is, th} from 'date-fns/locale';
import {Button} from 'native-base';
import React, {Component} from 'react';
import {BackHandler, Alert} from 'react-native';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {Slider} from 'react-native-elements';
import DropDownPicker from 'react-native-custom-dropdown';
import {connect} from 'react-redux';
import WebView from 'react-native-webview';
import UserAvatar from '../../components/Library/react-native-user-avatar/src';
import * as UsersDao from '../../../dao/UsersDao';
import API_URL from '../../../../env.constants';
import {navigate, goBack} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import Modal from 'react-native-modal';
import {Icon} from '../../components/Icon/Icon';
import {normalize} from '../../utils/helpers';
import DateTimePicker from '../../screens/Meetings/NewMeeting/dateTimePicker';
import {editTableRow} from '../../../shared/redux/actions/workspace.action';
import {store} from '../../../shared/redux/store';
const setMeetTime = React.createRef();
import moment from 'moment';
import CheckBox from 'react-native-check-box';
import {getTableDetail} from '../../../shared/redux/actions/workspace.action';
import {Header} from '../../navigation/TabStacks';
import {ScrollView} from 'react-native';
import TextInputMask from 'react-native-masked-input';
import {Rating, AirbnbRating} from 'react-native-ratings';
import * as ContactsDao from '../../../dao/ContactsDao';

const INPUT_TYPE = {
  NUMBER: 'number',
  TEXT: 'text',
  DATE: 'date',
  DROP_DOWN: 'dropdown',
  RICH_TEXT: 'richtext',
  PHONE_NUMBER: 'phone',
  CURRENCY: 'currency',
  CHECK_BOX: 'checkbox',
  PEOPLE: 'people',
  EMAIl: 'email',
  LINK: 'link',
  LOCATION: 'location',
  RATING: 'rating',
  PROGRESS: 'progress',
  PERCENTAGE: 'percentage',
};
import Toast from 'react-native-simple-toast';
class FormTableView extends React.Component {
  rowData = null;
  columnHeader = null;
  tabelInfo = null;
  numericRegex = /^([0-9]{1,100})+$/;
  constructor(props) {
    super(props);

    this.state = {
      inputVal: [],
      isRender: false,
    };
  }

  componentDidMount() {
    const {route} = this.props;
    this.rowData = route.params.rowData;
    this.tabelInfo = route.params.tabelInfo;
    this.columnHeader = route.params.columnHeader;
    this.setState({isRender: true});

    // console.log(
    //   '---------------------col-----------',
    //   JSON.stringify(this.columnHeader),
    // );
    // console.log(
    //   '---------------------row-----------',
    //   JSON.stringify(this.rowData),
    // );
  }
  componentDidUpdate(prevProps) {
    if (prevProps.conatactsSelectedBack !== this.props.conatactsSelectedBack) {
      let data = this.props.conatactsSelectedBack;
      let dataArray = [];
      for (let i = 0; i < data.members?.length; i++) {
        dataArray.push(data.members[i].id);
      }
      console.log(
        '-----------conatactsSelectedBack---------------',
        JSON.stringify(data),
      );
      console.log(
        '-----------dataArray---------------',
        JSON.stringify(dataArray),
      );

      this.handleInputValChange(data.index, dataArray, data.value);
    }
  }
  save = () => {
    if (this.state.inputVal.length > 0) {
      let values = this.state.inputVal.filter(function (e) {
        return e !== undefined && e.value !== '';
      });
      let payLoad = {};
      if (values.length > 0) {
        Object.entries(values).map(([key, value]) => {
          payLoad[value.key] = value.value;
        });
        this.editRowApiCall(payLoad);
        // call api here
      } else {
        alert('No modifications found');
        console.log('---------values-----------', values);
      }
    } else {
      alert('No modifications found');
    }
  };
  editRowApiCall = (data) => {
    let payload = {
      params: this.tabelInfo,
      data: data,
    };
    store.dispatch(
      editTableRow(payload, (type, response) => {
        if (type === 'success') {
          Toast.showWithGravity('Success', Toast.SHORT, Toast.CENTER);
          goBack();
        } else {
          Toast.showWithGravity('Updating failed', Toast.SHORT, Toast.CENTER);
        }
      }),
    );
  };

  handleInputValChange(index, text, itemObject) {
    let flag = true;
    if (itemObject?.type === INPUT_TYPE.NUMBER) {
      flag = this.numericRegex.test(text);
    }
    if (flag) {
      let inputVal = [...this.state.inputVal];
      const keyO = itemObject?.id;
      let val = {key: keyO, value: text};
      inputVal[index] = val;
      this.setState({inputVal});
    }
  }

  getContactsData(contact, index, value) {
    //  let contact = ContactsDao.getContacts(list);
    console.log('-------selected------------------', JSON.stringify(contact));

    navigate(ROUTE_NAMES.ADD_PARTICIPENTS, {
      index: index,
      value: value,
      fromTable: true,
      participants: contact,
    });
    //return contact;
  }
  rowHeaders = (value) => {
    let iconName = 'kr-tick';
    switch (value.type) {
      case INPUT_TYPE.TEXT:
        iconName = 'Font';
        break;
      case INPUT_TYPE.NUMBER:
        iconName = 'Number';
        break;
      case INPUT_TYPE.DATE:
        iconName = 'Clock';
        break;
      case INPUT_TYPE.DROP_DOWN:
        iconName = 'Dropdown';
        break;
      case INPUT_TYPE.RICH_TEXT:
        iconName = 'Text';
      case INPUT_TYPE.CHECK_BOX:
        iconName = 'CheckBox';
        break;
      case INPUT_TYPE.PEOPLE:
        iconName = 'kr-contacts';
        break;
      case INPUT_TYPE.EMAIl:
        iconName = 'Mail';
        break;
      case INPUT_TYPE.LINK:
        iconName = 'Link';
        break;
      case INPUT_TYPE.LOCATION:
        iconName = 'Location';
        break;
      case INPUT_TYPE.RATING:
        iconName = 'DR_Starred';
        break;
      case INPUT_TYPE.PROGRESS:
        iconName = 'DR_Starred';
        break;
      case INPUT_TYPE.PERCENTAGE:
        iconName = 'DR_Starred';
        break;
      case INPUT_TYPE.PHONE_NUMBER:
        iconName = 'DR_Starred';
      default:
        break;
    }
    return (
      <View style={styles.view_row_header}>
        <Icon name={iconName} size={normalize(16)} color={'grey'} />
        <Text style={styles.tvHeader}>{value?.name}</Text>
      </View>
    );
  };
  onChanged(text) {
    this.setState({
      mobile: text.replace(/[^0-9]/g, ''),
    });
  }

  avatarViews = (groupMembers) => {
    const radius = 48;
    const innerCircleRadius = radius * 0.62;
    const circleStyle = {
      borderColor: '#ffffff',
      borderWidth: 0.7,
      borderRadius: innerCircleRadius,
      overflow: 'hidden',
    };

    const heightRadius = {
      height: innerCircleRadius,
      width: innerCircleRadius,
    };
    let size = groupMembers.length;
    if (size >= 4) {
      let text = size - 3;
      return (
        <View style={[heightRadius, styles.style5]}>
          <UserAvatar
            color={groupMembers[0]?.color}
            name={groupMembers[0]?.fN}
            style={circleStyle}
          />
          <UserAvatar
            color={groupMembers[1]?.color}
            name={groupMembers[1]?.fN}
            style={circleStyle}
          />
          <UserAvatar
            color={groupMembers[2]?.color}
            name={groupMembers[2]?.fN}
            style={circleStyle}
          />

          <UserAvatar
            color={'red'}
            name={'+' + (size - 3)}
            displayFullText={true}
            style={circleStyle}
          />
        </View>
      );
    } else if (size == 3) {
      return (
        <View style={[heightRadius, styles.style5]}>
          <UserAvatar
            color={groupMembers[0]?.color}
            name={groupMembers[0]?.fN}
            style={circleStyle}
          />
          <UserAvatar
            color={groupMembers[1]?.color}
            name={groupMembers[1]?.fN}
            style={circleStyle}
          />
          <UserAvatar
            color={groupMembers[2]?.color}
            name={groupMembers[2]?.fN}
            style={circleStyle}
          />
        </View>
      );
    } else if (size == 2) {
      return (
        <View style={[heightRadius, styles.style5]}>
          <UserAvatar
            color={groupMembers[0]?.color}
            name={groupMembers[0]?.fN}
            style={circleStyle}
          />
          <UserAvatar
            color={groupMembers[1]?.color}
            name={groupMembers[1]?.fN}
            style={circleStyle}
          />
        </View>
      );
    } else {
      return (
        <UserAvatar
          color={groupMembers[0]?.color}
          name={groupMembers[0]?.fN}
          style={circleStyle}
        />
      );
    }
  };

  listData = (listItems) => {
    return listItems?.map((value, index) => {
      switch (value?.type) {
        case INPUT_TYPE.TEXT:
        case INPUT_TYPE.NUMBER:
        case INPUT_TYPE.RICH_TEXT:
        case INPUT_TYPE.EMAIl:
        case INPUT_TYPE.LINK:
        case INPUT_TYPE.LOCATION:
          let currentValue = this.state.inputVal[index];
          if (currentValue !== undefined) {
            currentValue = currentValue.value;
          }

          if (currentValue === undefined) {
            currentValue =
              this.rowData[value.id] !== undefined
                ? this.rowData[value.id]
                : '';
          }

          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}
              <View style={styles.view_row}>
                <TextInput
                  key={`r-${index}`}
                  defaultValue={currentValue}
                  placeholder={
                    value.type === 'number' ? 'Enter value' : 'Enter text'
                  }
                  keyboardType={value.type === 'number' ? 'numeric' : 'default'}
                  style={styles.titleInputStyle}
                  onChangeText={(text) => {
                    this.handleInputValChange(index, text, value);
                  }}
                  value={currentValue}
                />
              </View>
            </View>
          );
          break;
        case INPUT_TYPE.PHONE_NUMBER:
          currentValue = this.state.inputVal[index];
          if (currentValue !== undefined) {
            currentValue = currentValue.value;
          }

          if (currentValue === undefined) {
            currentValue =
              this.rowData[value.id] !== undefined
                ? this.rowData[value.id]
                : '';
          }

          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}
              <View style={styles.view_row}>
                <TextInput
                  key={`rn-${index}`}
                  defaultValue={currentValue}
                  placeholder={'Enter number'}
                  keyboardType={'phone-pad'}
                  style={styles.titleInputStyle}
                  onChangeText={(text) => {
                    this.handleInputValChange(index, text, value);
                  }}
                  value={currentValue}
                />
              </View>
            </View>
          );
          break;
        case INPUT_TYPE.PERCENTAGE:
          currentValue = this.state.inputVal[index];
          if (currentValue !== undefined) {
            currentValue = currentValue.value;
          }

          if (currentValue === undefined) {
            currentValue =
              this.rowData[value.id] !== undefined
                ? this.rowData[value.id]
                : '';
          }

          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}
              <View style={styles.view_row}>
                <TextInput
                  key={`r-${index}`}
                  defaultValue={currentValue}
                  keyboardType={'numeric'}
                  style={styles.titleInputStyle}
                  onChangeText={(text) => {
                    this.handleInputValChange(index, text, value);
                  }}
                  value={currentValue}
                />
              </View>
            </View>
          );
          break;
        case INPUT_TYPE.CURRENCY:
          /*   let currentValue1 = this.state.inputVal[index];
  if (currentValue1 !== undefined) {
    currentValue1 = currentValue1.value;
  } */

          // if (currentValue1 === undefined) {
          let currentValue1 =
            this.rowData[value.id] !== undefined ? this.rowData[value.id] : '';
          // }
          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}
              <View style={styles.view_row}>
                <TextInputMask
                  style={styles.titleInputStyle}
                  type={'money'}
                  options={{
                    precision: 2,
                    separator: ',',
                    delimiter: '.',
                    unit: '$',
                    suffixUnit: '',
                  }}
                  defaultValue={currentValue1}
                  onChangeText={(text) => {
                    this.handleInputValChange(index, text, value);
                  }}
                />
              </View>
            </View>
          );
          break;
        case INPUT_TYPE.CHECK_BOX:
          let checkState = this.state.inputVal[index];
          if (checkState !== undefined) {
            checkState = checkState.value;
          }
          if (checkState === undefined) {
            checkState =
              this.rowData[value.id] !== undefined
                ? this.rowData[value.id]
                : false;
          }
          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}
              <View style={styles.view_row}>
                <CheckBox
                  style={{flex: 1, padding: 10}}
                  checkBoxColor={'blue'}
                  isChecked={checkState}
                  onClick={() => {
                    this.handleInputValChange(index, !checkState, value);
                  }}
                />
              </View>
            </View>
          );

          break;

        case INPUT_TYPE.DATE:
          let date = this.state.inputVal[index];
          if (date !== undefined) {
            date = date.value;
          } else {
            date =
              this.rowData[value.id] !== undefined
                ? this.rowData[value.id]
                : undefined;
          }

          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}
              <View style={styles.view_row}>
                <TouchableOpacity
                  style={styles.titleInputStyle}
                  onPress={() =>
                    setMeetTime.current?.openModal(
                      'starting',
                      date === undefined || date === ''
                        ? new Date()
                        : new Date(date),
                      index,
                    )
                  }>
                  <Text style={{color: date === undefined ? 'grey' : 'black'}}>
                    {date === undefined
                      ? 'Select any date & time'
                      : moment(date).format('ddd, MMM DD, hh:mm A')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          );
          break;

        case INPUT_TYPE.DROP_DOWN:
          let isMulti = value?.multi;
          let multipleValue = [];
          let selected =
            this.rowData[value.id] !== undefined
              ? this.rowData[value.id]
              : isMulti
              ? []
              : undefined;

          const itemsData = value.data.values?.map((item) => {
            /*    if(isMulti &&selected.length>0)
              {
                multipleValue=selected;
               in case if
                for(let i=0;i<selected.length;i++)
                {
                  if(selected[i]===item.id)
                  {
                    multipleValue.push(item.id)
                  }
                }
              
              }else{ */

            if (
              isMulti === false &&
              selected !== undefined &&
              selected === item.id &&
              item.name !== undefined
            ) {
              selected = item.name;
            }
            return {
              id: item.id,
              name: item.name,
              label: item?.name !== undefined ? item?.name : 'Test',
              value:
                item?.name !== undefined
                  ? isMulti
                    ? item.id
                    : item?.name
                  : 'Test',
            };
          });

          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}
              <View style={styles.view_row}>
                <View style={{paddingBottom: 10, minWidth: '100%'}}>
                  <DropDownPicker
                    items={itemsData}
                    containerStyle={{height: 40, flex: 1}}
                    placeholder={'Select'}
                    style={{backgroundColor: '#fafafa'}}
                    itemStyle={{
                      justifyContent: 'flex-start',
                      height: 40,
                    }}
                    multiple={isMulti}
                    defaultValue={selected}
                    dropDownStyle={{
                      backgroundColor: '#fafafa',
                      paddingStart: -10,
                      minHeight: 100,
                      height: '100%',
                    }}
                    onChangeItem={(item) => {
                      this.handleInputValChange(
                        index,
                        isMulti ? item : item.id,
                        value,
                      );
                    }}
                  />
                </View>
              </View>
            </View>
          );
          break;
        case INPUT_TYPE.RATING:
          let defaultRating =
            this.rowData[value.id] !== undefined ? this.rowData[value.id] : 0;
          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}
              <View style={styles.view_row}>
                <Rating
                  startingValue={defaultRating}
                  imageSize={24}
                  onFinishRating={(rating) => {
                    this.handleInputValChange(index, rating, value);
                  }}
                  style={[styles.titleInputStyle, {alignItems: 'flex-start'}]}
                />
              </View>
            </View>
          );

          break;

        case INPUT_TYPE.PROGRESS:
          let progress = this.state.inputVal[index];
          if (progress !== undefined) {
            progress = progress.value;
          } else {
            progress =
              this.rowData[value.id] !== undefined ? this.rowData[value.id] : 0;
          }
          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}

              <View style={styles.ViewBorderStyle}>
                <Text>{value?.config?.min}</Text>
                <Slider
                  value={progress}
                  maximumValue={value?.config?.max}
                  minimumValue={value?.config?.min}
                  step={value?.config?.step}
                  style={{
                    flex: 1,
                    marginHorizontal: 2,
                    justifyContent: 'center',
                  }}
                  animationType="timing"
                  onValueChange={(rating) =>
                    this.handleInputValChange(index, rating, value)
                  }
                  thumbStyle={{
                    height: 40,
                    width: 40,
                    backgroundColor: 'transparent',
                  }}
                  trackStyle={{height: 5, backgroundColor: 'blue'}}
                  minimumTrackTintColor="blue"
                  maximumTrackTintColor="#9AA0A6"
                  thumbStyle={{
                    width: 15,
                    height: 15,
                    backgroundColor: 'blue',
                  }}
                  thumbTouchSize={{
                    width: 20,
                    height: 20,
                  }}
                />
                <Text>{value?.config?.max}</Text>
              </View>
              <Text>Value: {progress}</Text>
            </View>
          );
          break;
        case INPUT_TYPE.PEOPLE:
          let people = this.state.inputVal[index];
          console.log(
            '------sssssss-----people-------------' + JSON.stringify(people),
          );
          if (people !== undefined) {
            people = people.value;
          }

          if (people === undefined) {
            people =
              this.rowData[value.id] !== undefined
                ? this.rowData[value.id]
                : [];
          }
          if (people !== undefined) {
            console.log(
              '-----------people-------------' + JSON.stringify(people),
            );
            people = ContactsDao.getContacts(people);
          }
          return (
            <View style={styles.labelH}>
              {this.rowHeaders(value)}
              <View style={styles.view_row}>
                <TouchableOpacity
                  style={styles.titleInputStyle}
                  onPress={
                    () => this.getContactsData(people, index, value)
                    /* navigate(ROUTE_NAMES.ADD_PARTICIPENTS, {
                      rowItemId:value.id,
                      fromTable: true,
                      participants: people,
                    }) */
                  }>
                  {people !== undefined && people.length > 0 ? (
                    this.avatarViews(people)
                  ) : (
                    <Text style={{color: 'grey'}}>Add People</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          );

          break;
        default:
          return <View style={styles.view_row} />;
      }
    });
  };

  setMeetTime(type, date, index) {
    this.handleInputValChange(index, date, this.columnHeader.columns[index]);
  }

  navigateToChat = () => {
    navigate(ROUTE_NAMES.MESSAGES);
  };

  renderModalView() {
    return (
      <View style={styles.root}>
        <View style={styles.form_v}>
          <View style={styles.formItemsContainer}>
            <ScrollView>
              {this.state.isRender && this.listData(this.columnHeader?.columns)}
            </ScrollView>
            <View>
              <TouchableHighlight
                style={styles.buttonStyleSave}
                underlayColor="rgba(0,0,0,0.1)"
                onPress={this.save}>
                <Text style={{color: 'white'}}>SAVE</Text>
              </TouchableHighlight>
            </View>
          </View>

          <View style={styles.rightView}>
            <TouchableHighlight
              style={styles.buttonStyleV}
              underlayColor="rgba(0,0,0,0.1)"
              onPress={this.navigateToChat}>
              <Icon name="Messages" size={normalize(20)} color={'black'} />
            </TouchableHighlight>
          </View>
        </View>
      </View>
    );
  }
  renderHeader() {
    return <Header {...this.props} title={'Edit'} goBack={true} />;
  }
  render() {
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: '#EFF0F1'}}>
        {this.renderHeader()}
        <View style={styles.container}>
          <DateTimePicker
            ref={setMeetTime}
            setDateTime={(type, date, index) =>
              this.setMeetTime(type, date, index)
            }
          />

          {this.renderModalView()}
        </View>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  slider: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelH: {flexDirection: 'column', marginBottom: normalize(15)},
  root: {flex: 1, backgroundColor: 'white', borderRadius: normalize(5)},
  form_v: {flexDirection: 'row', flex: 1, justifyContent: 'flex-end'},
  style5: {
    flexDirection: 'row',
    zIndex: 2,
  },
  formItemsContainer: {
    flex: 1,
    paddingHorizontal: normalize(15),
    paddingVertical: normalize(5),
    backgroundColor: 'white',
  },
  rightView: {
    borderLeftColor: 'grey',
    borderLeftWidth: 0.5,
    alignItems: 'center',
    paddingHorizontal: normalize(10),

    paddingTop: normalize(10),
  },
  h1: {
    flexDirection: 'row',
    borderBottomColor: 'grey',
    borderBottomWidth: 0.5,
    minHeight: normalize(40),
    padding: normalize(10),
    justifyContent: 'flex-end',
  },
  buttonStyle: {
    width: normalize(35),
    height: normalize(35),
    alignItems: 'center',
    borderColor: 'grey',
    marginStart: normalize(10),
    borderWidth: 0.4,
    borderRadius: 5,
    justifyContent: 'center',
  },
  view_row: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
  },
  view_row_header: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: normalize(5),
  },
  tvHeader: {
    fontSize: normalize(12),
    textTransform: 'uppercase',
    marginStart: normalize(5),
  },
  titleInputStyle: {
    borderWidth: 0.5,
    borderColor: 'grey',
    fontSize: normalize(14),
    borderRadius: 4,
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    minHeight: normalize(40),
    width: '100%',
  },
  ViewBorderStyle: {
    borderWidth: 0.5,
    borderColor: 'grey',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    justifyContent: 'center',

    paddingHorizontal: 15,

    width: '100%',
  },
  buttonStyleV: {
    width: normalize(35),
    height: normalize(35),
    alignItems: 'center',
    borderColor: 'grey',

    borderWidth: 0.4,
    borderRadius: 5,
    justifyContent: 'center',
  },
  buttonStyleSave: {
    height: normalize(40),
    marginBottom: normalize(10),
    marginTop: normalize(10),
    alignItems: 'center',
    borderColor: 'grey',
    backgroundColor: 'blue',
    borderWidth: 0.4,
    borderRadius: 5,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
  },

  activityIndicatorStyle: {
    flex: 1,
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => {
  let {preview} = state;
  return {
    conatactsSelectedBack: preview.conatactsSelectedBack,
  };
};
export default connect(mapStateToProps, {
  getTableDetail,
})(FormTableView);
