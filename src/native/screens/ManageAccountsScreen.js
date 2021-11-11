import React, { Component } from 'react';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, TouchableOpacity, View, Alert, Image, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native';
import { normalize } from '../utils/helpers';
import * as Constants from '../components/KoraText';
import { Icon } from '../components/Icon/Icon';
import { Header } from '../navigation/TabStacks';
import { BottomUpModal } from '../components/BottomUpModal';
import ActionItemBottomSheet from '../components/BottomUpModal/ActionItemBottomSheet';
import { ROUTE_NAMES } from '../../native/navigation/RouteNames';

const sheetIds = {
    SWITCH_ACCOUNT: 'SWITCH_ACCOUNT',
    MAKE_DEFAULT: 'MAKE_DEFAULT',

};

const sheetOptionsList = [
    {
        //don't change this id
        id: sheetIds.SWITCH_ACCOUNT,
        text: 'Switch account',
        icon: 'Refresh',
    },
    {
        id: sheetIds.MAKE_DEFAULT,
        text: 'Make default',
        icon: 'kr-starred',
    },

];
import {
    browseAccount,


    setDefaultAccount
} from '../../shared/redux/actions/pre-login.action';
class ManageAccountsScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            currentSelectedItem: '',
            userAccounts: [],
            currentSelectedAccountId: ''
        };
    }
    data = [
        {
            name: 'Product',
            count: 15,
            color: 'green',
        },
        {
            name: 'Product Manager Product Manager ABC',
            count: 15,
            color: 'pink',
        },
        {
            name: 'Herms',
            count: 15,
            color: 'red',
        },
        {
            name: 'Product',
            count: 15,
            color: 'blue',
        },
    ];

    componentDidMount() {
        this.props.browseAccount((obj) => {
            console.log('obj  =========>:', JSON.stringify(obj));
            //{"status":true,"data":{"identity":"nandhu@sathishchalla.testinator.com","profilePref":{"specs":["Kore"]}}}
            if (obj?.data && obj?.data?.errors) {
                let msg = obj?.data?.errors[0].msg || null;
                if (msg) {
                    alert(msg);
                }
                return;
            }
            this.setState({
                userAccounts: obj?.data?.userAccounts || [],

            });
        });
    }
    getAvatarName(productName) {
        let name = productName?.toUpperCase().split(' ') || '';
        if (name.length === 1) {
            name = `${name[0].charAt(0)}`;
        } else if (name.length > 1) {
            name = `${name[0].charAt(0)}${name[1].charAt(0)}`;
        } else {
            name = '';
        }
        return name;
    }
    headerView() {
        return (
            <Header
                {...this.props}
                title={'Manage accounts'}
                goBack={true}

            />
        );
    }
    itemPress = (item) => {

        this.setState({
            currentSelectedItem: item?.name,
            currentSelectedAccountId: item?.accountId
        })
        this.openSheet();

    };
    renderItem = (props) => {
        const { item } = props;
        console.log(item);
        return (
            <TouchableOpacity
                onPress={() => this.itemPress(item)}
                style={styles.touchStyle}>
                <View style={styles.v1}>
                    <View
                        style={[
                            styles.v2,
                            { backgroundColor: item?.color || '#7027E5' },
                        ]}>
                        <Text style={styles.avatarText}>
                            {this.getAvatarName(item?.name)}
                        </Text>
                    </View>
                    <View style={styles.v3}>
                        <View style={styles.v4}>
                            <Text numberOfLines={1} style={styles.nameText}>
                                {item?.name}
                            </Text>
                            <View style={styles.starView}>
                                <Icon name={'kr-favourite'} size={18} color={'#FFB82D'} />
                            </View>
                        </View>

                    </View>
                    <View>

                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    closeSheet() {
        this.reminderModalRef.closeBottomDrawer();
    }
    openSheet = () => {
        this.reminderModalRef.open();
    };
    broseAccounts = () => {
        this.props.navigation.navigate(ROUTE_NAMES.POST_SIGN_UP_HOME, {
            screen: ROUTE_NAMES.BROWSE_ACCOUNT,
            params: {
                screen: ROUTE_NAMES.BROWSE_ACCOUNT,
                // email: response?.loginResponse?.emailId,
            },
        });
    };
    optionSelected = (id) => {
        switch (id) {
            case sheetIds.MAKE_DEFAULT:
                let payLoad = { defaultAccountId: this.state.currentSelectedAccountId }
                this.props.setDefaultAccount(payLoad, (obj) => {
                    console.log('obj  =========>:', JSON.stringify(obj));
                    //{"status":true,"data":{"identity":"nandhu@sathishchalla.testinator.com","profilePref":{"specs":["Kore"]}}}
                    if (obj?.data && obj?.data?.errors) {
                        let msg = obj?.data?.errors[0].msg || null;
                        if (msg) {
                            alert(msg);
                        }
                        return;
                    }
                    if (obj.status === true && obj.data?.success === true) {

                    }

                });

                break;
            case sheetIds.SWITCH_ACCOUNT:
                break;
        }
    }
    renderSheet() {
        return (
            <BottomUpModal
                ref={(reminderModalRef) => (this.reminderModalRef = reminderModalRef)}
                height={480}>
                <View style={styles.bottomUpModal4} />
                <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                    <View
                        style={[
                            styles.v2,
                            { backgroundColor: '#7027E5', marginStart: 20 },
                        ]}>
                        <Text style={styles.avatarText}>
                            {this.getAvatarName(this.state.currentSelectedItem || '')}
                        </Text>
                    </View>

                    <ActionItemBottomSheet title={this.state.currentSelectedItem} itemType={'header'} />
                </View>
                <View
                    style={{
                        height: 1,
                        backgroundColor: '#EFF0F1',
                    }}></View>
                {sheetOptionsList.map((option) => (
                    <ActionItemBottomSheet
                        title={option.text}
                        iconName={option.icon}
                        id={option.id}
                        optionSelected={this.optionSelected}></ActionItemBottomSheet>
                ))}
            </BottomUpModal>
        );
    }
    footerView = () => {

        return (
            <View style={{ marginTop: 20, marginBottom: 20 }}>
                <TouchableOpacity style={styles.button}>
                    <Text style={styles.buttonText}>Create a new account</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={this.broseAccounts}>
                    <Text style={styles.buttonText}>Browse accounts</Text>
                </TouchableOpacity>
            </View>
        );
    }
    render() {
        return (
            <SafeAreaView style={{ flex: 1 }}>
                {this.renderSheet()}
                {this.headerView()}
                <View style={{ backgroundColor: '#EFF0F1', flex: 1 }}>


                    <FlatList data={this.state.userAccounts || []} renderItem={this.renderItem}
                        ListFooterComponent={() => this.footerView()}

                        nestedScrollEnabled={true} />



                </View>



            </SafeAreaView>
        );
    }

}


const styles = StyleSheet.create(
    {
        avatarText: {
            color: '#FFFFFF',
            padding: 0,
            alignSelf: 'center',
            textAlign: 'center',
            fontWeight: '600',
            fontSize: normalize(12),
            fontStyle: 'normal',
            fontFamily: Constants.fontFamily,
        },
        touchStyle: {
            borderColor: '#E4E5E7',
            backgroundColor: '#F8F9FA',


            minHeight: 60,
            marginBottom: 1,
        },
        starView: { marginTop: 2, justifyContent: 'center', },
        button: {
            minHeight: 60, justifyContent: 'center', marginVertical: 1,
            backgroundColor: 'white', paddingHorizontal: 16
        }
        ,
        buttonText: {
            fontSize: normalize(16),
            color: '#202124',
            fontWeight: '400',
            fontStyle: 'normal',
            textAlignVertical: 'center',
            fontFamily: Constants.fontFamily,
        }, v1: {
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,

            paddingHorizontal: 16
        }, v2: {
            width: 24,
            height: 24,

            borderRadius: 20,
            backgroundColor: 'green',
            alignItems: 'center',
            justifyContent: 'center',
        }, v3: { flex: 1, marginStart: normalize(16) },
        v4: { flexDirection: 'row', alignItems: 'center' },
        nameText: {
            color: '#000000',
            fontWeight: '600',
            fontSize: normalize(16),
            fontStyle: 'normal',
            paddingVertical: 2,
            textAlignVertical: 'center',
            fontFamily: Constants.fontFamily,
            marginEnd: 5,
            flex: 1,

            padding: 0,
            alignSelf: 'center'
        },
    }
)
export default connect(null, {
    browseAccount,
    setDefaultAccount
})(withTranslation()(ManageAccountsScreen));