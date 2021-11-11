import React from 'react';
import { View } from 'react-native';
import { Text } from '../../../components/KoraText';
import { Icon } from '../../../components/Icon/Icon.js';
import { FlatList } from 'react-native';
import moment from 'moment';
import { format } from 'date-fns';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ParentView from './ParentView';

import { normalize } from '../../../../native/utils/helpers';
import * as Constants from '../../../components/KoraText';

const MAX_COUNT = 3;

class AnnouncementCarouselView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      announcements: [],
      isShowMore: false,
      payload: null,
    };
  }

  // getTempElements = () => {

  //   let str = "{\"elements\":[{\"desc\":\"Test Desc_2\",\"title\":\"TestTitle_2\",\"creator\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\",\"nMedia\":0,\"nComps\":0,\"nViews\":1,\"type\":\"announcement\",\"id\":\"gk-cab0e470-e204-5626-af83-acf502b4f6d1\",\"owner\":{\"_id\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\",\"emailId\":\"challa.sathish@kore.com\",\"icon\":\"profile.png\",\"color\":\"#18e3b7\",\"lN\":\"Challa\",\"fN\":\"Sathish Kumar\",\"id\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\"},\"sharedList\":[{\"id\":\"u-5c460afc-10bd-5b53-850a-24ce12f935b7\",\"_id\":\"u-5c460afc-10bd-5b53-850a-24ce12f935b7\",\"name\":\"Srinivas Vasadi\",\"role\":\"sjsjkskzna\",\"icon\":\"profile.png\",\"color\":\"#30cefb\",\"lN\":\"Vasadi\",\"fN\":\"Srinivas\",\"iId\":3055808}],\"nShares\":1,\"nLikes\":0,\"nComments\":0,\"myPrivilege\":5,\"myActions\":{\"follow\":true,\"privilege\":5},\"sharedOn\":1613390006773,\"isSeedData\":false,\"createdOn\":1613390006772,\"lastMod\":1613390006772,\"offSetTS\":1613390006772,\"sortTime\":1613390006772,\"nFollows\":0,\"nUpVotes\":0,\"nDownVotes\":0,\"score\":1,\"subtitle\":\"Test Desc_2\",\"buttons\":[{\"type\":\"USERINTENT\",\"title\":\"View Details\",\"payload\":\"DEVELOPER_DEFINED_PAYLOAD\",\"action\":\"INFO_VIEW_DETAILS\",\"customData\":{\"id\":\"gk-cab0e470-e204-5626-af83-acf502b4f6d1\"}}],\"default_action\":{\"type\":\"USERINTENT\",\"title\":\"View Details\",\"action\":\"INFO_VIEW_DETAILS\",\"customData\":{\"id\":\"gk-cab0e470-e204-5626-af83-acf502b4f6d1\"}}},{\"desc\":\"Test desc\",\"title\":\"TestTitle\",\"creator\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\",\"nMedia\":0,\"nComps\":0,\"nViews\":1,\"type\":\"announcement\",\"id\":\"gk-1715660a-ccc5-5ed9-8f1f-8284e3b328c7\",\"owner\":{\"_id\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\",\"emailId\":\"challa.sathish@kore.com\",\"icon\":\"profile.png\",\"color\":\"#18e3b7\",\"lN\":\"Challa\",\"fN\":\"Sathish Kumar\",\"id\":\"u-21a5a14c-5893-5e51-8114-5b887b0cb9c7\"},\"sharedList\":[{\"id\":\"u-d885c430-deed-5e05-a22a-386ed182a5b5\",\"_id\":\"u-d885c430-deed-5e05-a22a-386ed182a5b5\",\"name\":\"Ramachandra Pradeep Challa\",\"role\":\"\",\"icon\":\"profile.png\",\"color\":\"#65db75\",\"lN\":\"Challa\",\"fN\":\"Ramachandra Pradeep\",\"iId\":83615952}],\"nShares\":1,\"nLikes\":0,\"nComments\":0,\"myPrivilege\":5,\"myActions\":{\"follow\":true,\"privilege\":5},\"sharedOn\":1613388287319,\"isSeedData\":false,\"createdOn\":1613388287319,\"lastMod\":1613388287319,\"offSetTS\":1613388287319,\"sortTime\":1613388287319,\"nFollows\":0,\"nUpVotes\":0,\"nDownVotes\":0,\"score\":1,\"subtitle\":\"Test desc\",\"buttons\":[{\"type\":\"USERINTENT\",\"title\":\"View Details\",\"payload\":\"DEVELOPER_DEFINED_PAYLOAD\",\"action\":\"INFO_VIEW_DETAILS\",\"customData\":{\"id\":\"gk-1715660a-ccc5-5ed9-8f1f-8284e3b328c7\"}}],\"default_action\":{\"type\":\"USERINTENT\",\"title\":\"View Details\",\"action\":\"INFO_VIEW_DETAILS\",\"customData\":{\"id\":\"gk-1715660a-ccc5-5ed9-8f1f-8284e3b328c7\"}}}]}";

  //   return JSON.parse(str);
  // }

  componentDidMount() {
    const payload = this.props.announcementPayload;
    if (!payload) {
      return;
    }
    this.template_type = this.props.template_type;
    const list = payload.elements; //this.getTempElements().elements;//payload.elements;

    let isShowMore = list && list.length > MAX_COUNT;
    let sortedList = list; //.sort((a, b) => new Date(b.date) - new Date(a.date));
    let data = this.groupData(sortedList);
    // console.log("data ---------------->> :", JSON.stringify(data));
    this.setState({
      isShowMore: isShowMore,
      announcements: data,
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

  getSingleAnnouncementForFlatList = (item) => {
    return this.getSingleAnnouncementView(item.item, item.index);
  };



  //SDKConfiguration.Server.SERVER_URL + "/api" + URL_VERSION + "/getMediaStream/profilePictures/" + userData.getId() + "/profile.jpg"
  getSingleAnnouncementView = (item, index) => {
    // console.log("item ---------> ", item.item.isHeader);
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
                {/* <View style={{ backgroundColor: index % 2 === 0 ? '#e7f2ff' : '#ddffef', width: 45, height: 55, borderRadius: 6, alignItems: 'center', justifyContent: 'center', }}>
                                <View style={{ backgroundColor: index % 2 === 0 ? '#538dff' : '#28ba76', width: 20, height: 25, borderRadius: 3 }}>

                                    
                                </View>
                            </View> */}
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
                    <Icon size={16} name="Comment_Material" color="#a7b0be" />
                    <Text style={{ marginStart: 5, color: "#a7b0be", fontFamily: Constants.fontFamily, }} >{item.nComments}</Text>
                  </View>

                  <View style={{ flexDirection: 'row', marginStart: 50, alignItems: 'center', justifyContent: 'center', }} >
                    <Icon size={16} name="Like_Filled" color="#a7b0be" />
                    <Text style={{ marginStart: 5, color: "#a7b0be", fontFamily: Constants.fontFamily, }} >{item.nLikes}</Text>
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

  renderAnnouncementsView = (list) => {
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
              renderItem={this.getSingleAnnouncementForFlatList}
              keyExtractor={(item) => item.index + ''}
            //stickyHeaderIndices={this.state.stickyHeaderIndices}
            />
            {/* {list.map((item) => {
                            return this.getSingleMeetingView(item)
                        })} */}

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
                    paddingBottom: 10,
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
        {this.renderAnnouncementsView(this.state.announcements)}
      </View>
    );
  }
}

export default AnnouncementCarouselView;
