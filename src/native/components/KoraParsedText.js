import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {StyleSheet, Text, Linking} from 'react-native';
import {normalize} from '../utils/helpers';
export const fontFamily = 'Inter';
//import Autolink from 'react-native-autolink';
//import {View} from 'native-base';

import ParsedText from 'react-native-parsed-text';
const MENCTION_PATTERN = /@([a-zA-Z0-9_\-\.]+)/;
const WWW_URL_PATTERN = /^www\./i;

import Communications from 'react-native-communications';

export const _KoraParsedText = ({translate = false, children, ...props}) => {
  const {t} = useTranslation();
  let isMentioned = '';
  if (!props?.isDR&&props?.mentions) {
 isMentioned = props?.mentions[0] || '';
  }

  // const limit = 3;
  // const [showMore, setShowMore] = useState(false);
  // const [textShown, setTextShown] = useState(false);
  // const [numLines, setNumLines] = useState(undefined);
  if (translate) {
    children = t(children);
  }

  function onUrlPress(url) {
    if (WWW_URL_PATTERN.test(url)) {
      onUrlPress(`http://${url}`);
    } else {
      Linking.canOpenURL(url).then((supported) => {
        if (!supported) {
          console.log('No handler for URL:', url);
        } else {
          Linking.openURL(url);
        }
      });
    }
    return true;
  }

  function onPhonePress(phone) {
    Communications.phonecall(phone, true);
  }

  function onEmailPress(email) {
    Communications.email([email], null, null, null, null);
  }

  function onMenctionPress(user) {
    console.log('User ---------->>> :', user);
  }

  return (
    <ParsedText
      style={[styles.style1, props.style]}
      parse={[
        {type: 'url', style: styles.link, onPress: onUrlPress},
        {type: 'phone', style: styles.link, onPress: onPhonePress},
        {
          type: 'email',
          style: styles.link,
          onPress: onEmailPress,
        },
       
        {
          pattern: MENCTION_PATTERN,
          style: [
            styles.link,
            props.style,
            {
              color: isMentioned !== '' || props?.isDR ? '#0D6EFD' : '#202124',
              fontWeight: props.atMentionStyle ? 'bold' : 'normal',
            },
          ],
          onPress: onMenctionPress,
          //nonExhaustiveModeMaxMatchCount: 10,
        },
      ]}
      // childrenProps={{...this.props.textProps}}
    >
      {children}
    </ParsedText>
  );

  // return (
  //   <View>
  //     <Autolink
  //       mention="soundcloud"
  //       // numberOfLines = {children.length > 150 && !showMore ? 4 : 0}
  //       linkStyle={[
  //         styles.style1,
  //         props.style,
  //         {
  //           color: '#0D6EFD',
  //           fontWeight: props.atMentionStyle ? 'bold' : 'normal',
  //         },
  //       ]}
  //       onPress={(url, match) => {
  //         console.log('clicked on :', children);
  //       }}
  //       style={[styles.style1, props.style]}
  //       text={children}
  //     />
  //   </View>
  // );
};
export const KoraParsedText = React.memo(_KoraParsedText);
const styles = StyleSheet.create({
  style1: {
    fontFamily: 'Inter',
    fontSize: normalize(14),
    fontStyle: 'normal',
    color: '#202124',
  },
  style2: {width: '100%', alignSelf: 'flex-end', margin: 5},
  style3: {color: 'blue', fontWeight: 'bold', textAlign: 'right'},
  link: {
    color: '#0D6EFD',
    // textDecorationLine: 'underline',
    fontFamily: 'Inter',
    fontSize: normalize(16),
    fontStyle: 'normal',
  },
  menction: {
    color: '#0D6EFD',
    fontWeight: 'bold',
    fontFamily: 'Inter',
    fontSize: normalize(16),
    fontStyle: 'normal',
  },
});
