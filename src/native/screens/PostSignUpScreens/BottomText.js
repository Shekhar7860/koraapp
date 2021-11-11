import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTranslation, withTranslation, } from 'react-i18next';
import { normalize } from '../../utils/helpers';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import * as Constants from '../../components/KoraText';
class BottomText extends React.Component {

    signUpPress = () => {
        if(this.props.signUpPress)
        {
            this.props.signUpPress();
        }  
    }
    loginPress = () => {
       if(this.props.loginPress)
       {
           this.props.loginPress();
       }
    }
    render() {
        const { t } = this.props;
        return (
            <Text style={styles.bottomText}>{t('signUpBottomText', { email: this.props?.email })}
                <Text onPress={this.signUpPress} style={[styles.bottomText, styles.boldFont]}>{t('signUp') + '. '}</Text>
                {t('alreadyHaveAnAccount')} <Text onPress={this.loginPress} style={[styles.bottomText, styles.boldFont]}>{t('loginButton') + '. '}</Text>
            </Text>
        )
    }

}
const styles = StyleSheet.create({
    boldFont: { 
        fontStyle: 'normal',
        fontSize: normalize(14),
    fontFamily: Constants.fontFamily, 
    color:'#9AA0A6',
    fontWeight: '600' },
    bottomText: {

        color: '#9AA0A6',
        fontWeight: '400',
        fontSize: normalize(14),
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
        color:'#9AA0A6',
    },
});
export default (withTranslation()(BottomText));