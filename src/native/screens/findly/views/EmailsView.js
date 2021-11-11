import React from 'react';
import {View, StyleSheet, TouchableOpacity, FlatList} from 'react-native';
import {Text} from '../../../components/KoraText';
import {Icon} from '../../../components/Icon/Icon.js';
import moment from 'moment';
import {format} from 'date-fns';
import ParentView from './ParentView';
import EmailItem from '../singleItem/EmailItem';

import {BORDER} from './TemplateType';
import BotText from '../views/BotText';

const MAX_COUNT = 3;

class EmailsView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      emails: [],
      isShowMore: false,
      emailsCount: 0,
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.emailsPayload;
    this.template_type = this.props.template_type;
    const list = payload.elements[0].emails;
    let count = list.length;
    let isShowMore = list && list.length > 3;
    let sortedList = list; //.sort((a, b) => new Date(b.date) - new Date(a.date));
    let data = this.groupData(sortedList);
    this.setState({
      isShowMore: isShowMore,
      emails: data,
      emailsCount: count,
      payload: payload,
    });
  }

  dateToFromNowDaily = (dateStr) => {
    //Thu, 3 Dec 2020 20:08:33 +0530
    var date = new Date(dateStr).getTime();

    return moment(date).calendar(null, {
      lastWeek: '[Last] dddd',
      lastDay: '[Yesterday]',
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      sameElse: function () {
        return format(new Date(date), 'dd/MM/yyyy'); //new Date(myDate).toLocaleDateString();
      },
    });
  };

  getSingleEmailsViewForFlatList = (item) => {
    return this.getSingleEmailsView(item.item, item.index);
  };

  getSingleEmailsView = (item, index) => {
    // console.log("item ---------> ", item.item.isHeader);
    return (
      <View style={{flexDirection: 'row', marginTop: index === 0 ? 0 : 15}}>
        {/* <View style={{ marginEnd: 5, marginStart: 5, backgroundColor: 'green', opacity: 0.8, width: 3, height: 30, flexDirection: 'row' }}></View> */}
        <View style={styles.email_view}>
          <EmailItem {...this.props} email={item} />
          <View style={styles.item_separator}></View>
        </View>
      </View>
    );
  };

  renderEmailsView = (list) => {
    return (
      <View style={styles.main_container}>
        <View style={styles.sub_container}>
          <FlatList
            data={list}
            renderItem={this.getSingleEmailsViewForFlatList}
            keyExtractor={(item) => item.index + ''}
            //stickyHeaderIndices={this.state.stickyHeaderIndices}
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
              <View style={styles.view_more_view}>
                <Text style={styles.view_more_text}>View more</Text>

                <View style={styles.icon_view}>
                  <Icon size={16} name="Right_Direction" color="black" />
                </View>
              </View>
            </TouchableOpacity>
          )}
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
    return <View>{this.renderEmailsView(this.state.emails)}</View>;
  }
}

const styles = StyleSheet.create({
  icon_view: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 14,
    width: 14,
    margin: 0,
  },
  view_more_text: {
    flex: 1,
    fontSize: BORDER.TEXT_SIZE,
    color: BORDER.TEXT_COLOR,
    alignSelf: 'flex-start',
  },
  view_more_view: {
    paddingTop: 10,
    paddingBottom: 10,
    alignItems: 'center',
    flexDirection: 'row',
  },
  item_separator: {
    marginTop: 15,
    backgroundColor: BORDER.COLOR,
    width: '100%',
    height: BORDER.WIDTH,
    flexDirection: 'row',
  },
  sub_container: {paddingLeft: 10, paddingRight: 10, paddingTop: 10},
  main_container: {
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },
  email_view: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  emailAttachments: {
    marginTop: 15,
    backgroundColor: '#485260',
    width: '100%',
    height: 1,
    opacity: 0.3,
    flexDirection: 'row',
  },
});
export default EmailsView;
