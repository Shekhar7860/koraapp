import React from 'react';
import {
    View,
    StyleSheet,
    TextInput,
    Text,
    TouchableOpacity,
    SafeAreaView,
    Alert,
    Image,
    ImageBackground,
    Keyboard,
} from 'react-native';

import { connect } from 'react-redux';
import { CommonActions } from '@react-navigation/native';
import { signinValidate } from '../PreLoginScreens/SigninValidate';
import { useTranslation, withTranslation } from 'react-i18next';

import { normalize } from '../../utils/helpers';
import { NavigationActions } from 'react-navigation';
import * as Constants from '../../components/KoraText';

import { ROUTE_NAMES } from '../../navigation/RouteNames';
import globalStyle from './styles';
import { signup } from '../../../shared/redux/actions/pre-login.action';
import BlueButton from '../PreLoginScreens/BlueButton';
import KoraKeyboardAvoidingView from '../../components/KoraKeyboardAvoidingView';
import {
    getCurrentScreenName,
    navigateAndReset,
} from '../../navigation/NavigationService';
import UiComponent from './UiComponent';
class WelComeScreen extends React.Component {

    onButtonClick = () => {
        
        let userInfo = this.props.user;
        let authorization = this.props.authorization;
        let loginResponse = this.props.loginResponse;
        // signinValidate(this.props, { userInfo, authorization, loginResponse });
        if (userInfo && loginResponse && authorization) {
            signinValidate(this.props, { userInfo, authorization, loginResponse });
        }

    }

    render() {
        const { t } = this.props;
        return (
            <SafeAreaView style={styles.root}>
                <View style={globalStyle.globalInnerRootStyle}>

                    <UiComponent
                    title={t('welcome_assist')}
                    descpription={t('welcome_message')}
                    path={require('../../assets/login/welcome_sub.png')}
                    buttonName={t('letsStart')}
                    onButtonClick={this.onButtonClick}
                   />
                    </View>
            </SafeAreaView>
        );
    }

}
const styles = StyleSheet.create({
    root: { flex: 1, paddingVertical: 20,backgroundColor:'#FFFFFF' },
    container: {
        flex: 1,
    },
    image: {
        flex: 1,

    },
    nameStyle: {
        marginTop: 40,
        color: '#202124',
        fontWeight: '600',
        fontSize: normalize(18),


        fontStyle: 'normal',
        alignSelf: 'center',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    welcomeStyle: {
        marginTop: 10,
        color: '#202124',
        fontWeight: '400',
        fontSize: normalize(18),
        alignSelf: 'center',
        textAlign: 'center',

        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
});
const mapStateToProps = (state) => {
    let { login, auth, language } = state;
    return {
        user: auth.user,
        loginResponse: auth.loginResponse,
        pwdLogin: login.passwordLoginUser,
        authorization: auth.authorization,
        laMod: auth.laMod,
        // language,
    };
};
export default connect(mapStateToProps, {
    signup,
})(withTranslation()(WelComeScreen));