import React from 'react'
import { Text, View, StyleSheet, TouchableOpacity, BackHandler } from 'react-native'
import { normalize } from '../../utils/helpers';
import SPLASH_NEW from '../../assets/splash_new.svg';
import APP_LOGO from '../../assets/app_logo.svg';

import * as Constants from '../../components/KoraText';
import BackButton from '../../components/BackButton';
import { Icon } from '../../components/Icon/Icon.js';
import { goBack, isGoBack } from '../../navigation/NavigationService';
class HeaderPostSignUp extends React.Component {

    backPress = () => {

        if (isGoBack()) {
            goBack();
        } else {
            BackHandler.exitApp();
        }
    }
    nextButtonPress = () => {
        if (this.props.nextButtonPress) {
            this.props.nextButtonPress();
        }
        if (this.props.done) {
            this.props.done();
        }
    }
    render() {
        let name = this.props.text || 'Next';
        return (


            <View style={styles.header}>
                {
                    this.props.appName ?

                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <APP_LOGO></APP_LOGO>
                            <Text style={styles.appNameStyle}>WorkAssist</Text>
                        </View>
                        :
                        <View style={styles.btnStyle} >
                            <TouchableOpacity
                                style={styles.backbutton}
                                onPress={this.backPress}
                            >
                                <Icon color={'#202124'} name={this.props.closeIcon ? "Close" : "kr-left_direction"} size={25} />
                            </TouchableOpacity>
                            <Text style={styles.appTextStyle}>
                                {this.props.currentScreenName} </Text>
                            {this.props.nextButton &&
                                <TouchableOpacity
                                    style={styles.nextButton}
                                    onPress={this.nextButtonPress}>
                                    <Text style={styles.nextStyle}>{name}</Text>

                                </TouchableOpacity>
                            }
                        </View>
                }
            </View>

        );
    }

}
const styles = StyleSheet.create({
    btnStyle: { flexDirection: 'row', flex: 1, },
    backbutton: { minWidth: 40, minHeight: 40, justifyContent: 'center', marginStart: -5, },
    nextButton: { minWidth: 40, minHeight: 40, justifyContent: 'center', marginStart: -5, },
    nextStyle: {

        fontSize: normalize(16),
        color: '#0D6EFD',

        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    appNameStyle: {
        marginStart: 5,
        fontSize: normalize(18),
        color: '#202124',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    appTextStyle: {
        fontSize: normalize(18),
        color: '#202124',
        fontWeight: 'bold',

        flex: 1,
        padding: 0,
        marginRight: 20,
        textAlign: 'center',
        alignContent: 'center',
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    header: { paddingHorizontal: 16, height: 60, justifyContent: 'center', }
});
export default HeaderPostSignUp;