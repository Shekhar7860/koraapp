import React from 'react';
import {
  View,
  SafeAreaView,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import moment from 'moment';
import {format} from 'date-fns';
import ParentView from '../ParentView';
import EmailItem from '../../singleItem/EmailItem';

import {BORDER} from '../../views/TemplateType';
import {normalize} from '../../../../utils/helpers';

class EmailsViewMore extends ParentView {
  template_type = '';
  onListItemClick = null;
  callGoBack = null;
  constructor(props) {
    super(props);
    this.state = {
      emails: [],
      // payload: null,
    };
  }

  componentDidMount() {
    const {route} = this.props;
    const payload = route.params.emailsPayload;
    this.template_type = route.params.template_type;
    const data = payload.elements[0].emails;

    this.onListItemClick = route.params.onListItemClick;
    this.callGoBack = route.params.callGoBack;
    // let sortedList = list;//.sort((a, b) => new Date(b.date) - new Date(a.date));
    //let data = this.groupData(sortedList);
    this.setState({
      emails: data,
      // payload: payload,
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
    return (
      <TouchableOpacity
        key={index}
        //  keyExtractor={item?.msgId}
        onPress={() => {
          if (this.onListItemClick) {
            this.onListItemClick(this.template_type, item);
          }
        }}>
        <View style={{flexDirection: 'row', marginTop: index === 0 ? 0 : 15}}>
          <View style={styles.item_container}>
            <EmailItem {...this.props} email={item} />
            <View style={styles.viewMoreStyle}></View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  renderEmailsView = (list) => {
    return (
      <View style={styles.email_container}>
        <View style={styles.emails_sub_container}>
          <FlatList
            data={list}
            renderItem={this.getSingleEmailsViewForFlatList}
            keyExtractor={(item) => item.index + ''}
          />
        </View>
      </View>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.main_container}>
        {this.renderEmailsView(this.state.emails)}
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  item_container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  emails_sub_container: {paddingLeft: 10, paddingRight: 10, paddingTop: 10},
  email_container: {
    backgroundColor: 'white',
  },
  main_container: {flex: 1, flexDirection: 'column', backgroundColor: 'white'},
  viewMoreStyle: {
    marginTop: 15,
    backgroundColor: BORDER.COLOR,
    width: '100%',
    height: BORDER.WIDTH,
    flexDirection: 'row',
  },
});
export default EmailsViewMore;
