import React from 'react';
import {
    View,
    SafeAreaView,
} from 'react-native';
import { Text } from '../../../../components/KoraText';
import { Icon } from '../../../../components/Icon/Icon.js';
import { FlatList } from "react-native";
import moment from 'moment';
import { format } from 'date-fns';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ParentView from '../ParentView';

import { normalize } from '../../../../utils/helpers';
import * as Constants from '../../../../components/KoraText';


class AnnouncementViewMore extends ParentView {
    template_type = '';
    onListItemClick = null;
    callGoBack = null;
    constructor(props) {
        super(props);
        this.state = {
            elements: [],
            payload: null,
        }
    }

    componentDidMount() {
        const { route } = this.props;
        const payload = route.params.announcementsPayload;
        this.template_type = route.params.template_type;
        const data = payload.elements;

        this.onListItemClick = route.params.onListItemClick;
        this.callGoBack = route.params.callGoBack;
        // let sortedList = list;//.sort((a, b) => new Date(b.date) - new Date(a.date));
        //let data = this.groupData(sortedList);
        this.setState({
            elements: data,
            payload: payload,
        });
    }

    dateToFromNowDaily = (date) => {
        if (!date) {
            return '';
        }

        return moment(date).calendar(null, {
            lastWeek: '[Last] dddd',
            lastDay: '[Yesterday]',
            sameDay: 'h:mm a',//[Today] 
            nextDay: '[Tomorrow]',
            nextWeek: 'dddd',
            sameElse: function () {
                return format(new Date(date), 'dd/MM/yyyy h:mm a'); //new Date(myDate).toLocaleDateString();
            },
        });
    };

    getSingleAnnouncementFlatList = (item) => {

        return this.getSingleAnnouncementView(item.item, item.index);
    }

    getSingleAnnouncementView = (item, index) => {
        // console.log("item ---------> ", item.item.isHeader);
        return (
            <View style={{ padding: 5, margin: 5 }}>
                <TouchableOpacity
                    onPress={() => {
                        if (this.onListItemClick) {
                            this.onListItemClick(this.template_type, item);
                        }
                    }}>
                    {/* <Text>{item.fileType}</Text> */}

                    <View style={{ flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View
                                style={{
                                    backgroundColor: 'white',
                                    width: 60,
                                    height: 60,
                                    flexDirection: 'column',
                                    alignItems: 'flex-start',
                                    paddingEnd: 5,
                                    borderRadius: 10,
                                    alignContent: 'flex-start',
                                    justifyContent: 'flex-start',
                                }}>
                                <Icon size={40} name="GroupIcon" color="black" />

                            </View>

                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: 'white',
                                    flexDirection: 'column',
                                }}>
                                <View style={{ flexDirection: 'row' }}>
                                    <Text
                                        numberOfLines={1}
                                        style={{ flex: 1, fontWeight: '500', fontSize: normalize(16), color: '#485260', fontFamily: Constants.fontFamily, }}>
                                        {item.owner?.fN} {item.owner?.lN}
                                    </Text>
                                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                        <Text style={{ fontSize: normalize(14), color: '#a7b0be', fontFamily: Constants.fontFamily, }}>
                                            {this.dateToFromNowDaily(item.lastMod)}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                    <Text style={{ fontSize: normalize(14), color: '#a7b0be', fontFamily: Constants.fontFamily, }}>
                                        {item.sharedList[0]?.name}
                                    </Text>
                                </View>

                                <View style={{ alignItems: 'center', flexDirection: 'row', marginTop: 8 }}>
                                    <Text style={{ fontSize: normalize(14), color: '#485260', fontFamily: Constants.fontFamily, }}>
                                        {item.title}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                    <Text style={{ fontSize: normalize(14), color: '#485260', fontFamily: Constants.fontFamily, }}>
                                        {item.desc}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center', height: 30 }} >

                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }} >
                                        <Icon size={16} name="Comment_Icon" color="#a7b0be" />
                                        <Text style={{ marginStart: 5, color: "#a7b0be" }} >{item.nComments}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', marginStart: 50, alignItems: 'center', justifyContent: 'center', }} >
                                        <Icon size={16} name="like" color="#a7b0be" />
                                        <Text style={{ marginStart: 5, color: "#a7b0be" }} >{item.nLikes}</Text>
                                    </View>
                                </View>

                            </View>
                        </View>
                        <View
                            style={{
                                marginTop: 15,
                                marginBottom: 0,
                                backgroundColor: '#485260',
                                width: '100%',
                                height: 1,
                                opacity: 0.3,
                                flexDirection: 'row',
                            }}>

                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };



    renderAnnouncementView = (list) => {

        return (
            <View style={{ backgroundColor: 'white', borderWidth: 0.6, borderColor: '#00485260', borderRadius: 0 }}>
                <View style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10, }}>

                    <View style={{ backgroundColor: 'white' }}>

                        <FlatList
                            data={list}
                            renderItem={this.getSingleAnnouncementFlatList}
                            keyExtractor={item => item.index + ""}
                        />
                    </View>
                </View>
            </View>
        );
    }

    render() {
        return (
            <SafeAreaView
                style={{ flex: 1, flexDirection: 'column', backgroundColor: 'white' }}>
                {this.renderAnnouncementView(this.state.elements)}
            </SafeAreaView>
        )
    };
}

export default AnnouncementViewMore;
