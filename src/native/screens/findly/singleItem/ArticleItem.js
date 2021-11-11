import React from 'react';
import { View, Image } from 'react-native';
import { Text } from '../../../components/KoraText';
import { Icon } from '../../../components/Icon/Icon.js';
import { FlatList } from 'react-native';
import { format } from 'date-fns';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ParentView from './ParentView';

import { normalize } from '../../../utils/helpers';
import * as Constants from '../../../components/KoraText';
import { TemplateType } from '../views/TemplateType';


class ArticleItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            article: null,
        };
    }

    dateToFromNowDaily = (date) => {
        if (!date) {
            return '';
        }
        return format(new Date(date), 'EEE, MMM d, yyyy') + ' at ' + format(new Date(date), 'h:mm a');

    };

    getSingleArticleView = (item, index) => {
        // console.log("item ---------> ", item.item.isHeader);
        const isShowIcon = item?.imageUrl || false;
        const image_URL = { uri: item?.imageUrl || '' };
        return (
            <View style={{ padding: 5, margin: 5 }}>
                <TouchableOpacity
                    onPress={() => {
                        if (this.props.onListItemClick) {
                            this.props.onListItemClick(TemplateType.ARTICLES_KORA_CAROUSEL, item);
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


    render() {
        return (
            <View>
                {this.state?.email && this.getSingleArticleView(this.state.email)}
            </View>
        );
    }

}

export default ArticleItem;