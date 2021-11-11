import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../../../components/KoraText';
import { FlatList } from 'react-native';
import ParentView from './ParentView';

import { normalize } from '../../../utils/helpers';
import * as Constants from '../../../components/KoraText';
import { BORDER } from './TemplateType';

class ButtonTemplate extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      buttons: [],
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.buttonPayload;
    this.template_type = this.props.template_type;

    let buttons = payload.buttons;

    this.setState({
      buttons: buttons,
      payload: payload,
    });
  }

  getSingleButtonsViewForFlatList = (item) => {
    return this.getSingleButtonView(item.item);
  };

  getSingleButtonView = (item) => {
    return (
      <View
        style={styles.btn_view}>
        <View
          style={styles.line}
        />
        <TouchableOpacity
          disabled={this.isViewDisabled()}
          style={styles.main_view_1}
          onPress={() => {
            if (this.props.onListItemClick) {
              this.props.onListItemClick(this.template_type, item);
            }
          }}>
          <Text
            style={styles.item_text}>
            {item.title}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  renderButtonsView = (list) => {
    return (
      <View style={styles.btn_views_1}>
        <FlatList
          data={list}
          renderItem={this.getSingleButtonsViewForFlatList}
          keyExtractor={(item) => item.index}
        />
      </View>
    );
  };

  render() {
    return (
      <View>
        {this.state.payload && (
          <View style={{ backgroundColor: 'white' }}>
            <View
              style={styles.mainContainer}>
              <Text
                style={styles.text}>
                {this.state.payload.text}
              </Text>
              {this.renderButtonsView(this.state.buttons)}
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
    borderRadius: BORDER.RADIUS
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

  bottom_btns: { flexDirection: 'row', marginTop: 0, },
  btn_view: {
    paddingBottom: 0,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 8,
  },
  line: { backgroundColor: BORDER.COLOR, width: '100%', height: 1 },

  item_text: {
    fontFamily: Constants.fontFamily,
    alignSelf: 'center',
    color: 'blue',
    fontSize: BORDER.TEXT_SIZE,
  },
  main_view_1: { margin: 5, padding: 5 },
  btn_views_1: { backgroundColor: 'white', marginBottom: 2 },

});


export default ButtonTemplate;
