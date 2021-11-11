import PropTypes from 'prop-types';
import React from 'react';
import {Linking, StyleSheet, View} from 'react-native';
import {normalize} from '../../../utils/helpers';
import ParsedText from 'react-native-parsed-text';
import Communications from 'react-native-communications';
import {StylePropType} from '../../../../bot-sdk/chat/utils';
import Markdown from 'react-native-markdown-package';
const WWW_URL_PATTERN = /^www\./i;

const textStyle = {
  fontSize: normalize(15),
  marginTop: 5,
  marginBottom: 5,
  marginLeft: 10,
  marginRight: 10,
};

const styles = {
  left: StyleSheet.create({
    container: {},
    text: {
      color: '#202124',
      ...textStyle,
    },
    link: {
      color: 'black',
      textDecorationLine: 'underline',
    },
  }),
  center: StyleSheet.create({
    container: {},
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
    container: {},
    text: {
      color: '#202124',
      ...textStyle,
    },
    link: {
      color: '#202124',
      textDecorationLine: 'underline',
    },
  }),
  center: StyleSheet.create({
    container: {},
    text: {
      color: '#202124',
      ...textStyle,
    },
    link: {
      color: 'black',
      textDecorationLine: 'underline',
    },
  }),
};

const DEFAULT_OPTION_TITLES = ['Call', 'Text', 'Cancel'];

export default class MessageText extends React.Component {
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

  onEmailPress = (email) =>
    Communications.email([email], null, null, null, null);

  render() {
    const linkStyle = [
      styles[this.props.position].link,
      this.props.linkStyle && this.props.linkStyle[this.props.position],
    ];
    let message = this.props.currentMessage.message[0];
    let text = message?.component?.payload?.text;
    text = text ? text : message?.component?.payload?.payload?.text;
    text = text ? text : message?.component?.payload;

    return text ? (
      <View
        style={[
          styles[this.props.position].container,
          this.props.containerStyle &&
            this.props.containerStyle[this.props.position],
        ]}>
        {/* https://www.npmjs.com/package/react-native-markdown-package */}
        {/* readonly order: number,
    readonly match: MatchFunction,
    readonly quality?: (capture: Capture, state: State, prevCapture: string) => number,
    readonly parse: ParseFunction, */}
        <Markdown
          enableLightBox={false}
          styles={markdownStyle.collectiveMd}
          onLink={this.onLinkCallback}
          rules={[
            ...this.props.parsePatterns(linkStyle),
            {type: 'url', style: linkStyle, onPress: this.onUrlPress},
            {type: 'phone', style: linkStyle, onPress: this.onPhonePress},
            {
              order: 30,
              type: 'mailto',
              style: linkStyle,
              match: this.onEmailPress,
              parse: () => {
                console.log('Called parse function ');
              },
            },
          ]}
          // mergeStyle={false}
          // style={styles['marker']}
        >
          {text}
        </Markdown>
      </View>
    ) : null;
  }

  render1() {
    const linkStyle = [
      styles[this.props.position].link,
      this.props.linkStyle && this.props.linkStyle[this.props.position],
    ];
    let message = this.props.currentMessage.message[0];
    let text = message?.component?.payload?.text;
    text = text ? text : message?.component?.payload?.payload?.text;
    text = text ? text : message?.component?.payload;

    return text ? (
      <View
        style={[
          styles[this.props.position].container,
          this.props.containerStyle &&
            this.props.containerStyle[this.props.position],
        ]}>
        <ParsedText
          style={[
            styles[this.props.position].text,
            this.props.textStyle && this.props.textStyle[this.props.position],
            this.props.customTextStyle,
            {flexWrap: 'wrap'},
          ]}
          parse={[
            ...this.props.parsePatterns(linkStyle),
            {type: 'url', style: linkStyle, onPress: this.onUrlPress},
            {type: 'phone', style: linkStyle, onPress: this.onPhonePress},
            {type: 'email', style: linkStyle, onPress: this.onEmailPress},
          ]}
          childrenProps={{...this.props.textProps}}>
          {text}
          {/* <Markdown
            mergeStyle={true}
            style={{
              body: styles[this.props.position].container,
              heading1: { color: 'purple' },
              code_block: { color: 'black', fontSize: 14 }
            }}

          >{text}</Markdown> */}
        </ParsedText>
      </View>
    ) : null;
  }
}

MessageText.contextTypes = {
  actionSheet: PropTypes.func,
};

MessageText.defaultProps = {
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

MessageText.propTypes = {
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

const markdownStyle = {
  singleLineMd: {
    text: {
      color: 'blue',
      textAlign: 'right',
    },
    view: {
      alignSelf: 'stretch',
    },
  },
  collectiveMd: {
    view: {
      paddingLeft: 10,
      paddingRight: 10,
    },
    heading1: {
      color: '#202124',
      ...textStyle,
    },
    heading2: {
      color: '#202124',
      ...textStyle,
    },
    strong: {
      color: '#202124',
      ...textStyle,
    },
    em: {
      color: '#202124',
      ...textStyle,
    },
    text: {
      color: '#202124',
      ...textStyle,
    },
    blockQuoteText: {
      color: '#202124',
      ...textStyle,
    },
    blockQuoteSection: {
      flexDirection: 'row',
    },
    blockQuoteSectionBar: {
      width: 3,
      height: null,
      backgroundColor: '#DDDDDD',
      marginRight: 15,
      color: '#202124',
      ...textStyle,
    },
    codeBlock: {
      fontFamily: 'Courier',
      fontWeight: '500',
      backgroundColor: '#DDDDDD',

      ...textStyle,
    },
    tableHeader: {
      backgroundColor: 'grey',
      color: '#202124',
      ...textStyle,
    },
  },
};
