import React from 'react';
import { View, Image } from 'react-native';
import { Text } from '../../../components/KoraText';
import { Icon } from '../../../components/Icon/Icon.js';
import { FlatList } from 'react-native';
import { format } from 'date-fns';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ParentView from './ParentView';

import { normalize } from '../../../utils/helpers';

const MAX_COUNT = 1;

class KoraWelcomeSummaryView extends ParentView {
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
  //   let str = "{\"elements\":[{\"title\":\"Good Evening, Sathish Kumar\",\"message\":\"Light day with brief meetings\",\"weather\":{\"desc\":\"Partly Cloudy\",\"temp\":\"33 \u00b0C\",\"iconId\":\"day_cloud\",\"wId\":\"cloud\",\"location\":{\"name\":\"Kushmanchi\",\"lat\":\"17.217\",\"lon\":\"79.950\",\"region\":\"Andhra Pradesh\",\"country\":\"India\",\"countryCode\":\"IND\"},\"icon\":\"https:\/\/kora.kore.ai\/static\/images\/weather\/day_cloud.png\"},\"actionItems\":[{\"type\":\"postback\",\"iconId\":\"meeting\",\"title\":\"2 meetings today\",\"payload\":\"Show my meetings today\"},{\"type\":\"postback\",\"iconId\":\"upcoming_tasks\",\"title\":\"No tasks due today\"},{\"type\":\"postback\",\"iconId\":\"overdue\",\"title\":\"4 overdue tasks\",\"payload\":\"Show my overdue tasks\"},{\"type\":\"postback\",\"iconId\":\"email\",\"title\":\"1 unread emails in last 24 hours\",\"payload\":\"Show my recent unread emails\"},{\"type\":\"open_form\",\"iconId\":\"form\",\"title\":\"1 notification to act upon\",\"payload\":\"open_bell_notifications\"}]}]}";
  //   return JSON.parse(str);
  // }

  componentDidMount() {
    const payload = this.props.summaryPayload;//this.props.articlesPayload;
    if (!payload) {
      return;
    }
    this.template_type = this.props.template_type;
    const list = payload.elements;

    let isShowMore = list && list.length > MAX_COUNT;
    // let sortedList = list; //.sort((a, b) => new Date(b.date) - new Date(a.date));
    // let data = this.groupData(sortedList);
    // // console.log("data ---------------->> :", JSON.stringify(data));
    this.setState({
      isShowMore: isShowMore,
      articles: list,
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
    const image_url = { uri: item?.weather?.icon || false };//item?.weather?.icon || false;
    //  console.log("image_url ---------> ", image_url);

    return (<View style={{ padding: 5, margin: 5, backgroundColor: 'white' }} >
      <View style={{ flexDirection: 'row' }}>
        <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start', marginEnd: 10, }}>
          <Text style={{ fontSize: 22 }} >{item.title}</Text>
          <Text style={{ marginTop: 5, fontSize: 14 }} >{item.message}</Text>
        </View>

        <View style={{ flexDirection: 'column', alignItems: 'center' }}>
          {image_url &&
            <Image
              source={image_url}
              style={{ height: 80, width: 80, resizeMode: 'stretch', }} />}
          <Text style={{ marginTop: 5, fontSize: 12, textTransform: 'uppercase', fontWeight: 'bold' }} >{item?.weather?.desc}</Text>
        </View>


      </View>

      <View style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>

        {item?.actionItems?.map((action) => {
          // console.log("action?.iconId  ----------------->>> : ", action?.iconId);
          return (
            <TouchableOpacity
              onPress={() => {
                // console.log("Click  ---->:", action?.payload);
                if (action?.payload && this.props.onListItemClick) {

                  // let item = {
                  //   selectionType: 'propose_times',
                  //   payload: 'Propose times',
                  // }
                  this.props.onListItemClick(this.template_type, action);

                }

              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, }}>
                <View
                  style={{

                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 28,
                    width: 28,
                    marginEnd: 5,
                    borderRadius: 30 / 2,
                    backgroundColor: this.getBgColor(action?.iconId),
                    margin: 0,
                  }}>
                  <Icon size={18} name={this.getIcon(action?.iconId)} color="white" />
                </View>
                <Text style={{ marginStart: 10, fontSize: 14 }} >{action?.title}</Text>
              </View>
            </TouchableOpacity>
          );

        })}

      </View>
    </View>


    );
  };



  getIcon = (iconId = '') => {
    switch (iconId) {
      case "meeting":
        return 'MeetingCalendar';
      case "meetingReq":
        return 'MeetingCalendar';
      case "notificationForm":
      case "form":
        return 'notification';
      case "overdue":
        return 'Task';
      case "email":
        return 'Email_Filled';
      case "upcoming_tasks":
        return 'Tasks';
      default:
        return 'Files';

    }
  }

  getBgColor = (iconId = '') => {
    switch (iconId) {
      case "meeting":
        return '#4e74f0';
      case "meetingReq":
        return '#4e74f0';
      case "notificationForm":
      case "form":
        return '#ffab18';
      case "overdue":
        return '#ff5b6a';
      case "email":
        return '#2ad082';
      case "upcoming_tasks":
        return '#ff5b6a';
      default:
        return '#4e74f0';

    }
  }

  renderArticleView = (list) => {
    return (
      // <Text>Sathish</Text>

      <View
        style={{
          backgroundColor: 'white',
          borderWidth: 0.6,

          borderColor: '#00485260',
          borderRadius: 8,
        }}>
        <View style={{ margin: 5, backgroundColor: 'white' }}>

          {/* {list && list.map((item, index) => {
            console.log("index ------>", index);
            return <View style={{ width: 100, height: 100, backgroundColor: 'red' }} >
              <Text>Sathish</Text>
            </View>
          })} */}
          <FlatList
            data={list}
            renderItem={this.getSingleArticleForFlatList}
            keyExtractor={(item) => item.index + ''}
          />

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
    if (this.state.articles && this.state.articles.length > 0) {
      return <View style={{ width: '100%' }}>
        {this.renderArticleView(this.state.articles)}
      </View>
    } else {
      return null;
    }

  }
}

export default KoraWelcomeSummaryView;
