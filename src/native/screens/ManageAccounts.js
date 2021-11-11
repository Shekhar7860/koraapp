import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, TouchableOpacity, View, Alert, Image } from 'react-native';
import { StackActions } from '@react-navigation/native';
import uuid from 'react-native-uuid';
import DeviceInfo from 'react-native-device-info';
import { Q } from '@nozbe/watermelondb';

import { Icon } from '../components/Icon/Icon.js';
import { Text } from '../components/KoraText';
import { getTimeline, normalize } from '../utils/helpers';
import { Avatar } from '../components/Icon/Avatar';
import * as UsersDao from '../../dao/UsersDao';
import { KoraToggleSwitch } from '../components/toggleButton';
import { SvgIcon } from '../components/Icon/SvgIcon.js';
import * as ProfileDao from '../../dao/ProfileDao';
import {
    updateDNDProfile,
    updateProfileIcon,
    refreshImage,
} from '../../shared/redux/actions/auth.action';
import { Header } from '../navigation/TabStacks';
import { ScrollView } from 'react-native-gesture-handler';
import { APP_NAME } from '../utils/AppConstants';
import Attach from '../components/Attachment.js';
import Camera from '../components/CameraModal.js';
import { store } from '../../shared/redux/store';
import userAuth from '../../shared/utils/userAuth.js';
import FileUploadTask from './FileUploader/FileUploadTask.js';
import * as MessagesDao from '../../dao/MessagesDao.js';
import { Loader } from './ChatsThreadScreen/ChatLoadingComponent';
import { ActivityIndicator } from 'react-native-paper';
import AccountManager from '../../shared/utils/AccountManager.js';
import database from '../../native/realm';
import * as Entity from '../../native/realm/dbconstants';
import { ROUTE_NAMES } from '../../native/navigation/RouteNames';



class ManageAccounts extends Component {


    render()
    {
        return(
            <>
            <Header {...this.props} title={'Manage Accounts'} goBack={true} />
            <View style={styles.main}>

            <View style={{minHeight:60,marginBottom:2,flexDirection:'row'}}>
            <View style={styles.camerastyle}>
                  <Icon name="kr-plus" size={normalize(18)} color="white" />
                </View>
            </View>

          </View>
          </>
        );
    }

}

const styles = StyleSheet.create({
    
    main: {
      backgroundColor: '#ffffff',
      flex: 1,
    },
});
const mapStateToProps = (state) => {
    const { auth } = state;
    return {
        // profile: auth.profile,
        image_refresh_mode: auth.image_refresh_mode,
    };
};

export default connect(mapStateToProps, {
   
    refreshImage,
})(withTranslation()(ManageAccounts));
