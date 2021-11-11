import React from 'react';
import {Text, View, StyleSheet, FlatList} from 'react-native';

import * as Constants from '../../components/KoraText';
import {normalize} from '../../utils/helpers';
import {useTranslation, withTranslation} from 'react-i18next';
import {TouchableOpacity} from 'react-native';
import {Icon} from '../../components/Icon/Icon';
class AccountsListView extends React.Component {
  getAvatarName(productName) {
    let name = productName?.toUpperCase().split(' ') || '';
    if (name.length === 1) {
      name = `${name[0].charAt(0)}`;
    } else if (name.length > 1) {
      name = `${name[0].charAt(0)}${name[1].charAt(0)}`;
    } else {
      name = '';
    }
    return name;
  }
  itemPress = (item) => {
    if (this.props.onItemClick) {
      this.props.onItemClick(item);
    }
  };
  renderItem = (props) => {
    const {item} = props;
    console.log(item);
    return (
      <TouchableOpacity
        onPress={() => this.itemPress(item)}
        style={styles.touchStyle}>
        <View style={styles.v1}>
          <View
            style={[
              styles.v2,
              {backgroundColor: item?.logo?.color || '#7027E5'},
            ]}>
            <Text style={styles.avatarText}>
              {this.getAvatarName(item?.name)}
            </Text>
          </View>
          <View style={styles.v3}>
            <View style={styles.v4}>
              <Text numberOfLines={1} style={styles.nameText}>
                {item?.name}
              </Text>
              <View style={styles.starView}>
                <Icon name={'kr-favourite'} size={12} color={'#BDC1C6'} />
              </View>
            </View>
            <Text style={styles.membersText}>{item?.membersCount} members</Text>
          </View>
          <View>
            <Icon name={'Arrow-Next'} size={14} color={'#202124'} />
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  render() {
    return (
      <View>
        <FlatList data={this.props.data || []} renderItem={this.renderItem} />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  starView: {marginTop: 2, justifyContent: 'center'},
  v1: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    padding: 10,
    paddingEnd: 15,
  },
  v2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'green',
    alignItems: 'center',
    justifyContent: 'center',
  },
  v3: {flex: 1, marginStart: normalize(16)},
  v4: {flexDirection: 'row', alignItems: 'center'},
  touchStyle: {
    borderColor: '#E4E5E7',
    backgroundColor: '#F8F9FA',
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 80,
    marginBottom: 10,
  },
  avatarText: {
    color: '#FFFFFF',
    padding: 0,
    alignSelf: 'center',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  nameText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: normalize(16),
    fontStyle: 'normal',
    paddingVertical: 2,
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
    marginEnd: 5,
  },
  membersText: {
    color: '#BDC1C6',
    paddingVertical: 2,
    textAlignVertical: 'center',
    fontWeight: '500',
    fontSize: normalize(14),
    fontStyle: 'normal',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
});
export default withTranslation()(AccountsListView);
