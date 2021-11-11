import React from 'react'
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native'
import HeaderPostSignUp from './HeaderPostSignUp';
import globalStyle from './styles';
import { useTranslation, withTranslation, } from 'react-i18next';
import Indicator from './Indicator';
import BottomText from './BottomText';
import { normalize } from '../../utils/helpers';
import { Icon } from '../../components/Icon/Icon.js';
import { ROUTE_NAMES } from '../../navigation/RouteNames';
import * as Constants from '../../components/KoraText';
class GrideStyleView extends React.Component {

    pressSelectedItem = (item) => {
        if (this.props.onPressGridItem) {
            this.props.onPressGridItem(item);
        }
    }

    renderAllAccounts() {

        let view = [];
        for (let i = 0; i < this.props.data?.length; i++) {
            view.push(
                <TouchableOpacity onPress={() => { this.pressSelectedItem(this.props.data[i]) }} style={[styles.backgroundAccount, { backgroundColor: "#FFFFFF", borderColor: '#BDC1C6' }, this.props.backgroundStyle]} >
                    <Text style={[styles.accountText, this.props.textStyle]}>{this.props.data[i]?.name}</Text>
                </TouchableOpacity>)
        }
        return view;

    }

    render() {
        return (

            <View style={styles.accountRoot}>

                {this.renderAllAccounts()}
            </View>
        );
    }
}
const styles = StyleSheet.create({
    backgroundAccount: {
        minHeight: 40,
        borderRadius: 4,
        marginEnd: 10,
        borderWidth: 1,
        paddingHorizontal: 10,
        justifyContent: 'center',
        marginBottom: 10
    },
    accountText: {
        color: "#5F6368", fontSize: normalize(16),
        fontWeight: '500',
        fontStyle: 'normal',
        
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    },
    accountRoot: {
        flexDirection: 'row',
        flexWrap: 'wrap',

    },
});
export default (withTranslation()(GrideStyleView));