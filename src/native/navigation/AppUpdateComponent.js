import React, {Component} from 'react';
import {StyleSheet, Text, View, Alert, Linking} from 'react-native';
import Dialog from 'react-native-dialog';
import DeviceInfo from 'react-native-device-info';
import {store} from '../../shared/redux/store';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {getAppUpdateDetail} from '../../shared/redux/actions/auth.action';
class AppUpdateComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      data: null,
    };
  }
  componentDidMount() {
    let params = {
      version: DeviceInfo.getReadableVersion(),
      appId: DeviceInfo.getBundleId(),
    };
    store.dispatch(
      this.props.getAppUpdateDetail(params, (response) => {
        if (response && response?.update === true) {
          /*     let data = {
            appId: 'com.kora.android',
            appDescription: 'Upgrade to 1.2.147',
            platform: 'Android',
            version: '1.2.147',
            title: 'Mandatory Update',
            body:
              'A new version of Kora is now available. This is a mandatory update for new features.',
            mandatory: true,
            downloadLink:
              'https://drive.google.com/file/d/1KmmwVuHdEMszV1T1MvCbfz8aiq5faDY7/view?usp=sharing',
          }; */
          this.setState({visible: true, data: response});
          //this.showUpdateAlert(data);
        }
      }),
    );
  }

  UpdatePressed = (link) => {
    try {
      Linking.canOpenURL(link).then((supported) => {
        if (supported) {
          Linking.openURL(link);
        } else {
          console.log('Error while opening : ' + link);
        }
      });
    } catch (e) {}
  };

  render() {
    const title = this.state.data?.title || '';
    const description = this.state.data?.body;
    const downloadLink = this.state.data?.downloadLink;
    const mandatory = this.state.data?.mandatory;
    return (
      <View>
        <Dialog.Container visible={this.state.visible}>
          <Dialog.Title style={styles.titleStyle}>{title}</Dialog.Title>

          <Dialog.Description>{description}</Dialog.Description>
          {mandatory ? (
            <View>
              <Dialog.Button
                label="Update"
                color="#3F51B5"
                onPress={() => this.UpdatePressed(downloadLink)}
              />
            </View>
          ) : (
            <View style={styles.buttons}>
              <Dialog.Button
                label="Not Now"
                onPress={() => this.setState({visible: false})}
              />
              <Dialog.Button
                label="Update"
                color="#3F51B5"
                onPress={() => this.UpdatePressed(downloadLink)}
              />
            </View>
          )}
        </Dialog.Container>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  titleStyle: {alignSelf: 'center', color: 'grey'},
  container: {
    flex: 1,
  },
  buttons: {flexDirection: 'row', justifyContent: 'center'},
});
export default connect(null, {
  // getJWTToken,
  getAppUpdateDetail,
})(withTranslation()(AppUpdateComponent));
