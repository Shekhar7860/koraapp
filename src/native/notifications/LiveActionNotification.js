import React from 'react';
import {View} from 'react-native';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {getKoraProfile} from '../../shared/redux/actions/auth.action';

class LiveActionNotification extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {}

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.liveNotificationResp !== this.props.liveNotificationResp) {
      const entity = this.props.liveNotificationResp?.entity;
      const action = this.props.liveNotificationResp?.action;
      const data = this.props.liveNotificationResp?.action;

      if (action === 'update') {
        switch (entity) {
          case 'profile':
            this.props.getKoraProfile();
            break;

          default:
            break;
        }
      }
    }
  }

  render() {
    return <View />;
  }
}

const mapStateToProps = (state) => {
  const {notification} = state;
  return {
    liveNotificationResp: notification?.liveNotificationResp,
  };
};
export default connect(mapStateToProps, {
  getKoraProfile,
})(withTranslation()(LiveActionNotification));
