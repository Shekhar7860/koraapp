import React from 'react';
import { View, TouchableOpacity, Header } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { Text } from '../../../components/KoraText';
import { FlatList } from 'react-native';
import { format } from 'date-fns';
import moment from 'moment';
import ParentView from './ParentView';
import { TouchableWithoutFeedback } from 'react-native';
import { EMITTER_TYPES } from "./TemplateType";
import { Icon } from '../../../components/Icon/Icon.js';



class TaskListFullPreviewView extends ParentView {
    template_type = '';
    selectedTasks = [];//colors.includes("red");
    selectedTaskObjs = [];
    constructor(props) {
        super(props);
        this.state = {
            payload: null,
            isLongPress: false,
            refresh: false,
            taskData: [],
            buttons: [],
            task: [],
            isShowMore: false,
        };
    }

    componentDidMount() {
        const payload = this.props.taskListFullPreviewPayload;
        this.template_type = this.props.template_type;

        //payload.elements[0].taskData = this.getDummyList();
        let list = payload.elements[0].taskData;
        let tasks = payload.elements;
        let buttons = payload.elements[0].buttons;
        let sortedList = list.sort(
            (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
        );

        let taskData = [];
        if (sortedList && sortedList.length > 3) {
            for (let i = 0; i < 3; i++) {
                taskData[i] = sortedList[i];
            }
        } else {
            taskData = sortedList;
        }





        this.setState({
            payload: payload,
            taskData: taskData,
            buttons: buttons,
            tasks: tasks,
            isShowMore: sortedList.length > 3,
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
        for (let i = 0; i <= 20; i++) {

            let obj = {
                "assignee": { "_id": "u-e3001a4b-1632-5cae-b8c8-62dc40c97f6b", "fN": "Sathish Kumar", "lN": "Challa" },
                "dueDate": 1604673000000,
                "id": "kt-146ef9df-4472-546d-891a-a699b7426e9e-" + i,
                "owner": { "_id": "u-e3001a4b-1632-5cae-b8c8-62dc40c97f6b", "fN": "Sathish Kumar", "lN": "Challa" },
                "status": "Open",
                "title": "testTask_" + i
            };
            list[i] = obj;
        }
        return list;
    }



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
            name = name + item.assignee.fN + " " + item.assignee.lN;
        }

        let isClosed = "close" === item.status.toLowerCase();

        return (
            <TouchableWithoutFeedback
                disabled={this.isViewDisabled() || isClosed}

                onLongPress={() => {
                    _obj.setState({
                        isLongPress: !_obj.state.isLongPress,
                    });
                    this.selectOrDiselectItem(item);
                }
                }

                onPress={() => {
                    if (this.selectedTasks.length > 0) {
                        this.selectOrDiselectItem(item);
                    }
                }
                }
            >
                <View style={{ borderTopWidth: 0.4, borderColor: '#00485260', borderTopEndRadius: 3, borderTopStartRadius: 3, opacity: isClosed ? 0.4 : 1.0 }} >
                    <View style={{ margin: 5, flexDirection: 'row', borderRadius: 8, backgroundColor: this.selectedTasks.includes(item.id) ? '#DDDDDD' : 'white' }}>

                        {this.selectedTasks.length > 0 &&
                            <View style={{ alignSelf: 'center', alignItems: 'center', width: 50, height: 50 }}>
                                <CheckBox
                                    value={this.selectedTasks.includes(item.id) ? true : false}
                                    onValueChange={() => { }}
                                    style={{ alignSelf: 'center', }}
                                />
                            </View>
                        }

                        <View style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 10, marginBottom: 2, }}>
                            <Text style={{ alignSelf: 'flex-start', color: '#485260', fontSize: 17, textDecorationLine: isClosed ? 'line-through' : 'none' }}>{item.title}</Text>

                            <View style={{ alignItems: 'center', flexDirection: 'row' }}>

                                <Text style={{ alignSelf: 'center', marginBottom: 0, marginLeft: 10, color: this.isOverDue(item.status, item.dueDate) ? 'red' : '#485260', fontSize: 16 }}>{time}</Text>
                            </View>
                            <Text style={{ marginLeft: 10, alignSelf: 'flex-start', color: '#485260', fontSize: 15 }}>{name}</Text>

                        </View>

                    </View>
                </View>
            </TouchableWithoutFeedback>
        );

    };

    isOverDue(status, dueDate) {
        let isOverdue = "open" === status.toLowerCase() && new Date().getTime() > dueDate;
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
        if (this.props.headerMode) {
            this.props.headerMode(this.selectedTasks.length > 0 ? 1 : 0, this.selectedTasks.length + " items selected", this.state.buttons, this.selectedTaskObjs, this.selectedTasks);
        }
    }

    removeItem(index) {
        if (index !== -1) {
            var array = [...this.selectedTasks]; // make a separate copy of the array
            array.splice(index, 1);
            this.selectedTasks = array;
        }
    }



    renderElementsView = (list) => {
        return (
            <View style={{ margin: 10, backgroundColor: 'white', }}>
                <FlatList
                    data={list}
                    renderItem={this.renderTasksView}
                    keyExtractor={item => item.index}
                />
            </View>
        );
    };

    renderTasksView = (list) => {
        return (
            <View style={{ flexDirection: 'column', margin: 10, backgroundColor: 'white', borderWidth: 0.6, borderColor: '#00485260', borderRadius: 8 }}>
                <FlatList
                    data={list}
                    renderItem={this.getSingleTaskViewForFlatList}
                    keyExtractor={item => item.index}
                    extraData={this.state.refresh}
                />
                {this.state.isShowMore && (
                    <View style={{ borderTopWidth: 0.6, borderColor: '#00485260', borderTopEndRadius: 3, borderTopStartRadius: 3 }} >
                        <TouchableOpacity
                            disabled={this.isViewDisabled()}
                            style={{ padding: 5 }}
                            onPress={() => {
                                if (this.props.onViewMoreClick) {
                                    this.props.onViewMoreClick(
                                        this.template_type,
                                        this.state.payload,
                                    );
                                }
                            }}>
                            <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                <Text
                                    style={{
                                        flex: 1,
                                        fontSize: 14,
                                        color: '#767e88',
                                        alignSelf: 'flex-start',
                                    }}>
                                    View more
              </Text>
                                <View
                                    style={{
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        height: 24,
                                        width: 24,
                                        margin: 0,
                                    }}>
                                    <Icon size={16} name="Right_Direction" color="black" />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

            </View>
        );
    };



    render() {
        if (this.selectedTasks.length == 0 && this.state.isLongPress) {
            this.setState({
                isLongPress: false,
            });
            if (this.props.headerMode) {
                this.props.headerMode(0);
            }

        }
        return (
            <View>
                {this.state.payload && (
                    <View>
                        <Text style={{ color: '#485260', fontSize: 19, marginStart: 15 }}>
                            {this.state.payload.text}
                        </Text>
                        {/* {this.renderElementsView(this.state.tasks)} */}
                        {this.renderTasksView(this.state.taskData)}
                    </View>
                )}
            </View>
        );
    }
}

export default TaskListFullPreviewView;
