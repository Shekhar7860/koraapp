import React from 'react';
import {
  Text,
  View,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import HeaderPostSignUp from './HeaderPostSignUp';
import globalStyle from './styles';
import BlueButton from '../PreLoginScreens/BlueButton';
import {useTranslation, withTranslation} from 'react-i18next';
import UserAvatar from '../../components/Library/react-native-user-avatar/src';
import {normalize} from '../../utils/helpers';
import * as Constants from '../../components/KoraText';
import ColorView from './ColorView';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {goBack, navigationRef} from '../../navigation/NavigationService';
class ColorSelectionScreen extends React.Component {
  colorsList = ['#7027E5', '#FF784B', '#FFDA2D', '#DD3646', '#28A745'];

  state = {
    color: 'blue',
  };

  componentDidMount() {
    let {route} = this.props;
    let color = route?.params?.color || 'red';
    this.setState({
      color: color,
    });
    console.log('ColorSelectionScreen data', color);
  }

  onColorPress = () => {};

  render() {
    const {t} = this.props;
    return (
      <SafeAreaView style={styles.root}>
        <HeaderPostSignUp appName={false} nextButton={false} />
        <View style={globalStyle.globalInnerRootStyle}>
          <View style={styles.viewAvatar}>
            <TouchableOpacity>
              <UserAvatar
                color={this.state.color}
                name={this.props.route?.params?.accountName}
                size={normalize(120)}
                borderRadius={100}
                textStyle={styles.avatarText}
              />
            </TouchableOpacity>
          </View>

          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              marginVertical: 40,
            }}>
            <View
              style={{
                flexDirection: 'row',

                alignItems: 'center',

                justifyContent: 'center',
                flexWrap: 'wrap',
              }}>
              {this.colorsList.map((color) => {
                return (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({color: color});
                    }}
                    style={{marginHorizontal: 10, marginBottom: 30}}>
                    <ColorView color={color} selectedColor={this.state.color} />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <BlueButton
            id={'back'}
            buttonOnPress={() => {
              this.props.route?.params?.updateDataColor(this.state.color);
              goBack();
            }}
            name={t('Done')}
          />
        </View>
      </SafeAreaView>
    );
  }
}

export default withTranslation()(ColorSelectionScreen);
const styles = StyleSheet.create({
  viewAvatar: {width: '100%', alignItems: 'center', marginTop: 50},

  avatarText: {
    color: '#FFFFFF',
    padding: 0,
    alignSelf: 'center',
    textAlign: 'center',
    fontWeight: '200',
    fontSize: normalize(60),
    fontStyle: 'normal',
    textAlignVertical: 'center',
    alignSelf: 'center',
    fontFamily: Constants.fontFamily,
  },
  root: {flex: 1},
});
