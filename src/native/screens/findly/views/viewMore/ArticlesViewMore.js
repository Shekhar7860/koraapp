import React from 'react';
import {
    View,
    SafeAreaView,
    Image,
} from 'react-native';
import { Text } from '../../../../components/KoraText';
import { Icon } from '../../../../components/Icon/Icon.js';
import { FlatList } from "react-native";
import { format } from 'date-fns';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ParentView from '../ParentView';

import { normalize } from '../../../../utils/helpers';
import * as Constants from '../../../../components/KoraText';


class ArticlesViewMore extends ParentView {
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
        const payload = route.params.aticlesPayload;
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
        return format(new Date(date), 'EEE, MMM d, yyyy') + ' at ' + format(new Date(date), 'h:mm a');

    };

    getSingleArticleViewForFlatList = (item) => {

        return this.getSingleArticleView(item.item, item.index);
    }


    getSingleArticleView = (item, index) => {
        // console.log("item ---------> ", item.item.isHeader);
        const isShowIcon = item?.imageUrl || false;
        const image_URL = { uri: item?.imageUrl || '' };
        return (
            <View
                key={index}
                style={{ padding: 5, margin: 5 }}>
                <TouchableOpacity
                    onPress={() => {
                        if (this.props.onListItemClick) {
                            this.props.onListItemClick(this.template_type, item);
                        }
                    }}>
                    {/* <Text>{item.fileType}</Text> */}

                    <View style={{ flexDirection: 'column' }}>
                        <View style={{ flexDirection: 'row' }}>
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: 'white',
                                    flexDirection: 'column',
                                }}>
                                <Text
                                    numberOfLines={1}
                                    style={{ flex: 1, fontWeight: '500', fontSize: normalize(19), color: '#161620', fontFamily: Constants.fontFamily, }}>
                                    {item.title}
                                </Text>
                                <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                                    <Text style={{ fontSize: normalize(12), color: '#a7b0be', fontFamily: Constants.fontFamily, }}>
                                        Modified {this.dateToFromNowDaily(item.lastMod)}
                                    </Text>
                                </View>
                                <View style={{ alignItems: 'center', flexDirection: 'row', marginTop: 5 }}>
                                    <Text numberOfLines={2} style={{ fontSize: normalize(15), color: '#161620', fontFamily: Constants.fontFamily, }}>
                                        {item.desc}
                                    </Text>
                                </View>

                                <View style={{ flexDirection: 'row', marginTop: 6, alignItems: 'center', height: 30 }} >

                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', }} >
                                        <Icon size={18} name="See" color="#A7A9BE" />
                                        <Text style={{ marginStart: 10, color: "#A7A9BE" }} >{item.nViews}</Text>
                                    </View>
                                </View>
                            </View>

                            {isShowIcon &&
                                <Image
                                    source={image_URL}
                                    style={{ height: 45, width: 60, resizeMode: 'stretch', margin: 5, alignSelf: 'flex-start', alignItems: 'flex-start' }} />
                            }

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




    renderArticleView = (list) => {

        return (
            <View style={{ backgroundColor: 'white', borderWidth: 0.6, borderColor: '#00485260', borderRadius: 0 }}>
                <View style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10, }}>

                    <View style={{ backgroundColor: 'white' }}>

                        <FlatList
                            data={list}
                            renderItem={this.getSingleArticleViewForFlatList}
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
                {this.renderArticleView(this.state.elements)}
            </SafeAreaView>
        )
    };
}

export default ArticlesViewMore;
