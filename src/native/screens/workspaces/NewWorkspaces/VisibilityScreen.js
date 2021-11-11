import React from 'react';
import {withTranslation} from 'react-i18next';
import {fontFamily, Text} from './../../../components/KoraText';
import {connect} from 'react-redux';
import {
  View,
  StyleSheet,
  Image,
  TouchableHighlight,
  FlatList,
} from 'react-native';
import {Header} from '../../../navigation/TabStacks';
import {setNewWSReqBody} from '../../../../shared/redux/actions/native.action';
import {createWorkspace} from '../../../../shared/redux/actions/workspace.action';
import {navigateAndReset} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {normalize} from '../../../utils/helpers';

const placeholder = require('../../../assets/placeholders/home-placeholder.png');

class VisibilityScreen extends React.Component {
  constructor(props) {
    super();
    const {t} = props;
    this.options = [
      {
        type: 'private',
        name: t('Private'),
        description: t('People need admin permission to join this workspace'),
      },
      {
        type: 'open',
        name: t('Open'),
        description: t(
          'Anyone in your organization can send request to join this workspace.  Workspace admin has to approve',
        ),
      },
      {
        type: 'public',
        name: t('Public'),
        description: t('Anyone in your organization can join this workspace'),
      },
    ];
  }

  VisibilityItemSeparator = ()=> {
    return(
      <View style={styles.visibilitySeparator} />
    );
  }
  renderVisibilityTypes() {
    const Card = ({
      selected = false,
      name = '',
      description = '',
      type = '',
    }) => {
      selected = type === this.props.newWSRequestBody.type;
      return (
        <TouchableHighlight
          underlayColor="#F3F8FF"
          onPress={() => {
            this.props.setNewWSReqBody({type});
          }}
          style={[styles.card, selected ? styles.selected : {}]}>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.cardLogo}>
              <Image style={{width: 30, height: 30}} source={placeholder} />
            </View>
            <View style={{flexShrink: 1}}>
              <Text
                style={{...styles.mediumText, ...styles.cardText, ...styles.cardHeader}}>
                {name}
              </Text>
              <Text style={{...styles.mediumText, ...styles.cardText}}>
                {description}
              </Text>
            </View>
          </View>
        </TouchableHighlight>
      );
    };
    return (
      <FlatList
        data={this.options}
        renderItem={({item}) => {
          return <Card {...item} />;
        }}
        keyExtractor={(item, index) => {
          return item.type || index.toString();
        }}
        ItemSeparatorComponent={this.VisibilityItemSeparator}
      />
    );
  }

  render() {
    const {t} = this.props;
    return (
      <View style={styles.safeAreaStyles}>
        <Header
          title={t('Visibility')}
          goBack={true}
          navigation={this.props.navigation}
          rightContent={
            <Text
              onPress={() => {
                this.props.createWorkspace(this.props.newWSRequestBody, () => {
                  this.props.navigation.goBack();
                  this.props.navigation.goBack();
                  this.props.navigation.goBack();
                  navigateAndReset(ROUTE_NAMES.Workspaces);
                });
              }}
              style={{...styles.mediumText, color: '#0D6EFD'}}>
              {t('Save')}
            </Text>
          }
        />
        <View style={styles.scrollViewStyles}>
          <Text
            style={{...styles.mediumText, color: '#5F6368', marginBottom: 16}}>
            {t('Set the Visibility')}
          </Text>
          {this.renderVisibilityTypes()}
        </View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {native} = state;
  return {
    newWSRequestBody: native.newWSRequestBody,
  };
};

export default connect(mapStateToProps, {setNewWSReqBody, createWorkspace})(
  withTranslation()(VisibilityScreen),
);

const styles = StyleSheet.create({
  cardLogo: {
    width: 76,
    marginLeft: -16,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  visibilitySeparator:{height: 18},
  cardHeader: {fontWeight: '700', marginBottom: 7},
  safeAreaStyles: {flex: 1, backgroundColor: 'white', flexDirection: 'column'},
  scrollViewStyles: {padding: 16, paddingTop: 24},
  mediumText: {fontWeight: '500', fontSize: normalize(16)},
  emojiTextStyle: {
    fontWeight: '400',
    fontSize: normalize(28),
    fontStyle: 'normal',
  },
  textInput: {
    fontFamily: fontFamily,
    fontWeight: '700',
    fontSize: normalize(20),
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  flexOne: {flex: 1},
  emojiContainer: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF0F1',
    borderRadius: 4,
  },
  iconAndNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  card: {
    borderWidth: 0.5,
    borderColor: '#BDC1C6',
    padding: 14,
    paddingEnd: 28,
    borderRadius: 6,
  },
  selected: {
    borderColor: '#126df6',
    backgroundColor: '#F3F8FF',
  },
  cardText: {
    fontWeight: '400',
    color: '#202124',
    flexShrink: 1,
  },
  selectedText: {
    color: '#07377F',
  },
});
