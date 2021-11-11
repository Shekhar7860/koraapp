import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../../../components/KoraText';
import {Icon} from '../../../components/Icon/Icon.js';
import moment from 'moment';
import {format} from 'date-fns';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {TemplateType} from '../views/TemplateType';

import {BORDER} from '../views/TemplateType';
import {normalize} from '../../../utils/helpers';

class EmailItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: null,
    };
  }

  componentDidMount() {
    const email = this.props.email;

    this.setState({
      email: email,
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

  getSingleEmailsView = (item) => {
    // console.log("item ---------> ", item.item.isHeader);
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.props.onListItemClick) {
            this.props.onListItemClick(TemplateType.KORA_SEARCH_CAROUSEL, item);
          }
        }}>
        <View style={styles.main_container}>
          {/* <View style={{ marginEnd: 5, marginStart: 5, backgroundColor: 'green', opacity: 0.8, width: 3, height: 30, flexDirection: 'row' }}></View> */}
          <View style={styles.sub_container}>
            <View style={styles.sub_container_1}>
              <Text numberOfLines={1} style={styles.subject}>
                {item.subject}
              </Text>
              <Text numberOfLines={1} style={styles.date}>
                {this.dateToFromNowDaily(item.date)}
              </Text>
            </View>

            <View style={styles.container_from}>
              <Text numberOfLines={2} style={styles.from_text}>
                {item.from}
              </Text>

              {item.attachments && item.attachments.length >= 1 && (
                <View style={styles.attachement_view}>
                  <Icon size={16} name="Attachment" color="#a7b0be" />
                </View>
              )}
            </View>

            <View style={styles.container_desc}>
              <Text numberOfLines={1} style={styles.desc_text}>
                {item.desc ? item.desc : '(No Body)'}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <View>
        {this.state?.email && this.getSingleEmailsView(this.state.email)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  desc_text: {fontSize: normalize(13), color: BORDER.TEXT_COLOR},
  container_desc: {alignItems: 'center', flexDirection: 'row'},
  attachement_view: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
    margin: 0,
  },
  from_text: {
    flex: 1,
    fontSize: BORDER.TEXT_SIZE,
    color: '#485260',
    alignSelf: 'flex-start',
  },
  container_from: {alignItems: 'center', flexDirection: 'row'},
  date: {
    fontSize: normalize(13),
    color: '#a7b0be',
    alignSelf: 'flex-start',
  },
  subject: {
    flex: 1,
    fontWeight: '500',
    fontSize: BORDER.TEXT_SIZE,
    color: '#485260',
    alignSelf: 'flex-start',
    marginEnd: 15,
  },
  sub_container_1: {alignItems: 'center', flexDirection: 'row'},
  main_container: {flexDirection: 'row', marginBottom: 10, marginTop: 5},
  sub_container: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
});

export default EmailItem;
