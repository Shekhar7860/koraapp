import React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import {normalize} from '../../utils/helpers';
import SPLASH_NEW from '../../assets/splash_new.svg';
import APP_LOGO from '../../assets/app_logo.svg';

import * as Constants from '../../components/KoraText';
import BackButton from '../../components/BackButton';
import {Icon} from '../../components/Icon/Icon.js';
import {goBack} from '../../navigation/NavigationService';
class HeaderPreLogin extends React.Component {
  backPress = () => {
    if (this.props.backAction) {
      this.props.backAction();
      return;
    }
    goBack();
  };
  render() {
    return (
      <View style={styles.header}>
        {this.props.appName ? (
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <APP_LOGO></APP_LOGO>
            <Text style={styles.appNameStyle}>WorkAssist</Text>
          </View>
        ) : (
          <View style={styles.btnStyle}>
            <TouchableOpacity
              style={styles.backbutton}
              onPress={this.backPress}>
              <Icon color={'#202124'} name="kr-left_direction" size={25} />
            </TouchableOpacity>
            <Text style={styles.appTextStyle}>
              {this.props.currentScreenName}{' '}
            </Text>
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  btnStyle: {flexDirection: 'row', flex: 1},
  backbutton: {
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
    marginStart: -5,
  },
  appNameStyle: {
    marginStart: 5,
    fontSize: normalize(18),
    color: '#202124',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  appTextStyle: {
    fontSize: normalize(18),
    color: '#202124',
    fontWeight: '600',

    flex: 1,
    padding: 0,
    marginRight: 20,
    textAlign: 'center',
    alignContent: 'center',
    fontStyle: 'normal',
    justifyContent: 'center',
    alignSelf: 'center',
    textAlignVertical: 'center',
    fontFamily: Constants.fontFamily,
  },
  header: {paddingHorizontal: 16, height: 60, justifyContent: 'center'},
});
export default HeaderPreLogin;
