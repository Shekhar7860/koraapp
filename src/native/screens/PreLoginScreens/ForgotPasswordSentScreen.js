import React from 'react'
import { View, StyleSheet, TextInput, Text, TouchableOpacity, Image,SafeAreaView } from 'react-native'

import HeaderPreLogin from './HeaderPreLogin'

import { useTranslation, withTranslation, } from 'react-i18next';
import { normalize } from '../../utils/helpers';

import * as Constants from '../../components/KoraText';
import BlueButton from './BlueButton';
import EMAIL_ICON from '../../assets/login/signup_email_icon.svg';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import globalStyle from './styles';

class ForgotPasswordSentScreen extends React.Component {

    constructor(props) {
        super(props);



    }
    buttonOnPress = (id) => {
        switch (id) {
            case ROUTE_NAMES.RESET_PASSWORD:

                this.props.navigation.navigate(ROUTE_NAMES.RESET_PASSWORD)
                break;

            default:
                break;
        }
    }
    render() {
        const { t } = this.props;
        return (

            <SafeAreaView style={styles.root}>

                <HeaderPreLogin appName={false} currentScreenName={t('forgotPasswordTitle')}></HeaderPreLogin>
                <View style={globalStyle.globalInnerRootStyle}>
                <View style={styles.innerRoot}>
                    <View style={styles.viewImage}>

                        <View style={styles.emailStyle}>
                            <EMAIL_ICON />
                        </View>
                        <Text style={styles.verficationText}>A link has been sent to your mail address john@gmail.com. Please click it to reset your password. </Text>
                        <Text style={styles.verficationText2}>Be sure to also check your spam folder.</Text>
                        <Text style={styles.resendLink} onPress={() => alert('resend action')} >{t('resendEmail')}</Text>


                    </View>


                    <View style={styles.bottomView}>

                        <Text style={styles.loginLink} onPress={() => alert('resend action')} >{t('backToLogin')}</Text>
                        <BlueButton
                            id={ROUTE_NAMES.RESET_PASSWORD}
                            buttonOnPress={this.buttonOnPress}
                            name={t('openEmail')}

                        />
                    </View>
                </View>
            </View>
            </SafeAreaView>
        );
    }

}
const styles = StyleSheet.create({
    emailStyle: { marginStart: 50 },
    imageStyle: { width: 100, height: 100 },
    viewImage: { alignItems: 'center',},
    innerRoot: { flex: 1, alignItems: 'center' },
    bottomView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },

    loginLink: {
        marginStart: 2,
        fontSize: normalize(18),
        color: '#0D6EFD',
        fontWeight: '400',
        fontSize: normalize(14),
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    resendLink: {
        marginStart: 2,
        fontSize: normalize(18),
        color: '#9AA0A6',
        fontWeight: '400',
        fontSize: normalize(14),
        marginTop: 20,
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    verficationText: {
        marginTop: 20,
        color: '#202124',
        fontWeight: '400',
        fontSize: normalize(16),
        letterSpacing: 0.2,
        textAlign: 'center',
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    verficationText2: {
        marginTop: 10,
        color: '#9AA0A6',
        fontWeight: '400',
        fontSize: normalize(16),
        letterSpacing: 0.2,
        textAlign: 'center',
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    root: {flex: 1, },


});
export default (withTranslation()(ForgotPasswordSentScreen));