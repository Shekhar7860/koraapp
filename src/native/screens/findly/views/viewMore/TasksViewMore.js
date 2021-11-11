import React from 'react';
import {
  View,
  TouchableOpacity,
  TouchableWithoutFeedback,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {Text} from '../../../../components/KoraText';
import {Icon} from '../../../../components/Icon/Icon.js';
import {FlatList} from 'react-native';
import {format} from 'date-fns';
import ParentView from '../ParentView';
import {EMITTER_TYPES} from '../TemplateType';
import CheckBox from '@react-native-community/checkbox';
import VectorIcon from 'react-native-vector-icons/Ionicons';

class TasksViewMore extends ParentView {
  template_type = '';
  selectedTasks = []; //colors.includes("red");
  navigation = null;
  selectedTaskObjs = [];
  onListItemClick = null;
  callGoBack = null;
  constructor(props) {
    super(props);
    this.state = {
      payload: null,
      isLongPress: false,
      refresh: false,
      taskData: [],
      buttons: [],
      task: [],
    };
  }

  componentDidMount() {
    const {route} = this.props;
    const {navigation} = this.props;
    this.navigation = navigation;
    const payload = route.params.tasksPayload;
    this.template_type = route.params.template_type;

    this.onListItemClick = route.params.onListItemClick;
    this.callGoBack = route.params.callGoBack;

    // payload.elements[0].taskData = this.getDummyList();
    let list = payload.elements[0].taskData;
    let tasks = payload.elements;
    let buttons = payload.elements[0].buttons;
    let taskData = list.sort(
      (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    );

    //  console.log("payload =========> : ", JSON.stringify(payload));

    this.setState({
      payload: payload,
      taskData: taskData,
      buttons: buttons,
      tasks: tasks,
    });

    if (this.props.emitter) {
      this.props.emitter.addListener(EMITTER_TYPES.RESET_ALL, () => {
        //console.log("========== Listener called ============= ", uttrences);
        this.selectedTasks = [];
        this.selectedTaskObjs = [];

        this.setState({
          refresh: !this.state.refresh,
        });
      });
    }
  }

  getDummyList = () => {
    let list = [];
    for (let i = 0; i <= 4; i++) {
      let obj = {
        assignee: {
          _id: 'u-e3001a4b-1632-5cae-b8c8-62dc40c97f6b',
          fN: 'Sathish Kumar',
          lN: 'Challa',
        },
        dueDate: 1604673000000,
        id: 'kt-146ef9df-4472-546d-891a-a699b7426e9e-' + i,
        owner: {
          _id: 'u-e3001a4b-1632-5cae-b8c8-62dc40c97f6b',
          fN: 'Sathish Kumar',
          lN: 'Challa',
        },
        status: 'Open',
        title: 'testTask_' + i,
      };
      list[i] = obj;
    }
    return list;
  };

  // dateToFromNowDaily = (myDate) => {
  //     // var fromNow = moment(myDate).fromNow();

  //     return moment(myDate).calendar(null, {
  //         lastWeek: '[Last] ddd, MMM yy, hh:mm a',
  //         lastDay: '[Yesterday] hh:mm a',
  //         sameDay: '[Today] hh:mm a',
  //         nextDay: '[Tomorrow] hh:mm a',
  //         nextWeek: 'ddd, MMM yy, hh:mm a',
  //         sameElse: function () {
  //             return format(myDate, 'EEE, MMM yy, hh:mm a');//new Date(myDate).toLocaleDateString();
  //         },
  //     });
  // };

  getSingleTaskViewForFlatList = (item) => {
    return this.getSingleTaskView(item.item, item.index, item.item.buttons);
  };

  getSingleTaskView = (item, index, buttons) => {
    const _obj = this;

    const time = format(item.dueDate, 'EEE, MMM d, hh:mm a');

    let name = 'You  ';

    if (!(item.assignee._id === item.owner._id)) {
      name = name + item.assignee.fN + ' ' + item.assignee.lN;
    }

    let isClosed = 'close' === item.status.toLowerCase();

    return (
      <TouchableWithoutFeedback
        disabled={this.isViewDisabled() || isClosed}
        onLongPress={() => {
          _obj.setState({
            isLongPress: !_obj.state.isLongPress,
          });
          this.selectOrDiselectItem(item);
        }}
        onPress={() => {
          if (this.selectedTasks.length > 0) {
            this.selectOrDiselectItem(item);
          }
        }}>
        <View
          style={{
            borderTopWidth: 0.4,
            borderColor: '#00485260',
            borderTopEndRadius: 3,
            borderTopStartRadius: 3,
            opacity: isClosed ? 0.4 : 1.0,
          }}>
          <View
            style={{
              margin: 5,
              flexDirection: 'row',
              borderRadius: 8,
              backgroundColor: this.selectedTasks.includes(item.id)
                ? '#DDDDDD'
                : 'white',
            }}>
            {this.selectedTasks.length > 0 && (
              <View
                style={{
                  alignSelf: 'center',
                  alignItems: 'center',
                  width: 50,
                  height: 50,
                }}>
                <CheckBox
                  value={this.selectedTasks.includes(item.id) ? true : false}
                  onValueChange={() => {}}
                  style={{alignSelf: 'center'}}
                />
              </View>
            )}

            <View
              style={{
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: 10,
                marginBottom: 2,
              }}>
              <Text
                style={{
                  alignSelf: 'flex-start',
                  color: '#485260',
                  fontSize: 17,
                  textDecorationLine: isClosed ? 'line-through' : 'none',
                }}>
                {item.title}
              </Text>

              <View style={{alignItems: 'center', flexDirection: 'row'}}>
                <Text
                  style={{
                    alignSelf: 'center',
                    marginBottom: 0,
                    marginLeft: 10,
                    color: this.isOverDue(item.status, item.dueDate)
                      ? 'red'
                      : '#485260',
                    fontSize: 16,
                  }}>
                  {time}
                </Text>
              </View>
              <Text
                style={{
                  marginLeft: 10,
                  alignSelf: 'flex-start',
                  color: '#485260',
                  fontSize: 15,
                }}>
                {name}
              </Text>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  };

  isOverDue(status, dueDate) {
    let isOverdue =
      'open' === status.toLowerCase() && new Date().getTime() > dueDate;
    return isOverdue;
  }

  selectOrDiselectItem = (item) => {
    const index = this.selectedTasks.indexOf(item.id);
    if (index >= 0) {
      this.selectedTaskObjs = this.selectedTaskObjs.map((obj) => {
        return obj.id !== item.id;
      });
      this.removeItem(index);
    } else {
      this.selectedTasks.push(item.id);
      this.selectedTaskObjs.push(item);
    }

    this.setState({
      refresh: !this.state.refresh,
    });
    this.headerMode(
      this.selectedTasks.length > 0 ? 1 : 0,
      this.selectedTasks.length + ' items selected',
    );
  };

  removeItem(index) {
    if (index !== -1) {
      var array = [...this.selectedTasks]; // make a separate copy of the array
      array.splice(index, 1);
      this.selectedTasks = array;
    }
  }

  renderElementsView = (list) => {
    return (
      <View style={{margin: 10, backgroundColor: 'white'}}>
        <FlatList
          data={list}
          renderItem={this.renderTasksView}
          keyExtractor={(item) => item.index}
        />
      </View>
    );
  };

  renderTasksView = (list) => {
    // let list = item.item.taskData;

    console.log(
      'this.selectedTasks-----------=============------------->>> :',
      this.selectedTasks,
    );
    return (
      <View
        style={{
          flexDirection: 'column',
          marginStart: 4,
          marginEnd: 4,
          marginTop: 4,
          marginBottom: this.selectedTasks.length == 0 ? 4 : 70,
          backgroundColor: 'white',
          borderWidth: 0.6,
          borderColor: '#00485260',
          borderRadius: 4,
        }}>
        <FlatList
          data={list}
          renderItem={this.getSingleTaskViewForFlatList}
          keyExtractor={(item) => item.index}
          extraData={this.state.refresh}
        />
      </View>
    );
  };

  setKoraHeader() {
    if (!this.navigation) {
      return;
    }
    const navigation = this.navigation;
    navigation.setOptions({
      title: '',
      titleColor: '',

      headerLeft: () => (
        <VectorIcon
          style={{paddingLeft: 10}}
          color="#292929"
          name="md-chevron-back-sharp"
          onPress={() => navigation.goBack()}
          size={30}
        />
      ),

      headerRight: () => <View style={{flexDirection: 'row'}}></View>,

      headerStyle: {
        backgroundColor: 'white',
      },
      color: 'red',
      headerTintColor: 'black',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerTitleAlign: 'left',
    });
  }

  setMultiSelectHeader(message) {
    if (!this.navigation) {
      return;
    }
    const navigation = this.navigation;
    navigation.setOptions({
      title: '',
      titleColor: 'red',

      headerLeft: () => (
        <View style={{flexDirection: 'row'}}>
          <TouchableOpacity
            style={{padding: 5}}
            onPress={() => {
              this.headerMode(0);
            }}>
            <View style={{flex: 1, justifyContent: 'center', marginStart: 10}}>
              <Icon name={'Close'} size={24} color="white" />
            </View>
          </TouchableOpacity>

          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                marginStart: 10,
                backgroundColor: '#00000',
              }}>
              <Text
                style={{
                  fontStyle: 'normal',
                  fontWeight: 'normal',
                  fontSize: 18,
                  flexWrap: 'wrap',
                  color: 'white',
                  fontFamily: 'Inter',
                }}>
                {message}
              </Text>
            </View>
          </View>
        </View>
      ),

      headerRight: () => <View style={{flexDirection: 'row'}}></View>,

      headerStyle: {
        backgroundColor: '#FF5A6A',
      },
      color: 'red',
      headerTintColor: 'black',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerTitleAlign: 'left',
    });
  }

  headerMode = (mode, message = '') => {
    // console.log("buttons ---> ", buttons);
    switch (mode) {
      case 0:
        this.setKoraHeader();
        this.setState({});
        // if (this._emitter) {
        //   this._emitter.emit(EMITTER_TYPES.RESET_ALL);
        // }
        this.selectedTasks = [];

        this.setState({
          isShowBottomView: false,
          // refresh: !this.state.refresh,
        });
        break;
      case 1:
        this.setMultiSelectHeader(message);
        this.setState({
          isShowBottomView: true,
        });
        break;
    }
  };

  renderBottomButtons = () => {
    return (
      <View style={styles.viewMoreStyle}>
        {this.state.buttons.map((button) => {
          return (
            <TouchableOpacity
              style={{
                marginLeft: 12,
                marginBottom: 3,
                marginTop: 3,
                justifyContent: 'flex-start',
                flexDirection: 'row',
                backgroundColor: '#FF5A6A',
                borderRadius: 5,
              }}
              onPress={() => {
                // console.log("Clicked item : ");

                if (this.onListItemClick) {
                  let payload = {
                    button: button,
                    taskList: this.selectedTaskObjs,
                    template_type: this.template_type,
                    tids: this.selectedTasks,
                  };
                  this.onListItemClick(this.template_type, payload);
                }

                if (this.callGoBack) {
                  this.callGoBack();
                }
              }}>
              <Text
                style={{
                  fontStyle: 'normal',
                  fontWeight: '300',
                  fontSize: 14,

                  marginBottom: 3,
                  marginTop: 5,
                  flexWrap: 'wrap',
                  marginLeft: 0,
                  padding: 7,

                  color: 'white',
                  fontFamily: 'Inter',
                }}>
                {button.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  render() {
    if (this.selectedTasks.length == 0 && this.state.isLongPress) {
      this.setState({
        isLongPress: false,
      });
      this.headerMode(0);
    }
    return (
      <SafeAreaView
        style={{flex: 1, flexDirection: 'column', backgroundColor: 'white'}}>
        {this.state.payload && this.renderTasksView(this.state.taskData)}
        {this.state.isShowBottomView && this.renderBottomButtons()}
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  viewMoreStyle: {
    height: 60,
    width: '100%',
    backgroundColor: 'white',
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
});

export default TasksViewMore;
