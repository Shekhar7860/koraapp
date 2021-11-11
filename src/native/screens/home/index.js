import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {StyleSheet, View} from 'react-native';

import {
  // getJWTToken,
  // helpSkillSuggestion,
  getAppPermissions,
} from '../../../shared/redux/actions/home.action';
// import {
//   // userLogStatus,
//   // getTimestamp,
// } from '../../../shared/redux/actions/userLog.action';

import langi18 from '../../../shared/utils/i18';
import Placeholder from '../../components/Icon/Placeholder';

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidUpdate(prevProps) {
    // if (prevProps.permissions !== this.props.permissions) {
    //   this.props.getJWTToken();
    // }

    // if (prevProps.jwt !== this.props.jwt) {
    //   botClient.initializeBotClient(this.props.jwt, this.props?.permissions?.applicationControl, this.props.timeStamp);
    // }
  }

  componentDidMount() {
    this.props.getAppPermissions();
    // this.props.getKoraProfile();
    // this.props.getHelpThunderbolt();
  }

  langi18() {
    return langi18;
  }

  render() {
    return (
      <View style={styles.container}>
        <Placeholder name="home" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:"white"
  },
});

const mapStateToProps = (state) => {
  const {home} = state;

  return {
    // jwt: home.jwt,
    showLoader: home.showLoader,
    // profile: auth.profile,
    permissions: home.permissions,
    // timestamp: userLogStatus.timeStamp,
    // presence: home.presence,
    // thunderBoltResp: home.thunderBoltResp,
    // helpData:
    //   home.thunderBoltResp &&
    //   home.thunderBoltResp.thunderbolt &&
    //   home.thunderBoltResp.thunderbolt.help.resources,
    
  };
};

export default connect(mapStateToProps, {
  // getJWTToken,
  // getKoraProfile,
  // userLogStatus,
  // getTimestamp,
  // getHelpThunderbolt,
  // helpSkillSuggestion,
  getAppPermissions,
})(withTranslation()(HomeScreen));
