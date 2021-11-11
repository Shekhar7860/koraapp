import React from 'react';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {Text} from '../../../components/KoraText';
import {FlatList} from 'react-native';
import ParentView from './ParentView';

import {normalize} from '../../../utils/helpers';
import * as Constants from '../../../components/KoraText';
import {BORDER} from './TemplateType';
import {Icon} from '../../../components/Icon/Icon.js';

export const LIST_TYPES = {
  web_url: 'web_url',
};
const MAX_COUNT = 1;
class ListTemplate extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      elements: [],
      payload: null,
      isShowMore: false,
    };
  }

  componentDidMount() {
    const payload = this.props.listPayload;
    this.template_type = this.props.template_type;

    let elements = payload.elements;

    let isShowMore = elements && elements.length > MAX_COUNT;

    this.setState({
      elements: elements,
      payload: payload,
      isShowMore: isShowMore,
    });
  }

  getSingleElementsViewForFlatList = (item) => {
    return this.getSingleElememtView(item.item);
  };

  getSingleElememtView = (item) => {
    let Image_Http_URL = {uri: item.image_url};
    return (
      <View style={styles.main_view_1}>
        <View style={{flexDirection: 'row'}}>
          <View>
            <View
              style={{
                borderWidth: 1,
                borderColor: BORDER.COLOR,
                borderRadius: 5,
              }}>
              <Image
                source={Image_Http_URL}
                style={{
                  height: 70,
                  width: 70,
                  resizeMode: 'stretch',
                  margin: 0,
                  //blurRadius: 50,
                }}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              marginStart: 10,
              flex: 1,
            }}>
            <Text style={styles.displayTextStyle}>{item.title}</Text>

            <Text style={styles.descTextStyle}>{item.subtitle}</Text>
            {item?.default_action?.url && (
              <TouchableOpacity
                disabled={this.isViewDisabled()}
                onPress={() => {
                  if (this.props.onListItemClick) {
                    this.props.onListItemClick(this.template_type, item);
                  }
                }}>
                <Text style={styles.urlStyle}>{item?.default_action?.url}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.line} />
      </View>
    );
  };

  renderElementsView = (list) => {
    return (
      <View style={styles.btn_views_1}>
        <FlatList
          data={list}
          renderItem={this.getSingleElementsViewForFlatList}
          keyExtractor={(item) => item.index}
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
                paddingLeft: 10,
                paddingRight: 10,
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
    );
  };

  render() {
    return (
      <View>
        {this.state.payload && (
          <View style={{backgroundColor: 'white'}}>
            <View style={styles.mainContainer}>
              {/* <Text style={styles.text}>{this.state.payload.text}</Text> */}
              {this.renderElementsView(this.state.elements)}
            </View>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'white',
    //borderWidth: 1,
    //borderColor: '#00485260',
    // borderRadius: 6,
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },

  text: {
    color: BORDER.TEXT_COLOR,
    fontSize: normalize(15),
    marginStart: 10,
    marginBottom: 15,
    marginEnd: 10,
    marginTop: 10,
    fontFamily: Constants.fontFamily,
  },

  bottom_btns: {flexDirection: 'row', marginTop: 0},
  btn_view: {
    paddingBottom: 0,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 8,
  },
  line: {
    backgroundColor: BORDER.COLOR,
    width: '100%',
    height: 1,
    marginTop: 10,
    marginBottom: 5,
  },

  item_text: {
    fontFamily: Constants.fontFamily,
    alignSelf: 'center',
    color: 'blue',
    fontSize: BORDER.TEXT_SIZE,
  },
  main_view_1: {
    marginTop: 5,
    marginBottom: 5,
    marginEnd: 10,
    marginStart: 5,
    padding: 5,
    flexDirection: 'column',
  },
  btn_views_1: {backgroundColor: 'white', marginBottom: 2},
  displayTextStyle: {
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: BORDER.TEXT_COLOR,
    marginBottom: 5,
    marginEnd: 10,
  },
  descTextStyle: {
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#485260',
    marginBottom: 3,
    marginEnd: 10,
  },
  urlStyle: {
    color: 'blue',
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginEnd: 10,
  },
});

export default ListTemplate;
