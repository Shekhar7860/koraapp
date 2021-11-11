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
import { RoomAvatar } from '../../components/RoomAvatar';
import { Icon } from '../../components/Icon/Icon.js';

import {
    getCurrentScreenName,
    navigateAndReset,
} from '../../navigation/NavigationService';
import { ScrollView } from 'react-native-gesture-handler';
class RequestAccessScreen extends React.Component {

    onButtonClick = () => {

        if (this.props.onButtonClick) {
            this.props.onButtonClick();
        }

    }

    render() {
        const { t, title, descpription, path, buttonName } = this.props;
        return (
            <SafeAreaView style={styles.root}>
                <ScrollView style={styles.root}>
                    <View style={globalStyle.globalInnerRootStyle}>
                        <ImageBackground source={require('../../assets/login/welcome_background.png')} resizeMode="contain" style={styles.image}>
                            <View style={{ justifyContent: 'center', marginTop: 40, alignItems: 'center' }}>
                                <Image source={require('../../assets/login/welcome_sub.png')} />
                            </View>

                            <View>

                                <Text style={styles.welcomeStyle}>{t('request_submitted')}</Text>
                            </View>

                            <View style={styles.v6}>

                                <View style={styles.v7}>
                                    <RoomAvatar boardIcon={''} size={32} />
                                </View>
                                <View style={styles.v8}>
                                    <Text style={styles.nameStyle} numberOfLines={1}>Mona Kane</Text>
                                    <Text style={styles.AccoyntNameStyle} numberOfLines={1}>Account admin</Text>
                                </View>

                                <TouchableOpacity style={styles.v9}
                                >
                                    <Icon color={'#202124'} name="kr-copy-clone" size={18} />
                                </TouchableOpacity>
                            </View>

                            <View style={styles.r3}>
                                <View style={styles.line_view}></View>
                                <Text style={styles.orview}>{t('meanwhile')}</Text>
                                <View style={styles.line_view}></View>
                            </View>

                            <View style={styles.buttonSpace}>
                                <BlueButton

                                    buttonOnPress={this.onButtonClick}
                                    name={t('create_newAccount')}
                                />

                                <TouchableOpacity style={styles.buttonStyle}>
                                    <Text style={styles.textStyle}>{t('browse_other_accounts')}</Text>
                                </TouchableOpacity>
                            </View>
                        </ImageBackground>
                    </View>
                </ScrollView>
            </SafeAreaView>

        );
    }

}
const styles = StyleSheet.create({
    v9: { minWidth: 40, height: 40, justifyContent: 'center', alignItems: 'flex-end' },
    v8: { flex: 1, justifyContent: 'center' },
    v7: { minWidth: 32, justifyContent: 'center', marginEnd: 10 },
    v6: { paddingVertical: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: '#BDC1C6', minHeight: 64, borderRadius: 4, marginTop: 40, flexDirection: 'row' },
    r3: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', minHeight: 30, marginTop: 40, marginBottom: 20 },
    orview: {
        fontSize: normalize(14),
        color: '#BDC1C6',
        fontWeight: '400',
        paddingHorizontal: 5,
        textAlignVertical: 'center',
        minHeight: 30,

        justifyContent: 'center',
        fontStyle: 'normal',
        fontFamily: Constants.fontFamily,
    },
    line_view: { width: 20, backgroundColor: '#BDC1C6', height: 1 },


    buttonStyle: {
        marginTop: 12,
        width: '100%',

        minHeight: normalize(44),
        borderColor: '#BDC1C6',
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center'
    },
    textStyle: {
        fontWeight: '500',
        paddingHorizontal: 20,
        fontStyle: 'normal', fontSize: normalize(16), color: "#202124", justifyContent: 'center', textAlign: 'center', textAlignVertical: 'center'
    },
    root: { flex: 1, paddingVertical: 10, backgroundColor: '#FFFFFF' },
    container: {
        flex: 1,
    },
    image: {
        flex: 1,

    },
    buttonSpace: { width: '100%', },

    nameStyle: {
        color: '#202124',
        fontWeight: '500',
        fontSize: normalize(16),
        alignSelf: 'flex-start',
        textAlign: 'center',

        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    AccoyntNameStyle: {
        color: '#9AA0A6',
        fontWeight: '500',
        fontSize: normalize(12),
        alignSelf: 'flex-start',
        textAlign: 'center',

        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },


    welcomeStyle: {
        marginTop: 40,
        color: '#202124',
        fontWeight: '500',
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
})(withTranslation()(RequestAccessScreen));