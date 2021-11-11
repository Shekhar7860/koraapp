import React from 'react';
import {withTranslation} from 'react-i18next';
import {fontFamily, Text} from './../../../components/KoraText';
import {connect} from 'react-redux';
import {
  View,
  SafeAreaView,
  StyleSheet,
  ScrollView,
  Image,
  TouchableHighlight,
  FlatList,
} from 'react-native';
import {Header} from '../../../navigation/TabStacks';
import {TextInput} from 'react-native';
import SimpleToast from 'react-native-simple-toast';
import {navigate} from '../../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../../navigation/RouteNames';
import {checkWSAvailability} from '../../../../shared/redux/actions/workspace.action';
import {setNewWSReqBody} from '../../../../shared/redux/actions/native.action';
import {BottomUpModal} from '../../../components/BottomUpModal';
import {getEmojiFromUnicode} from '../../../utils/emoji';
import emojiJSON from '../../../assets/joypixels/emoji.json';
const emojiList = Object.keys(emojiJSON);
import {Icon} from './../../../components/Icon/Icon';
import {normalize} from '../../../utils/helpers';

const placeholder = require('../../../assets/placeholders/home-placeholder.png');
const SCRATCH_ID = 'scratch';

const Card = React.memo(
  ({
    selected = true,
    text = '',
    imageSource = null,
    id,
    onTypeSelected = () => {},
  }) => {
    return (
      <TouchableHighlight
        underlayColor="#F3F8FF"
        onPress={() => {
          onTypeSelected(id);
        }}
        style={[styles.card, selected ? styles.selected : {}]}>
        <>
          <Image height={92} source={imageSource} />
          <Text style={{marginTop: 40, ...styles.mediumText, ...styles.cardText}}>
            {text}
          </Text>
        </>
      </TouchableHighlight>
    );
  },
);

class NewWorskpacesScreen extends React.Component {
  constructor(props) {
    super();
    this.state = {
      currentTab: 1,
      selectedType: SCRATCH_ID,
      emoji: '',
      profileIcon: false,
    };
    this.wsIcon = React.createRef();
    const {t} = props;
    this.options = [
      {
        key: 'template',
        text: t('Start from the template'),
        imageSource: placeholder,
      },
      {
        key: SCRATCH_ID,
        text: t('Start from the scratch'),
        imageSource: placeholder,
      },
    ];
  }

  onChangeText = (name) => this.props.setNewWSReqBody({name});

  renderIconAndNameSelection() {
    const {t} = this.props;
    return (
      <View style={styles.iconAndNameContainer}>
        <View style={styles.emojiContainer}>
          <TouchableHighlight
            underlayColor={(0, 0, 0, 0.2)}
            onPress={() => {
              this.wsIcon.current.openBottomDrawer();
            }}>
            {this.state.profileIcon ? (
              <Text style={styles.emojiTextStyle}>{this.state.emoji}</Text>
            ) : (
              <Icon name={'Hash'} size={15} color="#BDC1C6" />
            )}
          </TouchableHighlight>
        </View>
        <View style={styles.flexOne}>
          <TextInput
            placeholder={t('Untitled')}
            style={styles.textInput}
            value={this.props.newWSRequestBody?.name}
            onChangeText={this.onChangeText}
          />
        </View>
      </View>
    );
  }

  componentDidMount() {
    this.props.setNewWSReqBody();
  }

  onTypeSelected = (key) => {
    const {t} = this.props;
    if (key !== SCRATCH_ID) {
      SimpleToast.show(t('Feature not yet developed'));
      return;
    }
    this.setState({selectedType: key});
  };

  renderStartTypes() {
    return (
      <View>
        <Card
          id={this.options[0].key}
          text={this.options[0].text}
          imageSource={this.options[0].imageSource}
          selected={this.options[0].key === this.state.selectedType}
          onTypeSelected={this.onTypeSelected}
        />
        <View style={{height: 16}} />
        <Card
          id={this.options[1].key}
          text={this.options[1].text}
          imageSource={this.options[1].imageSource}
          selected={this.options[1].key === this.state.selectedType}
          onTypeSelected={this.onTypeSelected}
        />
      </View>
    );
  }

  checkAvailablityAndNavigate() {
    const {t} = this.props;
    this.props.checkWSAvailability(
      this.props.newWSRequestBody.name,
      () => {
        navigate(ROUTE_NAMES.FROM_SCRATCH);
      },
      () => {
        SimpleToast.show(t('WS Name already used'));
      },
    );
  }

