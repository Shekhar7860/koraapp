import PropTypes from 'prop-types';
import React from 'react';
import {Linking, StyleSheet, View, Text} from 'react-native';
import {normalize} from '../../../utils/helpers';
import ParsedText from 'react-native-parsed-text';
import Communications from 'react-native-communications';
import Color from '../../../../bot-sdk/chat/Color';
import {StylePropType} from '../../../../bot-sdk/chat/utils';
import Markdown from 'react-native-markdown-package';
import {FormattedText} from 'react-native-formatted-text';
const WWW_URL_PATTERN = /^www\./i;
import {TemplateType} from '../views/TemplateType';
import {BORDER} from './TemplateType';

const textStyle = {
  fontSize: normalize(15),
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 5,
  marginRight: 10,
};

const styles = {
  // left: StyleSheet.create({
  //   container: {},
  //   text: {
  //     color: '#202124',
  //     ...textStyle,
  //   },
  //   link: {
  //     color: 'black',
  //     textDecorationLine: 'underline',
  //   },
  // }),
  // center: StyleSheet.create({
  //   container: {},
  //   text: {
  //     color: '#202124',
  //     ...textStyle,
  //   },
  //   link: {
  //     color: '#202124',
  //     textDecorationLine: 'underline',
  //   },
  // }),
  // right: StyleSheet.create({
  //   container: {},
  //   text: {
  //     color: '#202124',
  //     ...textStyle,
  //   },
  //   link: {
  //     color: '#202124',
  //     textDecorationLine: 'underline',
  //   },
  // }),
  // center: StyleSheet.create({
  //   container: {},
  //   text: {
  //     color: '#202124',
  //     ...textStyle,
  //   },
  //   link: {
  //     color: 'black',
  //     textDecorationLine: 'underline',
  //   },
  // }),

  left: StyleSheet.create({
    container: {
      //flex: 1,
      alignItems: 'flex-start',
    },
    text: {
      color: '#202124',
      ...textStyle,
    },
    container: {
      padding: 5,
      //  borderRadius: 6,
      backgroundColor: 'white',
      marginRight: 60,
      marginLeft: 0,
      minHeight: 10,
      //borderWidth: 1,
      // borderColor: '#E7F1FF',
      justifyContent: 'flex-end',
      borderWidth: BORDER.WIDTH,
      borderColor: BORDER.COLOR,
      borderRadius: BORDER.RADIUS,
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
    link: {
      color: 'black',
      textDecorationLine: 'underline',
    },
  }),
  center: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'stretch',
    },
    container: {
      padding: 5,
      borderRadius: 8,
      backgroundColor: '#F8F9FA',
      marginLeft: 10,
      marginRight: 10,
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
    text: {
      color: '#202124',
      ...textStyle,
    },
    link: {
      color: '#202124',
      textDecorationLine: 'underline',
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-end',
    },
    text: {
      color: '#202124',
      ...textStyle,
    },
    link: {
      color: '#202124',
      textDecorationLine: 'underline',
    },
    container: {
      padding: 5,
      borderRadius: 8,
      backgroundColor: '#E7F1FF',
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
};

const DEFAULT_OPTION_TITLES = ['Call', 'Text', 'Cancel'];

export default class BotText extends React.Component {
  constructor(props) {
    super(props);
  }

  shouldComponentUpdate(nextProps) {
    return (
      !!this.props.currentMessage &&
      !!nextProps.currentMessage &&
      this.props.currentMessage.message !== nextProps.currentMessage.message
    );
  }

  onLinkCallback = (url) => {
    let isErrorResult = false;

    return new Promise((resolve, reject) => {
      isErrorResult = this.onUrlPress(url);
      isErrorResult ? reject() : resolve();
    });
  };

  onUrlPress = (url) => {
    // console.log("url ->", url);
    // When someone sends a message that includes a website address beginning with "www." (omitting the scheme),
    // react-native-parsed-text recognizes it as a valid url, but Linking fails to open due to the missing scheme.
    if (WWW_URL_PATTERN.test(url)) {
      this.onUrlPress(`http://${url}`);
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
  };

  onPhonePress = (phone) => {
    const {optionTitles} = this.props;
    const options =
      optionTitles && optionTitles.length > 0
        ? optionTitles.slice(0, 3)
        : DEFAULT_OPTION_TITLES;
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            Communications.phonecall(phone, true);
            break;
          case 1:
            Communications.text(phone);
            break;
          default:
            break;
        }
      },
    );
  };

  renderParsedText = (text) => {
    if (!text || text === '') {
      return null;
    }
    text = text + ' ';
    text = text?.replace('.', '. ');
    const words = text?.split('%%');
    let index = 0;
    let textMatches = [];

    // textMatches[index++] = {
    //     text: 'Hello', style: { color: 'red' }
    // };

    let parsedText = '';
    words?.map((sentance) => {
      if (sentance && sentance.includes('{')) {
        let obj = JSON.parse(sentance);
        parsedText = parsedText + obj.title;
        textMatches[index++] = {
          text: obj.title,
          style: {
            color: 'blue',
            textDecorationLine: 'underline',
          },
          onPress: () => {
            if (this.props.onListItemClick) {
              this.props.onListItemClick(this.props.template_type, obj);
            } else {
              console.log(
                'this.props.onListItemClick ----------------------->',
                this.props.onListItemClick,
              );
            }
          },
        };
      } else {
        parsedText = parsedText + sentance;
        textMatches[index++] = {
          text: sentance,
          style: {color: 'black'},
        };
      }
    });

    return (
      <FormattedText
        matches={textMatches}
        style={[
          {
            flexWrap: 'wrap',
            flexDirection: 'row',
            alignItems: 'flex-start',
            //  padding: 10,
            marginLeft: 5,
            //  fontSize: 14,
            color: '#202124',
            ...textStyle,

            //  backgroundColor: 'white', borderWidth: 0.3, borderColor: '#00485260', borderRadius: 8
          },
          styles['left'].text,
        ]}>
        {parsedText}
      </FormattedText>
    );
  };

  onEmailPress = (email) =>
    Communications.email([email], null, null, null, null);

  render() {
    const linkStyle = [
      styles[this.props.position].link,
      this.props.linkStyle && this.props.linkStyle[this.props.position],
    ];
    let text = this.props.text;

    return text ? (
      <View
        style={[
          {backgroundColor: 'yellow'},
          styles['left'].container,
          // this.props.containerStyle &&
          // this.props.containerStyle[this.props.position],
        ]}>
        {this.props.template_type &&
        this.props.template_type === TemplateType.QUICK_REPLIES ? (
          // <Text>{text.toString().replace(/\s\s+/g, ' ').trim()}</Text>
          this.renderParsedText(text.replace(/\s\s+/g, ' ').trim())
        ) : (
          <ParsedText
            style={[
              styles['left'].text,
              //  { flexWrap: 'wrap' },
              {
                //color: 'red'
              },
            ]}
            parse={[
              ...this.props.parsePatterns(linkStyle),
              {type: 'url', style: linkStyle, onPress: this.onUrlPress},
              {type: 'phone', style: linkStyle, onPress: this.onPhonePress},
              {type: 'email', style: linkStyle, onPress: this.onEmailPress},
            ]}
            childrenProps={{...this.props.textProps}}>
            {text.toString().replace(/\s\s+/g, ' ').trim()}
          </ParsedText>
        )}
      </View>
    ) : null;
  }
}

BotText.contextTypes = {
  actionSheet: PropTypes.func,
};

BotText.defaultProps = {
  position: 'left',
  optionTitles: DEFAULT_OPTION_TITLES,
  currentMessage: {
    text: '',
  },
  containerStyle: {},
  textStyle: {},
  linkStyle: {},
  customTextStyle: {},
  textProps: {},
  parsePatterns: () => [],
};

BotText.propTypes = {
  position: PropTypes.oneOf(['left', 'right', 'center']),
  optionTitles: PropTypes.arrayOf(PropTypes.string),
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
  textStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
  linkStyle: PropTypes.shape({
    left: StylePropType,
    right: StylePropType,
  }),
  parsePatterns: PropTypes.func,
  textProps: PropTypes.object,
  customTextStyle: StylePropType,
};
