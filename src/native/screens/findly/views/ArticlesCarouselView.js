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

const MAX_COUNT = 1;

class ArticlesCarouselView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      isShowMore: false,
      payload: null,
    };
  }

  // getTempElements = () => {
  //   let str = "{\"elements\":[{\"desc\":\"If you've ever needed to quickly build a large, easy-to-share set of FAQs, you've come to the right place. Here I will explain how I'll help you build knowledge bases by ingesting question-and-answer pairs from PDFs, word documents\",\"title\":\"How to create a Knowledge Collection\",\"creator\":\"u-9ee96e0d-20e8-501f-aaa6-ee8d19154a07\",\"nMedia\":0,\"nComps\":0,\"nViews\":79,\"type\":\"knowledge\",\"hashTag\":[\"welcome\",\"help\",\"knowledge\",\"collection\"],\"imageUrl\":\"\",\"id\":\"gk-7e5ca2b8-d8fc-58b2-ac99-2dd4657be487\",\"owner\":{\"_id\":\"u-9ee96e0d-20e8-501f-aaa6-ee8d19154a07\",\"emailId\":\"kora@kore.com\",\"color\":\"#6168e7\",\"lN\":\"Admin\",\"fN\":\"Kora\",\"id\":\"u-9ee96e0d-20e8-501f-aaa6-ee8d19154a07\"},\"sharedList\":[{\"id\":\"u-47f37949-d0bc-510d-934b-bcff05cf2b6b\",\"_id\":\"u-47f37949-d0bc-510d-934b-bcff05cf2b6b\",\"name\":\"Manasa Majji\",\"role\":\"user\",\"color\":\"#6168e7\",\"lN\":\"Majji\",\"fN\":\"Manasa\",\"iId\":18915480},{\"id\":\"gt-korateam-v001-dont-play-with0this0id\",\"_id\":\"gt-korateam-v001-dont-play-with0this0id\",\"name\":\"Kora\",\"atMention\":\"kora\",\"color\":\"#6168e7\",\"iId\":84955344}],\"nShares\":2,\"nLikes\":0,\"nComments\":0,\"myPrivilege\":0,\"myActions\":{\"privilege\":0},\"sharedOn\":1595916920115,\"isSeedData\":true,\"createdOn\":1595356489817,\"lastMod\":1607001102815,\"offSetTS\":1607001102815,\"sortTime\":1607001102815,\"nFollows\":0,\"nUpVotes\":0,\"nDownVotes\":0,\"score\":1,\"subtitle\":\"If you've ever needed to quickly build a large, easy-to-share set of FAQs, you've come to the right place. Here I will explain how I'll help you build knowledge bases by ingesting question-and-answer pairs from PDFs\",\"buttons\":[{\"type\":\"USERINTENT\",\"title\":\"View Details\",\"payload\":\"DEVELOPER_DEFINED_PAYLOAD\",\"action\":\"INFO_VIEW_DETAILS\",\"customData\":{\"id\":\"gk-7e5ca2b8-d8fc-58b2-ac99-2dd4657be487\"}}],\"default_action\":{\"type\":\"USERINTENT\",\"title\":\"View Details\",\"action\":\"INFO_VIEW_DETAILS\",\"customData\":{\"id\":\"gk-7e5ca2b8-d8fc-58b2-ac99-2dd4657be487\"}}},{\"desc\":\"https:\/\/www.npmjs.com\/package\/react-native-url-preview\",\"title\":\"react-native-url-preview\",\"creator\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\",\"nMedia\":0,\"nComps\":0,\"nViews\":1,\"type\":\"knowledge\",\"imageUrl\":\"https:\/\/static.npmjs.com\/338e4905a2684ca96e08c7780fc68412.png\",\"id\":\"gk-f8ada805-7aaa-529c-8349-cdd1f3e467f1\",\"owner\":{\"_id\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\",\"emailId\":\"challa.sathish@kore.com\",\"icon\":\"profile.png\",\"color\":\"#18e3b7\",\"lN\":\"Challa\",\"fN\":\"Sathish Kumar\",\"id\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\"},\"sharedList\":[{\"id\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\",\"_id\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\",\"name\":\"Sathish Kumar Challa\",\"role\":\"user\",\"icon\":\"profile.png\",\"color\":\"#18e3b7\",\"lN\":\"Challa\",\"fN\":\"Sathish Kumar\",\"iId\":2576576}],\"nShares\":0,\"nLikes\":0,\"nComments\":0,\"myPrivilege\":5,\"myActions\":{\"follow\":true,\"privilege\":5},\"sharedOn\":1606457004090,\"isSeedData\":false,\"createdOn\":1606457004090,\"lastMod\":1606457004090,\"offSetTS\":1606457004090,\"sortTime\":1606457004090,\"nFollows\":0,\"nUpVotes\":0,\"nDownVotes\":0,\"score\":1,\"subtitle\":\"https:\/\/www.npmjs.com\/package\/react-native-url\",\"buttons\":[{\"type\":\"USERINTENT\",\"title\":\"View Details\",\"payload\":\"DEVELOPER_DEFINED_PAYLOAD\",\"action\":\"INFO_VIEW_DETAILS\",\"customData\":{\"id\":\"gk-f8ada805-7aaa-529c-8349-cdd1f3e467f1\"}}],\"default_action\":{\"type\":\"USERINTENT\",\"title\":\"View Details\",\"action\":\"INFO_VIEW_DETAILS\",\"customData\":{\"id\":\"gk-f8ada805-7aaa-529c-8349-cdd1f3e467f1\"}}}]}";
  //   return JSON.parse(str);
  // }

  componentDidMount() {
    const payload = this.props.articlesPayload;//this.props.articlesPayload;
    if (!payload) {
      return;
    }
    this.template_type = this.props.template_type;
    const list = payload.elements;

    let isShowMore = list && list.length > MAX_COUNT;
    let sortedList = list; //.sort((a, b) => new Date(b.date) - new Date(a.date));
    let data = this.groupData(sortedList);
    // console.log("data ---------------->> :", JSON.stringify(data));
    this.setState({
      isShowMore: isShowMore,
      articles: data,
      payload: payload,
    });
  }

  dateToFromNowDaily = (date) => {
    if (!date) {
      return '';
    }
    return format(new Date(date), 'EEE, MMM d, yyyy') + ' at ' + format(new Date(date), 'h:mm a');

  };

  getSingleArticleForFlatList = (item) => {
    return this.getSingleArticleView(item.item, item.index);
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
      <View
        style={{
          backgroundColor: 'white',
          borderWidth: 0.6,
          borderColor: '#00485260',
          borderRadius: 8,
        }}>
        <View style={{ paddingLeft: 10, paddingRight: 10, paddingTop: 10 }}>
          <View style={{ backgroundColor: 'white' }}>
            <FlatList
              data={list}
              renderItem={this.getSingleArticleForFlatList}
              keyExtractor={(item) => item.index + ''}
            />


            {this.state.isShowMore && (
              <TouchableOpacity
                onPress={() => {
                  if (this.props.onViewMoreClick) {
                    this.props.onViewMoreClick(
                      this.template_type,
                      this.state.payload,
                    );
                  }
                }}>
                <View
                  style={{
                    paddingTop: 10,
                    paddingBottom: 5,
                    alignItems: 'center',
                    flexDirection: 'row',
                  }}>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: normalize(14),
                      color: '#767e88',
                      alignSelf: 'flex-start',
                      fontFamily: Constants.fontFamily,
                    }}>
                    View more
                  </Text>

                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: 14,
                      width: 14,
                      margin: 0,
                    }}>
                    <Icon size={16} name="Right_Direction" color="black" />
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  groupData = (data) => {
    let result = [];

    for (let i = 0; i < data.length; i++) {
      if (i === MAX_COUNT) {
        break;
      }
      let obj = data[i];

      obj = {
        index: i,
        ...obj,
      };
      result[i] = obj;
    }
    return result;
  };

  render() {
    return (
      <View style={{ width: '100%' }}>
        {this.renderArticleView(this.state.articles)}
      </View>
    );
  }
}

export default ArticlesCarouselView;
