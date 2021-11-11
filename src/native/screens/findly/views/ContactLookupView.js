import React from 'react';
import {View, TouchableOpacity, Linking, StyleSheet} from 'react-native';
import {Text} from '../../../components/KoraText';
import ParentView from './ParentView';
import {Icon} from '../../../components/Icon/Icon.js';
import UserAvatar from '../../../components/Library/react-native-user-avatar/src';
import Collapsible from 'react-native-collapsible';
import {BORDER} from './TemplateType';
import BotText from '../views/BotText';
import {normalize} from '../../../utils/helpers';

const MIN_SHOW_COUNT = 4;

export const CONTACT_TYPES = {
  phone: 'phone',
  email: 'email',
  address: 'address',
};

class ContactLookupView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      payload: null,
      isShowMore: false,
      isCollapsed: true,
      contact: null,
      infoList: [],
    };
  }

  componentDidMount() {
    const payload = this.props.contactLookupPayload;
    this.template_type = this.props.template_type;

    let contact = payload.elements[0];

    let list = [];

    if (contact) {
      if (contact.phones) {
        contact.phones.map((phone) => {
          list.push({...phone, content_type: CONTACT_TYPES.phone});
        });
      }

      if (contact.emails) {
        contact.emails.map((email) => {
          list.push({...email, content_type: CONTACT_TYPES.email});
        });
      }
      if (contact.department) {
        list.push({
          type: 'Department',
          value: contact.department,
        });
      }

      if (contact.empId) {
        list.push({
          type: 'Manager',
          value: contact.manager,
        });
      }
      if (contact.empId) {
        list.push({
          type: 'Employee Id',
          value: contact.empId,
        });
      }

      if (contact.address) {
        list.push({
          type: 'Address',
          value: contact.address,
          content_type: CONTACT_TYPES.address,
        });
      }
    }

    this.setState({
      payload: payload,
      contact: contact,
      infoList: list,
    });
  }
  renderHeaderView = (contact) => {
    const id = this.getItemId();

    return (
      <View keyExtractor={id} key={id} style={styles.item_container}>
        <View style={styles.item_sub_container}>
          <UserAvatar
            name={contact.fN}
            textStyle={{fontSize: BORDER.TEXT_SIZE}}
            color={contact.color}
            size={80}
            borderRadius={40}
            twoLettersText={contact.fN[0] + contact.lN[0]}
          />
        </View>
        <View style={styles.name}>
          <Text style={{fontSize: normalize(18)}}>
            {contact.fN} {contact.lN}
          </Text>
          <Text style={{fontSize: normalize(14)}}>{contact.title}</Text>
        </View>

        {contact.source && (
          <View style={styles.source_view}>
            <Text style={styles.source_text}>{contact.source}</Text>
          </View>
        )}
      </View>
    );
  };

  getItemId = (pattern) => {
    var _pattern = pattern || 'xyxxyxxy';
    _pattern = _pattern.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return _pattern;
  };

  renderContactInfo = () => {
    let index = -1;
    let phoneView = this.state.infoList.map((item) => {
      index++;
      const id = this.getItemId();
      return index >= MIN_SHOW_COUNT ? (
        <Collapsible collapsed={this.state.isCollapsed} align="bottom">
          {this.getItemView(item, id)}
        </Collapsible>
      ) : (
        this.getItemView(item, id)
      );
    });

    return <View style={{flexDirection: 'column'}}>{phoneView}</View>;
  };

  getTypeView = (item) => {
    let iconName = '';
    switch (item.content_type) {
      case CONTACT_TYPES.phone:
        iconName = 'Contact_ACall';
        break;
      case CONTACT_TYPES.email:
        iconName = 'email';
        break;
      case CONTACT_TYPES.address:
        iconName = 'Location';
        break;
    }
    return (
      <TouchableOpacity
        style={styles.type_view}
        onPress={() => {
          if (this.props.onListItemClick) {
            this.props.onListItemClick(this.template_type, item);
          }
        }}>
        <View style={styles.type_sub_view}>
          <View style={styles.icon_view}>
            <Icon name={iconName} size={20} color="black" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  getItemView = (item, id) => {
    return (
      <View keyExtractor={id} key={id} style={styles.sub_container_view}>
        <View style={styles.contact_container}>
          <View style={styles.contact_sub_container}>
            <Text style={styles.contact_item_type_text}>{item.type}</Text>
            <Text style={styles.contact_text}>{item.value}</Text>
          </View>
          {item.content_type && this.getTypeView(item)}
        </View>
        <View style={styles.item_seprator} />
      </View>
    );
  };

  getSingleContactViewForFlatList = (contact, index) => {
    const id = this.getItemId();
    return (
      <View keyExtractor={id} key={id} style={styles.container}>
        <View style={{flexDirection: 'column'}}>
          <View key={index} style={{flexDirection: 'column'}}>
            {this.renderHeaderView(contact)}
            {this.renderContactInfo(contact)}
          </View>
          {this.state.infoList.length > MIN_SHOW_COUNT && (
            <TouchableOpacity
              disabled={this.isViewDisabled()}
              onPress={() => {
                this.setState({
                  isCollapsed: !this.state.isCollapsed,
                });
              }}>
              <View style={styles.sub_container}>
                <Text style={styles.text_more}>
                  {this.state.isCollapsed ? 'View more' : 'View less'}
                </Text>
                <View style={styles.icon_view}>
                  <Icon
                    name={this.state.isCollapsed ? 'Down' : 'Up'}
                    size={15}
                    color="black"
                  />
                </View>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  render() {
    const id = this.getItemId();
    return (
      <View keyExtractor={id} key={id}>
        {this.state.payload && (
          <View>
            <BotText text={this.state.payload.text} />
            {this.getSingleContactViewForFlatList(this.state.contact, 1234)}
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  sub_container_view: {
    marginBottom: 10,
    marginStart: 10,
    marginEnd: 10,
  },
  item_seprator: {
    height: BORDER.WIDTH,
    marginBottom: 2,
    marginTop: 2,
    backgroundColor: BORDER.COLOR,
  },
  contact_text: {paddingBottom: 5, paddingTop: 5, fontSize: normalize(13)},
  contact_item_type_text: {fontSize: normalize(15)},
  contact_sub_container: {flex: 1, flexDirection: 'column'},
  contact_container: {flexDirection: 'row'},
  icon_view: {
    justifyContent: 'center',
    marginStart: 5,
    marginTop: 3,
  },
  type_sub_view: {
    width: 50,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  type_view: {
    width: 50,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  source_text: {fontSize: normalize(13), textTransform: 'uppercase'},
  source_view: {
    alignSelf: 'flex-end',
    padding: 8,
    position: 'absolute',
    zIndex: 999,
  },
  name: {flexDirection: 'column', alignItems: 'center'},
  item_sub_container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  item_container: {
    padding: 10,
    height: 180,
    marginEnd: 2,
    marginStart: 2,
    marginTop: 2,
    marginBottom: 10,
    flexDirection: 'column',
    backgroundColor: '#F6F6F8',
    borderTopEndRadius: 8,
    borderTopStartRadius: 8,
  },
  icon_view: {
    justifyContent: 'center',
    marginStart: 5,
    marginTop: 3,
    marginEnd: 15,
  },
  text_more: {
    flex: 1,
    fontSize: normalize(14),
    color: BORDER.TEXT_COLOR,
    alignSelf: 'flex-start',
  },
  sub_container: {
    paddingStart: 10,
    paddingBottom: 10,
    paddingEnd: 10,
    paddingTop: 0,
    alignItems: 'center',
    flexDirection: 'row',
  },
  container: {
    marginTop: 20,
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },
});

export default ContactLookupView;
