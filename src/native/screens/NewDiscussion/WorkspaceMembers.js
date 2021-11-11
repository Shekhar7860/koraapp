import React, {Component} from 'react';
import {View, FlatList, StyleSheet, Text} from 'react-native';
import {Header} from '../../navigation/TabStacks';
import {connect} from 'react-redux';
import {getAllWSMembers} from '../../../shared/redux/actions/workspace.action';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {Avatar} from '../../components/Icon/Avatar';
import {withTranslation} from 'react-i18next';
import {normalize} from '../../utils/helpers';
import * as Constants from '../../components/KoraText';
import {SafeAreaView} from 'react-navigation';
import {Loader} from '../ChatsThreadScreen/ChatLoadingComponent';

class WorkspaceMembersScreen extends Component {
  constructor(props) {
    super();
    this.state = {loader: true};
  }

  componentDidMount() {
    if (this.wsId) {
      this.props.getAllWSMembers(this.wsId);
    }
  }
  componentDidUpdate(prevProps) {
    if (prevProps.activeWsMembers !== this.props.activeWsMembers) {
      this.setState({loader: false});
    }
  }

  get wsId() {
    return this.props.route.params.wsId || '';
  }

  get wsMembers() {
    return this.props.activeWsMembers || '';
  }

  render() {
    const {t} = this.props;
    return (
      <SafeAreaView style={styles.safeAreaStyle}>
        <View style={styles.headerStyle}>
          <Header
            {...this.props}
            title={`${this.props.route.params.wsName} members`}
            goBack={true}
          />
        </View>
        {!this.state.loader ? (
          <FlatList
            data={this.wsMembers}
            style={styles.listStyle}
            horizontal={false}
            removeClippedSubviews={true}
            renderItem={({item}) => {
              let name = item?.fN + ' ' + item?.lN;
              //let wsRole = '';
              // if (item?.role.name === 'wsowner') {
              //   wsRole = t('Owner');
              // } else {
              //   wsRole = t('Member');
              // }
              return (
                <View style={styles.view1}>
                  <Avatar
                    profileIcon={item?.icon}
                    userId={item?.id}
                    name={item?.fN}
                    color={item?.color}
                  />
                  <View style={styles.view3}>
                    <Text style={styles.nameTextStyle}>{name}</Text>
                    <Text style={styles.emailIdTextStyle}>{item?.emailId}</Text>
                  </View>
                  {/* <View style={styles.view2}>
                  <Text style={styles.roleText}>{wsRole}</Text>
                </View> */}
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
          />
        ) : (
          <Loader />
        )}
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  safeAreaStyle: {backgroundColor: '#ffffff', flex: 1},
  headerStyle: {backgroundColor: '#ffffff'},
  listStyle: {marginTop: 10, bottom: 10},
  view1: {
    borderBottomColor: '#EFF0F1',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  view2: {
    alignItems: 'flex-end',
    flex: 1,
  },
  view3: {flexDirection: 'column', marginLeft: 10},
  nameTextStyle: {
    fontWeight: '500',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    paddingVertical: 2,
    color: '#292929',
  },
  emailIdTextStyle: {
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#5F6368',
    paddingVertical: 1.5,
  },
  roleText: {fontSize: normalize(14), color: '#5F6368'},
});
const mapStateToProps = (state) => {
  const {workspace} = state;
  return {
    activeWsMembers: workspace.activeWsMembers?.members || emptyArray,
  };
};

export default connect(mapStateToProps, {getAllWSMembers})(
  withTranslation()(WorkspaceMembersScreen),
);
