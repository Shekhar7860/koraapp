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
class UiComponent extends React.Component {

    onButtonClick = () => {

        if (this.props.onButtonClick) {
            this.props.onButtonClick();
        }

    }

    render() {
        const { t, title, descpription, path, buttonName } = this.props;
        return (

            <ImageBackground source={require('../../assets/login/welcome_background.png')} resizeMode="contain" style={styles.image}>
                <View style={{ justifyContent: 'center', marginTop: 80, alignItems: 'center' }}>
                    <Image source={path} />
                </View>

                <View>
                    <Text style={styles.nameStyle}>{title}</Text>
                    <Text style={styles.welcomeStyle}>{descpription}</Text>
                </View>
                <View style={styles.buttonSpace}>
                    <BlueButton
                        id={ROUTE_NAMES.POST_SIGN_UP_SELECTION_ONE}
                        buttonOnPress={this.onButtonClick}
                        name={buttonName}
                    />
                </View>
            </ImageBackground>

        );
    }

}
const styles = StyleSheet.create({
    root: { flex: 1, paddingVertical: 20 },
    container: {
        flex: 1,
    },
    image: {
        flex: 1,

    },
    buttonSpace: { marginVertical: 40, alignSelf: 'center', maxWidth: 180, alignItems: 'center' },
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

export default connect(null, {
    signup,
})(withTranslation()(UiComponent));