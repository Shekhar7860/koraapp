import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native'
import HeaderPostSignUp from './HeaderPostSignUp';
import globalStyle from './styles';
import { useTranslation, withTranslation, } from 'react-i18next';
import Indicator from './Indicator';
import { normalize } from '../../utils/helpers';
import { connect } from 'react-redux';

import { ROUTE_NAMES } from '../../navigation/RouteNames';
import * as Constants from '../../components/KoraText';
import BottomText from './BottomText';
import GrideStyleView from './GrideStyleView';
import { profilePreference } from '../../../shared/redux/actions/pre-login.action';

class PostSignUpSelectionOne extends React.Component {

    data = [

        {
            name: 'Design'

        },
        {
            name: 'Human Resources'

        }
        , {
            name: 'Operations'

        }
        , {
            name: 'Advertising'

        }, {
            name: 'Finance'

        },
        {
            name: 'IT & support'

        }, {
            name: 'Manufacture'

        }, {
            name: 'Customer Service'

        }, {
            name: 'Sales'

        }, {
            name: 'Software develeopement'

        }, {
            name: 'Others'

        }

    ]

    state = {
        email:'',  
    }

    componentDidMount() {
        let {route} = this.props;
        let emailId = route?.params?.email || null;

        this.setState({
            email:emailId
        });
    
        // setTimeout(() => {
        //   if (this.inputRef) {
        //     this.inputRef.focus();
        //   }
        // }, 100);
      }
    nextButtonPress = (identity) => {
        this.props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_SELECTION_TWO, {
            email: identity,
            currentIndicator:1,
            totalIndicator:4,
        });
    }





    pressSelectedItem = (item) => {
        //alert(item.name)

        //"loginResponse": {"otherAccounts": [], "session": "b1e117b0e01aeee36138", "userAccounts": []}
        let loginResponse = this.props.loginResponse;

        let payload = {
            specs: [item.name]// specialization,
            //"defaultAccountId" : <"acctId">
        };

        let params = {
            payload: payload,
            session: loginResponse?.session,
        }
        this.props.profilePreference(params, (obj) => {
            console.log('obj  =========>:', JSON.stringify(obj));
            //{"status":true,"data":{"identity":"nandhu@sathishchalla.testinator.com","profilePref":{"specs":["Kore"]}}}
            if (obj?.data && obj?.data?.errors) {
                let msg = obj?.data?.errors[0].msg || null;
                if (msg) {
                    alert(msg);
                }
                return;
            }
            this.nextButtonPress(obj?.data?.identity);
        });

        //this.props.profilePreference()
        //this.nextButtonPress();
    }
    signUpPress = () => {
        this.buttonOnPress(ROUTE_NAMES.APP_LANDING_SCREEN)
    }
    loginPress = () => {
        this.buttonOnPress(ROUTE_NAMES.LOGIN_HOME)
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


            default:
                break;
        }

    }
    renderAllAccounts() {

        let view = [];
        for (let i = 0; i < this.data?.length; i++) {
            view.push(
                <TouchableOpacity onPress={() => { this.pressSelectedItem(this.data[i]) }} style={[styles.backgroundAccount, { backgroundColor: i == 0 ? "#E7F1FF" : "#FFFFFF", borderColor: i == 0 ? '#85B7FE' : '#BDC1C6' }]} >
                    <Text style={styles.accountText}>{this.data[i]?.name}</Text>
                </TouchableOpacity>)
        }
        return view;

    }
    render() {

        const { t } = this.props;
        return (
            <SafeAreaView style={styles.root}>

                <HeaderPostSignUp appName={false}
                    nextButton={false}
                />
                <View style={globalStyle.globalInnerRootStyle}>

                    <View style={styles.v1}>

                        <View><Indicator position={1} totalIndicator={4}></Indicator></View>

                        <Text style={styles.nameStyle}>{t('whatIsExpertise')}</Text>
                        <Text style={styles.welcomeStyle}>{t('thisWillHelp')}</Text>


                        <View style={styles.accountRoot}>

                            <GrideStyleView data={this.data} onPressGridItem={this.pressSelectedItem} />
                      
                           
                        </View>
                        <View style={styles.bottomView}>
                            <BottomText email={this.state.email} signUpPress={this.signUpPress} loginPress={this.loginPress} />

                        </View>

                    </View>

                </View>
            </SafeAreaView>

        );

    }
}


const styles = StyleSheet.create({
    bottomView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        position: 'absolute',
        bottom: 0,
        justifyContent: 'flex-start',


    },
    backgroundAccount: {
        minHeight: 40,
        borderRadius: 4,
        marginEnd: 10,
        borderWidth: 1,
        paddingHorizontal: 10,
        justifyContent: 'center',
        marginBottom: 10
    },
    accountRoot: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 40,
    },
    accountText: {
        color: "#5F6368", fontSize: normalize(16),
        fontWeight: '500',
        fontStyle: 'normal',
        letterSpacing: 0.3,
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    root: { flex: 1,backgroundColor:'#FFFFFF' },
    v1: {
        flex: 1,
        justifyContent: 'flex-start'
    },
    nameStyle: {
        marginTop: 30,
        color: '#202124',
        fontWeight: '600',
        fontSize: normalize(18),
     
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
})


const mapStateToProps = (state) => {
    let { auth } = state;
    return {
        user: auth.user,
        loginResponse: auth.loginResponse,
        authorization: auth.authorization,
        laMod: auth.laMod,
    };
};

export default connect(mapStateToProps, {
    profilePreference,
})(withTranslation()(PostSignUpSelectionOne));