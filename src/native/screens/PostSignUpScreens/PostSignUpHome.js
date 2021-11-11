import React from 'react'
import { StyleSheet, View, Text,SafeAreaView } from 'react-native'

import { useTranslation, withTranslation, } from 'react-i18next';
import { normalize } from '../../utils/helpers';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import * as Constants from '../../components/KoraText';
import HeaderPostSignUp from './HeaderPostSignUp';
import globalStyle from './styles';
import BlueButton from '../PreLoginScreens/BlueButton'
import BottomText from './BottomText';

class PostSignUpHome extends React.Component {

    state = {
        email:'',  
    }

    componentDidMount(){
        if (this.props?.route?.params) {
           let emailId = this.props?.route?.params.params.emailId;

            console.log("PostSignUpHome this.email  ------->: ",emailId);
            this.setState({
                email:emailId,
            });
          }
    }
 

    buttonOnPress = (key) => {
        switch (key) {
            case ROUTE_NAMES.LOGIN_HOME:
                this.props.navigation.replace(ROUTE_NAMES.LOGIN, 
                    {
                        screen:ROUTE_NAMES.LOGIN_HOME
                    })
             //   this.props.navigation.navigate(ROUTE_NAMES.LOGIN_HOME)
                break;
            case ROUTE_NAMES.APP_LANDING_SCREEN:
                this.props.navigation.replace(ROUTE_NAMES.LOGIN, 
                    {
                        screen:ROUTE_NAMES.APP_LANDING_SCREEN
                    })
                break;
            case ROUTE_NAMES.POST_SIGN_UP_SELECTION_ONE:
                this.props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_SELECTION_ONE,{
                    email:this.state.email,
                });
                break;

            default:
                break;
        }

    }
    render() {
        const { t } = this.props;
        return (

            <SafeAreaView style={styles.root}>

                <HeaderPostSignUp appName={true} />
                <View style={globalStyle.globalInnerRootStyle}>
                    <View style={styles.v1}>

                        <View style={styles.bottomView}>

                           {/*  <Text style={styles.nameStyle}>John</Text> */}
                            <Text style={styles.welcomeStyle}>{t('welcomeMessage')}</Text>


                            <View style={styles.buttonSpace}>
                                <BlueButton
                                    id={ROUTE_NAMES.POST_SIGN_UP_SELECTION_ONE}
                                    buttonOnPress={this.buttonOnPress}
                                    name={t('letsStart')}
                                />
                            </View>
                            <BottomText email={this.state.email} signUpPress={this.signUpPress} loginPress={this.loginPress} />
                        </View>

                    </View>

                </View>

            </SafeAreaView>

        );
    }

}
const styles = StyleSheet.create({
    buttonSpace: { marginVertical: 60 },

    root: { flex: 1, },


    nameStyle: {

        color: '#202124',
        fontWeight: '600',
        fontSize: normalize(18),
     
        textAlign: 'center',
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    welcomeStyle: {
        marginTop: 10,
        color: '#5F6368',
        fontWeight: '400',
        fontSize: normalize(18),
      

        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    v1: { flex: 1, },
    bottomView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'absolute',
        bottom: 0,
        justifyContent: 'flex-start',


    },
});
export default (withTranslation()(PostSignUpHome));