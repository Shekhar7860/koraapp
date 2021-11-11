import React from 'react';
import {withTranslation} from 'react-i18next';
import {fontFamily, Text} from './../../../components/KoraText';
import {connect} from 'react-redux';
import {View, StyleSheet, TouchableHighlight, FlatList} from 'react-native';
import {Header} from '../../../navigation/TabStacks';
import {navigate} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {setNewWSReqBody} from '../../../../shared/redux/actions/native.action';
import {normalize} from '../../../utils/helpers';
import {cloneDeep} from 'lodash';

const Card = React.memo(
  ({selected = false, type = '', name = '', onPress = () => {}}) => {
    return (
      <View style={styles.itemContainer}>
        <TouchableHighlight
          underlayColor="#F3F8FF"
          onPress={() => onPress(type)}
          style={[
            styles.card,
            selected ? styles.selected : {},
            {flex: 1, margin: 8},
          ]}>
          <Text style={{marginTop: 40, ...styles.mediumText, ...styles.cardText}}>
            {name}
          </Text>
        </TouchableHighlight>
      </View>
    );
  },
);

class FromScratchScreen extends React.Component {
  constructor(props) {
    super();
    this.state = {
      name: '',
    };
    const {t} = props;
    this.options = [
      {type: 'task', name: t('Task')},
      {type: 'discussion', name: t('Discussion')},
      {type: 'document', name: t('Document')},
      {type: 'embeddedweb', name: t('Embeddedweb')},
      {type: 'custom', name: t('Custom')},
      {name: 'empty'},
    ];
  }

  onCardPress = (type) => {
    let {dashboard = []} = this.props.newWSRequestBody;
    const selected = Boolean(dashboard.find((obj) => obj.type === type));
    if (selected) {
      dashboard = dashboard.filter((obj) => obj.type !== type);
    } else {
      dashboard.push(this.options.find((obj) => obj.type === type));
    }
    this.props.setNewWSReqBody({dashboard: cloneDeep(dashboard)});
  };

  renderItem = ({item}) => {
    let {dashboard = []} = this.props.newWSRequestBody;
    if (!item.type) {
      return <View style={styles.itemContainer} />;
    }
    const selected = Boolean(dashboard.find((obj) => obj.type === item.type));

    return <Card {...item} selected={selected} onPress={this.onCardPress} />;
  };

  keyExtractor = (item, index) => {
    return item.type || index.toString();
  };

  renderBoardTypes() {
    return (
      <View style={{marginHorizontal: 8}}>
        <FlatList
          data={this.options}
          renderItem={this.renderItem}
          keyExtractor={this.keyExtractor}
          numColumns={2}
          extraData={this.props.newWSRequestBody.dashboard}
        />
      </View>
    );
  }

  onPress = () => {
    navigate(ROUTE_NAMES.VISIBILITY);
  };

  rightContent = () => {
    const {t} = this.props;
    console.log('RIGHT CONTENT', this.props.newWSRequestBody.dashboard);
    let {dashboard = []} = this.props.newWSRequestBody;
    const showNext = dashboard?.length > 0;
    return (
      <Text
        onPress={this.onPress}
        style={[
          styles.mediumText,
          showNext ? {color: '#0D6EFD'} : {color: 'grey'},
        ]}>
        {t('Next')}
      </Text>
    );
  };

  render() {
    const {t} = this.props;
    return (
      <View style={styles.safeAreaStyles}>
        <Header
          title={t('From Scratch')}
          goBack={true}
          navigation={this.props.navigation}
          rightContent={this.rightContent}
          extraData={this.props.newWSRequestBody.dashboard}
        />
        <View style={styles.scrollViewStyles}>
          <Text
            style={{
              ...styles.mediumText,
              color: '#5F6368', marginBottom: 16, marginHorizontal: 16}
            }>
            {t('Select the boards that you would like add')}
          </Text>
          {this.renderBoardTypes()}
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

export default connect(mapStateToProps, {setNewWSReqBody})(
  withTranslation()(FromScratchScreen),
);

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    // width: Dimensions.get('window').width / 2,
    // maxWidth: 400,
    // height: size,
  },
  item: {
    flex: 1,
    // margin: 10,
    backgroundColor: 'lightblue',
  },
  safeAreaStyles: {flex: 1, backgroundColor: 'white', flexDirection: 'column'},
  scrollViewStyles: {paddingTop: 24},
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
    paddingTop: 40,
    borderColor: '#BDC1C6',
    padding: 18,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: '#126df6',
    backgroundColor: '#F3F8FF',
  },
  cardText: {
    fontWeight: '400',
    color: '#5F6368',
  },
  selectedText: {
    color: '#07377F',
  },
});
