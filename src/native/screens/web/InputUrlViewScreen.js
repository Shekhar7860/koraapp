import React from 'react';
import {
  StyleSheet,
  View,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  TouchableHighlight,
  Text,
} from 'react-native';
import {TextInput} from 'react-native-paper';
import {ScrollView} from 'react-native';
import {normalize} from '../../utils/helpers';
import {bootstrap} from '../../config/bootstrap';
import * as Constants from '../../components/KoraText';
import { navigate } from '../../navigation/NavigationService';
import { ROUTE_NAMES } from '../../navigation/RouteNames';

class InputUrlViewScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      url: '',
    };
  }

  componentWillUnmount() {
    this.keyboardDidHideListener.remove();
  }

  componentDidMount() {
    this.keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      this.keyboardDidHide,
    );
  }

  componentDidUpdate() {

  }

  openWebView = () => {
    navigate(ROUTE_NAMES.WEBVIEW, {url: this.state.url});
  };

  keyboardDidHide = () => {
    this.refs.inputRef.blur();
  };

  render() {
    const {t} = this.props;
    return (
      <ScrollView scrollEnabled={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'position' : null}
          style={[
            styles.container,
            {padding: 20, paddingTop: 50},
            bootstrap.dFlex,
            bootstrap.flexColumn,
            bootstrap.justifyContentSpaceBetween,
          ]}>
          <View
            style={[
              bootstrap.dFlex,
              bootstrap.flexColumn,
              {paddingBottom: 10},
            ]}>
            <View style={styles.basicMargin}>
              <Text style={styles.linkTextStyle}>
                Input link
              </Text>
            </View>
            <TextInput
              label="URL"
              value={this.state.url}
              style={styles.input}
              keyboardType="email-address"
              ref="inputRef"
              onChangeText={(text) => {
                this.setState({url: text});
              }}
              autoCapitalize={'none'}
            />
            <View style={{paddingBottom: 30}}>
              <View style={styles.input}>
                <TouchableHighlight
                  underlayColor={'#817dff'}
                  style={[
                    styles.button,
                  ]}
                  onPress={this.openWebView}>
                  <Text style={styles.nextTextStyle}>
                    {'Next'}
                  </Text>
                </TouchableHighlight>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 50,
    borderRadius: 5,
    backgroundColor: '#4741FA',
    color: '#ffffff',
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  input: {
    marginBottom: 11,
    marginTop: 11,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  basicMargin: {
    paddingBottom: 11,
    paddingTop: 11,
  },
  linkTextStyle: {
    fontWeight: '400',
    fontSize: normalize(40),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  nextTextStyle: {
    color: '#ffffff', 
    fontWeight: '400',
    fontSize: normalize(18),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  }
});

export default InputUrlViewScreen;
