/* eslint-disable react-native/no-inline-styles */
import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import DraggablePanel from '../../components/Library/react-native-draggable-panel';
import {normalize} from '../../utils/helpers';
import {Icon} from '../../components/Icon/Icon.js';
import * as Constants from '../../components/KoraText';

const array = [
  {icon: 'Contact_MediaFiles', name: 'Remove Icon', size: 18, key: 1},
  {icon: 'Camera', name: 'Take Photo', size: 24, key: 2},
  {icon: 'Upload', name: 'From Gallery', size: 24, key: 3},
  {icon: 'EmojiSmile', name: 'Emoji', size: 24, key: 4},
  {icon: 'DriveCloud', name: 'Drive', size: 18, key: 5},
];

export default class GroupIcon extends Component {
  state = {
    toggleGroupPanel: false,
  };
  list = () => {
    return array.map((element) => {
      return (
        <TouchableOpacity
          key={element.key}
          style={styles.opacityStyle}
          activeOpacity={0.5}>
          <View
            style={styles.groupIcon1}>
            <View
              style={styles.groupIcon2}>
              <Icon name={element.icon} size={element.size} color="#202124" />
            </View>
            <Text
              numberOfLines={1}
              lineBreakMode={'middle'}
              style={styles.elementNameTextStyle}>
              {element.name}
            </Text>
          </View>
        </TouchableOpacity>
      );
    });
  };

  renderModalContent = () => (
    <View>
      <View style={styles.modalContent}>
        <Text style={styles.textStyle}>Group Icon</Text>
        <View style={styles.modalStyle1} />
        <View style={styles.viewStyle}>{this.list()}</View>
        <View style={styles.modalStyle2} />
      </View>
    </View>
  );

  openGroupIcon() {
    this.setState({toggleGroupPanel: true});
  }
  render() {
    return (
      <View style={styles.container}>
        <DraggablePanel
          borderRadius={15}
          initialHeight={380}
          visible={this.state.toggleGroupPanel}
          onDismiss={() => this.setState({toggleGroupPanel: false})}>
          {this.renderModalContent()}
        </DraggablePanel>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 15,
    backgroundColor: 'white',
    padding: 5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  textStyle: {
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    padding: 15,
  },
  viewStyle: {
    padding: 5,
  },
  opacityStyle: {
    height: 60,
    justifyContent: 'center',
    flexDirection: 'column',
  },
  elementNameTextStyle: {
    color: '#202124',
    fontSize: normalize(16),
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginStart: 20,
  },
  modalStyle1:{borderWidth: 0.4, borderColor: '#9AA0A6'},
  modalStyle2:{padding: 10},
  groupIcon1:{
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  groupIcon2:{
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
