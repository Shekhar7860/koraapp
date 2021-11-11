import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '../../../components/KoraText';
import { FlatList } from 'react-native';
import { format } from 'date-fns';
import moment from 'moment';
import ParentView from './ParentView';




class TaskListPreviewView extends ParentView {
    template_type = '';
    constructor(props) {
        super(props);
        this.state = {
            tasks: [],
            payload: null,
        };
    }

    componentDidMount() {
        const payload = this.props.taskListPreviewPayload;
        this.template_type = this.props.template_type;


        let tasks = payload.elements;


        this.setState({
            tasks: tasks,
            payload: payload,
        });
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
        return this.getSingleTaskView(item.item);
    };



    getSingleTaskView = (item) => {


        const time = format(item.dueDate, 'EEE, MMM d, hh:mm a');

        let name = 'You  ';

        if (!(item.assignee._id === item.owner._id)) {
            name = name + item.assignee.fN + " " + item.assignee.lN;
        }

        return (

            <View style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 10, marginBottom: 10, backgroundColor: 'white', borderWidth: 0.6, borderColor: '#00485260', borderRadius: 8 }}>
                <Text style={{ marginBottom: 5, alignSelf: 'flex-start', color: '#485260', fontSize: 17 }}>{item.title}</Text>

                <Text style={{ marginBottom: 5, marginLeft: 10, alignSelf: 'flex-start', color: '#485260', fontSize: 16 }}>{time}</Text>

                <Text style={{ marginLeft: 10, alignSelf: 'flex-start', color: '#485260', fontSize: 15 }}>{name}</Text>

            </View>

        );

    };



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

    renderTasksView = (item) => {
        const list = item.item.taskData;
        // console.log("list-----------=============------------->>> :", list);
        return (
            <View style={{ margin: 10, backgroundColor: 'white', }}>
                <FlatList
                    data={list}
                    renderItem={this.getSingleTaskViewForFlatList}
                    keyExtractor={item => item.index}
                />
            </View>
        );
    };



    render() {
        return (
            <View>
                {this.state.payload && (
                    <View>
                        <Text style={{ color: '#485260', fontSize: 19, marginStart: 15 }}>
                            {this.state.payload.text}
                        </Text>
                        {this.renderElementsView(this.state.tasks)}
                    </View>
                )}
            </View>
        );
    }
}

export default TaskListPreviewView;
