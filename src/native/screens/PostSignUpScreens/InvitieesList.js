import React, {Component} from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  Text,
  TextInput,
  FlatList,
} from 'react-native';
import {LogBox} from 'react-native';
import {connect} from 'react-redux';
import {normalize} from '../../../../src/native/utils/helpers';
import * as Constants from '../../../../src/native/components/KoraText';
// import {
//   getContactList,
//   selectedContactList,
//   getRecentContactList,
// } from '../../../../src/shared/redux/actions/create-message.action';
import {
  getInvitiesList,
} from '../../../../src/shared/redux/actions/pre-login.action';

import {emptyArray} from '../../../../src/shared/redux/constants/common.constants';
import {Avatar} from '../../../../src/native/components/Icon/Avatar';

const myList = React.createRef();
class InvitieesList extends Component {
  constructor(props) {
    super();
  }

  componentDidMount() {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    this.props.getInvitiesList(this.props.searchName);
    //this.props.selectedContactList([]);
   // this.props.getRecentContactList();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.searchName !== this.props.searchName) {
      this.props.getInvitiesList(this.props.searchName);
    }
  }

  hasBeenSelected(user) {
    let contactData = this.props.tagsSelected;
    return contactData.findIndex((o) => o.id === user.id) !== -1;
  }

  filter(list) {
    if (!Array.isArray(list)) {
      return [];
    }
    let {searchName} = this.props;
    if (this.props.tagsSelected.length > 0) {
      list = list.filter((obj) => {
        const id = obj._id || obj.id;
        return !this.props.tagsSelected.includes((o) => o.id === id);
      });
    }
    searchName = searchName.toLowerCase();
    if (
      searchName === '' ||
      searchName?.trim() === '' ||
      searchName === undefined
    ) {
      return list;
    }
    return list;
  }

  showContactListItem(item) {
    const name = (item.fN + ' ' + item.lN).trim();
    const col = item.color;
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.2)"
        onPress={() => {
          this.props.addAttendees(item);
          this.props.setSuggesstionListVisibility();
        }}
        style={{
          flexDirection: 'row',
          flex: 1,
          alignItems: 'flex-start',
          alignContent: 'center',
          justifyContent: 'flex-start',
          paddingVertical: 3,
        }}>
        <>
          <View
            style={{
              // paddingBottom: 20,
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              alignContent: 'center',
            }}>
            <Avatar
              name={name}
              color={col}
              profileIcon={item.icon}
              userId={item.id}
            />
            <View
              style={{
                flexDirection: 'column',
                marginStart: 5,
                flex: 1,
                padding: 5,
              }}>
              <Text numberOfLines={1} style={styles.nameTextStyle}>
                {name}
              </Text>
              <Text numberOfLines={1} style={styles.emailTextStyle}>
                {item.emailId}
              </Text>
            </View>
          </View>
          {item.type === 'recent' ? (
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingTop: 5,
                marginEnd: 10,
              }}>
              <Text style={styles.recentTextStyle}>{'Recent'}</Text>
            </View>
          ) : null}
        </>
      </TouchableHighlight>
    );
  }

  showContactList() {
    let data = this.props.contactlistData || [];
    if (this.props.searchName === '') {
      data = this.filter(this.props.recentData);
    } else {
      data = this.filter(this.props.contactlistData);
    }
    return (
      <FlatList
        ref={myList}
        onStartShouldSetResponderCapture={() => {
          this.props.onStartShouldSetResponderCapture(false);
          if (
            myList.scrollProperties.offset === 0 &&
            this.props.enableScrollViewScroll === false
          ) {
            console.log('Scroll prop', myList.scrollProperties.offset);
            this.props.onStartShouldSetResponderCapture(true);
          }
        }}
        nestedScrollEnabled={true}
        contentContainerStyle={{}}
        keyboardShouldPersistTaps={'always'}
        style={{maxHeight: 200}}
        bounces={false}
        keyExtractor={(obj) => obj.id}
        data={data}
        ListEmptyComponent={() => {
          return (
            <View>
              <Text>No match found</Text>
            </View>
          );
        }}
        renderItem={({item}) => {
          if (this.hasBeenSelected(item)) {
            return null;
          }
          return this.showContactListItem(item);
        }}
      />
    );
  }

  render() {
    return <View style={styles.viewStyles}>{this.showContactList()}</View>;
  }
}

const mapStateToProps = (state) => {
  const {createMessage} = state;
  return {
    contactlistData: createMessage.contactlistData || emptyArray,
    recentData: createMessage.recentData || emptyArray,
  };
};

export default connect(mapStateToProps, {
  getInvitiesList,
 // getRecentContactList,
 // selectedContactList,
})(InvitieesList);

const styles = StyleSheet.create({
  viewStyles: {
    paddingLeft: 10,
    borderWidth: 1,
    borderRadius: 4,
    borderTopWidth: 0,
    borderColor: '#E4E5E7',
  },
  characterTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#FFFFFF',
  },
  recentTextStyle: {
    color: '#9AA0A6',
    fontSize: normalize(12),
    fontWeight: '500',
  },
  textStyle: {
    marginTop: 5,
    fontWeight: '400',
    fontSize: normalize(15),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    color: '#202124',
  },
  emailTextStyle: {
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(13),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    //top: 2,
  },
  nameTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});