  updateProfilePicture() {
    const {t} = this.props;
    return (
      <BottomUpModal ref={this.wsIcon} height={470}>
        <View>
          <View style={{marginTop: 35, marginStart: 10, flexDirection: 'row'}}>
            <View>
              <Text
                onPress={() => {
                  this.setState({currentTab: 1});
                }}
                style={[styles.tabTextStyle]}>
                {t('Emoji')}
              </Text>
              {this.state.currentTab == 1 ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#0D6EFD',
                    marginTop: 10,
                  }}
                />
              ) : null}
            </View>
            <View>
              <Text
                onPress={() => {
                  this.setState({currentTab: 2});
                }}
                style={[styles.tabTextStyle]}>
                Link
              </Text>
              {this.state.currentTab == 2 ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#0D6EFD',
                    marginTop: 10,
                  }}
                />
              ) : null}
            </View>
            <View>
              <Text
                onPress={() => {
                  this.setState({currentTab: 3});
                }}
                style={[styles.tabTextStyle]}>
                Upload
              </Text>
              {this.state.currentTab == 3 ? (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#0D6EFD',
                    marginTop: 10,
                  }}
                />
              ) : null}
            </View>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: '#EFF0F1',
              marginBottom: 15,
            }}
          />
          {this.state.currentTab === 1 && (
            <View
              style={{
                marginLeft: 15,
                marginRight: 15,
              }}>
              <View
                style={{
                  borderColor: '#BDC1C6',
                  borderWidth: 1,
                  borderRadius: 4,
                  height: 45,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Icon
                  name={'Contact_Search'}
                  size={18}
                  color={'#5F6368'}
                  style={{padding: 10}}
                />
                <TextInput
                  placeholder="Search emoji"
                  placeholderTextColor="#5F6368"
                  maxLength={15}
                  onChangeText={(category) => this.setState({category})}
                  style={styles.searchTextInputStyle}
                />
              </View>
              <FlatList
                data={emojiList}
                height={360}
                initialNumToRender={8}
                style={{marginTop: 10}}
                horizontal={false}
                numColumns={8}
                columnWrapperStyle={{
                  justifyContent: 'space-between',
                }}
                removeClippedSubviews={true}
                renderItem={({item}) => {
                  return (
                    <TouchableHighlight
                      underlayColor={(0, 0, 0, 0.2)}
                      onPress={() => {
                        this.props.setNewWSReqBody({
                          logo: {
                            type: 'emoji',
                            val: {
                              category: emojiJSON[item].category,
                              unicode: item,
                            },
                          },
                        });
                        this.setState({
                          profileIcon: true,
                          logo: {
                            type: 'emoji',
                            val: {
                              category: emojiJSON[item].category,
                              unicode: item,
                            },
                          },
                          category: emojiJSON[item].category,
                        });
                        this.setState({emoji: getEmojiFromUnicode(item)});
                        this.wsIcon.current.closeBottomDrawer();
                      }}
                      style={{
                        margin: 3,
                        height: 35,
                        width: 35,
                        alignItems: 'center',
                      }}>
                      <Text style={styles.emojiTextStyle}>
                        {getEmojiFromUnicode(item)}
                      </Text>
                    </TouchableHighlight>
                  );
                }}
                //numColumns={9}
                keyExtractor={(item, index) => item}
              />
            </View>
          )}

          {this.state.currentTab === 2 && (
            <View>
              <View
                style={{
                  borderColor: '#BDC1C6',
                  borderWidth: 1,
                  margin: 5,
                  borderRadius: 15,
                  height: 50,
                  paddingLeft: 10,
                }}>
                <TextInput
                  placeholder="Copy and Paste the Image URL"
                  onChangeText={(imageUrl) => this.setState({imageUrl})}
                  style={styles.textInputStyle}
                />
              </View>
              <TouchableHighlight
                underlayColor="rgba(0,0,0,0.05)"
                style={{
                  borderRadius: 5,
                  backgroundColor: '#0D6EFD',
                  padding: 12,
                  margin: 15,
                  width: '30%',
                  alignItems: 'center',
                }}>
                <Text style={styles.textStyle}>Done</Text>
              </TouchableHighlight>
            </View>
          )}

          {this.state.currentTab === 3 && (
            <View style={{alignItems: 'center'}}>
              <TouchableHighlight
                underlayColor="rgba(0,0,0,0.05)"
                style={{
                  borderRadius: 5,
                  backgroundColor: '#0D6EFD',
                  padding: 12,
                  margin: 15,
                  width: '80%',
                  alignItems: 'center',
                }}>
                <Text style={styles.textStyle}>
                  Upload Select an image to upload
                </Text>
              </TouchableHighlight>
            </View>
          )}
        </View>
      </BottomUpModal>
    );
  }

  render() {
    const {t} = this.props;
    const showNext = this.props.newWSRequestBody.name?.length > 0;
    return (
      <View style={styles.safeAreaStyles}>
        {this.updateProfilePicture()}
        <Header
          title={t('Create New')}
          backIcon={'close'}
          goBack={true}
          navigation={this.props.navigation}
          rightContent={
            <Text
              onPress={() => {
                showNext && this.checkAvailablityAndNavigate();
              }}
              style={[
                styles.mediumText,
                showNext > 0 ? {color: '#0D6EFD'} : {color: 'grey'},
              ]}>
              {t('Next')}
            </Text>
          }
        />
        <ScrollView style={styles.scrollViewStyles}>
          <Text style={styles.mediumText}>{t('Workspace Name')}</Text>
          {this.renderIconAndNameSelection()}
          <Text style={{...styles.mediumText, ...styles.containerText}}>
            {t('How do you want to start?')}
          </Text>
          {this.renderStartTypes()}
        </ScrollView>
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
export default connect(mapStateToProps, {
  checkWSAvailability,
  setNewWSReqBody,
})(withTranslation()(NewWorskpacesScreen));

const styles = StyleSheet.create({
  containerText: {color: '#5F6368', marginTop: 24, marginBottom: 16},
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
