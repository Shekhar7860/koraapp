import React from 'react';
import {Image, Text, View, TouchableOpacity, StyleSheet} from 'react-native';
import {normalize} from '../../utils/helpers';
import InputToolbar from '../../../bot-sdk/chat/InputToolbar';
import Actions from '../../../bot-sdk/chat/Actions';
import Composer from '../../../bot-sdk/chat/Composer';
import Send from '../../../bot-sdk/chat/Send';
import {FlatList} from 'react-native';
import Color from '../../../bot-sdk/chat/Color';

import Bubble from './Bubble';
import * as Constants from '../../components/KoraText';

let suggestionsFilteredList = [];

export const renderInputToolbar = (props) => (
  <InputToolbar
    {...props}
    containerStyle={{
      paddingTop: 3,
      paddingBottom: 3,
    }}
    primaryStyle={{alignItems: 'center'}}
  />
);

export const renderActions = (props) => (
  // <View style={{marginStart: 0}}></View>

  <Actions
    {...props}
    containerStyle={{
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 4,
      marginRight: 4,
      marginBottom: 0,
    }}
    onLongPressActionButton={() => {
      if (props.clickSpeechToText) {
        props.clickSpeechToText();
      }
      // console.log('****** >> Now Long pressclicked findly icon << ********');
    }}
    onPressActionButton={() => {
      //console.log('----> Now clicked findly icon <-------');
    }}
    icon={() => (
      <View>
        <TouchableRipple
          ref={(ref) => {
            this.rippleRef = ref;
          }}
          rippleSequential={false}
          rippleCentered={true}
          rippleSize={100}
          rippleDuration={2000}
          style={{
            flex: 1,
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            width: '100%',
            height: '100%',
          }}
          // rippleColor="#E7F1FF"
          rippleColor="#C9DBF5" //"#DAE9FF"//"#E7F1FF"
          rippleOpacity={1}
          rippleContainerBorderRadius={100}
          //onPressOut={this._startRecognizing}
          // onPress={() => {
          //   this.setState({isHidden: true});
          // }}
        ></TouchableRipple>

        <Image
          style={{width: 32, height: 32}}
          source={require('../../assets/tabs/findly.png')}
        />
      </View>
    )}
  />
);

export const renderComposer = (props) => (
  <Composer
    {...props}
    textInputStyle={{
      color: '#222B45',
      backgroundColor: 'white',
      paddingTop: 8.5,
      paddingHorizontal: 4,
      marginLeft: 0,
    }}
  />
);

export const renderSend = (props) => (
  <Send
    {...props}
    disabled={!props.text}
    containerStyle={{
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 4,
    }}>
    <View
      underlayColor={'#817dff'}
      style={{
        width: 38,
        height: 36,
        borderRadius: 6.4,
        backgroundColor: !props.text ? 'grey' : '#0D6EFD',
        color: '#ffffff',
        fontSize: normalize(12),
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
      }}>
      <Text style={styles.goTextStyle}>{'Go'}</Text>
    </View>
  </Send>
);

export const renderSuggestionsView = (props, text = null) => {
  if (!props || !props.text || !props.Suggestions) {
    return null;
  }
  if (!suggestionsFilteredList) {
    suggestionsFilteredList = [];
    return null;
  }
  suggestionsFilteredList = props.Suggestions.filter(function (item) {
    return item.toLowerCase().indexOf(props.text.toLowerCase()) > -1;
  });

  return (
    <View style={{flexDirection: 'column'}}>
      <FlatList
        style={{maxHeight: 150, backgroundColor: '#FCFCFC'}}
        bounces={false}
        data={suggestionsFilteredList}
        renderItem={({item}) => {
          return suggestionsItem(props, item);
        }}
        keyboardShouldPersistTaps="always"
        keyExtractor={(item) => item}
      />
    </View>
  );
};

function suggestionsItem(props, item) {
  return (
    <TouchableOpacity
      onPress={() => {
        console.log('Clicked :', item);
        suggestionsFilteredList = [];
        props.onTextChanged(item + ' ');
      }}>
      <Text style={styles.suggestionsItemTextStyle}>{item}</Text>
    </TouchableOpacity>
  );
}

export const renderBubble = (props) => {
  return <Bubble {...props} />;
};

const styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.leftBubbleBackground,
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomLeftRadius: 3,
    },
    containerToPrevious: {
      borderTopLeftRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    wrapper: {
      borderRadius: 15,
      backgroundColor: Color.defaultBlue,
      marginLeft: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
    containerToNext: {
      borderBottomRightRadius: 3,
    },
    containerToPrevious: {
      borderTopRightRadius: 3,
    },
    bottom: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
  }),
  content: StyleSheet.create({
    tick: {
      fontSize: normalize(10),
      backgroundColor: Color.backgroundTransparent,
      color: Color.white,
    },
    tickView: {
      flexDirection: 'row',
      marginRight: 10,
    },
    username: {
      top: -3,
      left: 0,
      fontSize: normalize(12),
      backgroundColor: 'transparent',
      color: '#aaa',
    },
    usernameView: {
      flexDirection: 'row',
      marginHorizontal: 10,
    },
  }),
  suggestionsItemTextStyle: {
    fontStyle: 'italic',
    fontWeight: '500',
    fontSize: normalize(15),
    fontFamily: Constants.fontFamily,
    opacity: 0.7,
    backgroundColor: '#00000',
    marginTop: 8,
    flexWrap: 'wrap',
    marginLeft: 10,
    padding: 8,
    borderRadius: 4,
    color: '#9350C4',
  },
  goTextStyle: {
    color: '#ffffff',
    fontSize: normalize(12),
    fontWeight: '500',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
};
