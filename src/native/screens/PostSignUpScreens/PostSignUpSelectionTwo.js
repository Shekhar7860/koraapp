import React from 'react'
import { View, Text, StyleSheet, TextInput,SafeAreaView,TouchableOpacity,Dimensions  } from 'react-native'
import HeaderPostSignUp from './HeaderPostSignUp';
import globalStyle from './styles';
import { useTranslation, withTranslation, } from 'react-i18next';
import Indicator from './Indicator';
import BottomText from './BottomText';
import { normalize } from '../../utils/helpers';
import { Icon } from '../../components/Icon/Icon.js';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import * as Constants from '../../components/KoraText';
import GrideStyleView from './GrideStyleView';
import KoraKeyboardAvoidingView   from '../../components/KoraKeyboardAvoidingView';
import { ScrollView } from 'react-native-gesture-handler';
const screenHeight = Dimensions.get('window').height;
class PostSignUpSelectionTwo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            accountName: '',
            email:'',
            currentIndicator:0,
            totalIndicator:0
        };


    }

    componentDidMount() {
        let {route} = this.props;
        let emailId = route?.params?.email || null;
        this.setState({
            email: emailId,
            currentIndicator:(route?.params?.currentIndicator+1),
            totalIndicator:route?.params?.totalIndicator
        });
    
        setTimeout(() => {
          if (this.inputRef) {
            this.inputRef.focus();
          }
        }, 100);
      }
  
      clearText=()=>{
        setTimeout(() => {
            if (this.inputRef) {
              this.inputRef.clear();
              this.setState({accountName:''})
            }
          }, 100);
      }
      isValidDetails = (name) => {
        const {t} = this.props;
        let staObj = {
          msz: '',
          isValid: false,
        };
       
        if (!name) {
          staObj.msz = t('valid_name_msz');
          return staObj;
        }
        if (name === '' || name.trim().length === 0) {
          staObj.msz = t('empty_name_msz');
          return staObj;
        }
        
        staObj.isValid = true;
        return staObj;
      };

    nextButtonPress = () => {
        let name= this.state.accountName;
        console.log('name :', name);
        let obj= this.isValidDetails(name);
        if(!obj.isValid){
            alert(obj.msz);
            return;
        }
        
        this.props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_SELECTION_THREE,{
            accountName:name,
            email: this.state.email,
           
            currentIndicator:this.state.currentIndicator,
            totalIndicator:this.state.totalIndicator,
        });
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
    pressSelectedItem = (item) => {

        this.setState({ accountName: item.name })
    }
    data = [

        {
            name: 'Design'

        },
        {
            name: 'Kore.ai'

        }
        , {
            name: 'Design Ninja'

        }];


    setAccountState = (text) => {
        this.setState({ accountName: text })
    }
    render() {
        const { t } = this.props;

        return (
            <SafeAreaView style={[styles.root,{minHeight: screenHeight}]}>
           <ScrollView
            style={{minHeight: screenHeight}}
                >
         <View style={[styles.root,{minHeight: screenHeight}]}> 

                <HeaderPostSignUp appName={false}
                    nextButtonPress={this.nextButtonPress}
                    nextButton={true} />
                <View style={globalStyle.globalInnerRootStyle}>

                    <View style={styles.v1}>
                        <View>
                            <Indicator position={this.state.currentIndicator} totalIndicator={this.state.totalIndicator}></Indicator>
                        </View>
                        <Text style={styles.nameStyle}>{t('giveYoutAccount')}</Text>
                        <Text style={styles.welcomeStyle}>{t('giveYoutAccountDesc')}</Text>

                        <Text style={styles.accTextStyle}>{t('accountName')}</Text>
                        <View style={styles.inputview}>
                            <TextInput
                            ref={(ref)=>{this.inputRef= ref}}
                                placeholder={t('accountName')}
                                value={this.state.accountName}
                                autoCapitalize={'none'}
                                placeholderTextColor="#BDC1C6"
                                underlineColorAndroid="transparent"
                                onChangeText={this.setAccountState}
                                style={styles.username_input}></TextInput>

                        {this.state.accountName?.length>0&&
                        <TouchableOpacity
                                style={{minHeight:40,minWidth:40,justifyContent:'center',alignItems:'center'}}
                                onPress={this.clearText}
                            >
                                <Icon color={'#202124'} name="close" size={16} />
                            </TouchableOpacity>
                            }
                        </View>

                        <View style={styles.suggestionView}>
                            <Icon color={'#9AA0A6'} name="Tip" size={16} />
                            <Text style={styles.suggTextStyle}>{t('nameSuggestion')}</Text>
                        </View>
                        <View style={styles.gridStyle}>
                            <GrideStyleView
                                data={this.data}
                                onPressGridItem={this.pressSelectedItem}
                                textStyle={{ color: '#07377F' }}
                                backgroundStyle={{ borderColor: '#85B7FE', backgroundColor: '#E7F1FF' }} />
                        </View>
                        <View style={styles.bottomView}>
                            <BottomText email={this.state.email} signUpPress={this.signUpPress} loginPress={this.loginPress} />

                        </View>
                    </View>
                </View>
                </View>
                </ScrollView>
            </SafeAreaView>

        );

    }
}


const styles = StyleSheet.create({
    gridStyle: { marginVertical: 5,flex:1 },
    suggestionView: { marginTop: 20,marginBottom:5, flexDirection: 'row', alignItems: 'center', },
    inputview: {
        marginVertical: normalize(5),
        flexDirection:'row',
      
        borderColor: '#BDC1C6',
        backgroundColor: 'white',
        borderWidth: 1,
        justifyContent:'center',
        alignItems:'center',
        borderRadius: normalize(4),
        paddingStart: normalize(10),
    },
    username_input: {
        fontSize: normalize(16),
        fontStyle: 'normal',
        minHeight: 44,
        fontWeight:'400',
        width: '100%',
        textAlignVertical:'center',
        padding: 0,
        flex:1,
    
        
        fontFamily: Constants.fontFamily,
    },
    root: { flex: 1,backgroundColor:'#FFFFFF' },
    bottomView: {
        width: '100%',
        justifyContent: 'center',
        alignItems: 'flex-start',
        bottom: 0,
        justifyContent: 'flex-start',
    },
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
    accTextStyle: {
        marginTop: 30,
        color: '#202124',
        fontWeight: '500',
        fontSize: normalize(14),
    
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    suggTextStyle: {

        color: '#BDC1C6',
        fontWeight: '400',
        fontSize: normalize(16),
        marginStart: 8,
        padding: 0,
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    welcomeStyle: {
        marginTop: 10,
        color: '#5F6368',
        fontWeight: '400',
        fontSize: normalize(18),
        letterSpacing: 0.1,
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
})

export default (withTranslation()(PostSignUpSelectionTwo));