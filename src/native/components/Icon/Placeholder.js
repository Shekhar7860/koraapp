import React, {Component, useState} from 'react';
const {View, Image, SafeAreaView, StyleSheet, Text} = require('react-native');

import * as Constants from '../KoraText';
import {normalize} from '../../utils/helpers';
import {SvgIcon} from '../../components/Icon/SvgIcon.js';

const elements = {
  messages: {
    icon: require('../../assets/placeholders/msgs-placeholder.png'),
    text: 'Hmmm..... Click on "+" and let’s find someone to talk to.',
  },
  starred: {
    icon: require('../../assets/placeholders/starred-msgs-placeholder.png'),
    text: 'This space looks dark without stars. Mind adding a few?',
  },
  mentions: {
    icon: require('../../assets/placeholders/mentioned-msgs-placeholder.png'),
    text: 'We can use the magic of “@” to delegate people.',
  },
  home: {
    icon: require('../../assets/placeholders/home-placeholder.png'),
    text: 'Coming soon...',
  },
  files: {
    icon: 'Empty_viewFiles',
    width: 250,
    height: 250,
    text: 'Seems like the coast is clear, Captain!!!',
  },
  workspaces: {
    icon: require('../../assets/placeholders/home-placeholder.png'),
    text:
      'No workspace to show. Creating a workspace is very simple. \nJust click on the button bellow!',
  },
  chat: {
    icon: require('../../assets/placeholders/empty-chat.png'),
    text: 'How about, Let’s start with just a hello?',
  },
  search: {
    icon: require('../../assets/placeholders/empty-search.png'),
    text: 'Sorry, the earth & stars say nay! Could you please phrase repharse?',
  },
};

class Placeholder extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let element = elements[this.props.name];
    const isSvg = this.props.isSvg || false;

    return (
      <SafeAreaView>
        {isSvg ? (
          <View style={styles.container}>
            <View style={styles.imageStyle}>
              <SvgIcon
                name={element?.icon}
                width={element?.width || 20}
                height={element?.height || 20}
              />
            </View>
            <Text style={styles.textStyle}>
              {this.props.text || element?.text}
            </Text>
          </View>
        ) : (
          <View style={styles.container}>
            <Image
              source={element?.icon}
              style={[styles.imageStyle, this.props.imageStyle]}
            />
            <Text style={[styles.textStyle, this.props.textStyle]}>
              {this.props.text || element?.text}
            </Text>
          </View>
        )}
      </SafeAreaView>
    );
  }
}

export default Placeholder;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    marginBottom: 60,
  },
  textStyle: {
    fontWeight: '400',
    fontSize: normalize(19),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    textAlign: 'center',
    lineHeight: 34,
    color: '#9AA0A6',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textAlign: 'center',
    color: '#9AA0A6',
    width: '80%',
  },
});
