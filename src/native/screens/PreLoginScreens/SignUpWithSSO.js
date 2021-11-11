import React from 'react'
import { View, StyleSheet, TextInput, Text, TouchableOpacity,SafeAreaView } from 'react-native'

import HeaderPreLogin from './HeaderPreLogin'


import { normalize } from '../../utils/helpers';
import { useTranslation, withTranslation, } from 'react-i18next';
import * as Constants from '../../components/KoraText';
import BlueButton from './BlueButton';
import globalStyle from './styles';
import KoraKeyboardAvoidingView   from '../../components/KoraKeyboardAvoidingView';

class SignUpWithSSO extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',

        };


    }

    componentDidMount(){
        setTimeout(()=>{
          if(this.inputRef){
            this.inputRef.focus();
          }
        },100);
      }
    render() {
        const { t } = this.props
        return (

            <SafeAreaView style={styles.root}>
            <KoraKeyboardAvoidingView style={styles.root}>
         <View style={styles.root}> 

                <HeaderPreLogin appName={false} currentScreenName={t('signUpWithSSO')}></HeaderPreLogin>

                <View style={globalStyle.globalInnerRootStyle}>
                    <View style={styles.v1}>
                    <View style={styles.inputview}>
                        <TextInput
                          ref={(ref)=>{this.inputRef= ref}}
                            placeholder={t('emailPlaceHolder')}
                            autoCapitalize={'none'}
                            value={this.state.email}
                            keyboardType="email-address"
                            placeholderTextColor="#BDC1C6"
                            underlineColorAndroid="transparent"
                            onChangeText={(text) => {
                                this.setState({ email: text });
                            }}
                            style={styles.username_input}></TextInput>
                    </View>
                    <View style={styles.bottomView}>

                        <Text style={styles.loginLink} onPress={() => alert('login action')} >{t('backToLogin')}</Text>

                        <BlueButton
                            name={t('continueButton')}
                        />



                    </View>
                </View>
                </View>
                </View>
                </KoraKeyboardAvoidingView>
            </SafeAreaView>
        );
    }

}
const styles = StyleSheet.create({
    v1: { flex: 1 },
    bottomView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
       
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
    login_text: {

        color: '#9AA0A6',
        fontWeight: '400',
        fontSize: normalize(14),

        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    root: { flex: 1, },
    inputview: {
        
        marginBottom: normalize(20),

    },
    username_input: {

        fontSize: normalize(16),
        fontStyle: 'normal',
        minHeight: 44,

        width: '100%',
        borderColor: '#BDC1C6',
        backgroundColor: 'white',
        borderWidth: 1,
        padding: 0,
        borderRadius: normalize(4),
        paddingHorizontal: normalize(10),
        fontFamily: Constants.fontFamily,
    },
});
export default (withTranslation()(SignUpWithSSO));