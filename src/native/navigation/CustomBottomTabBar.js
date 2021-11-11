import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {CustomTabBar} from './CustomTabBar';
import TabScreen from '../screens/TabScreen';
import Findly from '../screens/findly/Findly';
import {ROUTE_NAMES} from './RouteNames';
import {FindlyNavigator} from '../navigation/RootNavigator';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {FindlyIcon} from '../components/FindlyIcon';
import {SET_ACTIVE_BOARD_FAILURE} from '../../shared/redux/constants/message-thread.constants';
import {Icon} from '../components/Icon/Icon';
import MultiLine from '../components/MultiLine';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const CustomBottomTabBar = ({navigation}) => {
  const Tab = createBottomTabNavigator();
  const [selectedTab, setTab] = useState(0);

  useEffect(() => {}, []);

  const [text, setTextValue] = useState('');
  const changeText = (value) => {
    if (value != '') {
      setTextValue(value);
    } else {
      setTextValue('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior="height"
      keyboardVerticalOffset={windowHeight - 700}
      style={{flex: 1}}>
      {selectedTab == 0 ? (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity
                style={{paddingHorizontal: 5}}
                onPress={() => {
                  navigation.goBack();
                }}>
                <View
                  style={{justifyContent: 'center', marginStart: 10, flex: 1}}>
                  <FindlyIcon number="0" size={22} />
                </View>
              </TouchableOpacity>
              <View style={{flexDirection: 'row'}}>
                <View
                  style={{
                    marginStart: 10,
                    backgroundColor: '#00000',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontStyle: 'normal',
                      fontWeight: 'bold',
                      fontSize: 18,
                      flexWrap: 'wrap',
                      color: '#202124',
                      fontFamily: 'Inter',
                    }}>
                    Kora
                  </Text>
                </View>
                <View
                  style={{
                    justifyContent: 'center',
                    marginStart: 0,
                    backgroundColor: '#00000',
                  }}>
                  <Text
                    style={{
                      fontStyle: 'normal',
                      fontWeight: 'normal',
                      fontSize: 18,
                      flexWrap: 'wrap',
                      color: '#202124',
                      fontFamily: 'Inter',
                    }}>
                    .ai
                  </Text>
                </View>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => {
                  navigation.navigate(ROUTE_NAMES.KORA_NOTIFICATIONS, {
                    callGoBack: () => {
                      navigation.goBack();
                    },
                  });
                }}>
                <View style={{marginEnd: 10}}>
                  <Icon name={'notification'} size={18} color="black" />
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{padding: 5}} onPress={() => {}}>
                <View style={{marginEnd: 10}}>
                  <Icon name={'options'} size={24} color="black" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView style={{flex: 1, marginBottom: 130}}>
            <View
              style={{
                backgroundColor: '#FFFBEA',
                height: 27,
                justifyContent: 'center',
              }}>
              <Text style={{textAlign: 'center', fontSize: 15}}>
                Click to view conversation History
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.emptyWidth} />
                <Image
                  source={require('../assets/Attachment_Icons/image.png')}></Image>
                <View style={styles.emptyWidth} />
                <View style={styles.column}>
                  <Text style={styles.boldFontStyle}>Good Morning, </Text>
                  <Text style={styles.boldFontStyle}>Shanamuga</Text>
                  <Text style={{...styles.lowerFontStyle, marginTop: 8}}>
                    Buckle up...., its a hectic
                  </Text>
                  <Text style={styles.lowerFontStyle}>meeting Day</Text>
                </View>
              </View>
            </View>

            <View style={{...styles.card, padding: 10}}>
              <Text style={styles.boldFontSecondStyle}>Try Asking...</Text>
              <View style={styles.mt5} />
              <View style={styles.backgroundBlue}>
                <Text style={styles.lowerFontStyle}>Call Surya</Text>
              </View>
              <View style={styles.backgroundBlue2}>
                <Text style={styles.lowerFontStyle}>
                  Kora go To compact node
                </Text>
              </View>
              <View style={styles.backgroundBlue3}>
                <Text style={styles.lowerFontStyle}>
                  Create new workSpace and add Prasanna
                </Text>
              </View>
              <Text style={styles.seeMoreTextStyle}>See More</Text>
            </View>
            <View style={{...styles.card, padding: 10}}>
              <View style={styles.rowLast}>
                <View style={{...styles.column}}>
                  <View
                    style={{...styles.row, justifyContent: 'space-between'}}>
                    <TouchableOpacity style={{justifyContent: 'center'}}>
                      <Image
                        source={require('../assets/Attachment_Icons/Vector.png')}></Image>
                    </TouchableOpacity>
                    <Text>Daily Goal</Text>
                  </View>
                  <View>
                    <Text style={styles.bigNumberStyle}>
                      9<Text style={styles.smallNumberStyle}>/10</Text>
                    </Text>
                  </View>
                  <Text style={styles.seeMoreTextStyle}>Edit your goal</Text>
                </View>
                <View style={styles.emptyWidth} />
                <TouchableOpacity style={styles.imageCircle}>
                  <Image
                    source={require('../assets/Attachment_Icons/Bitmap.png')}></Image>
                </TouchableOpacity>
              </View>
            </View>
            <View style={{...styles.card, padding: 10}}>
              <View style={styles.rowLast}>
                <View style={{...styles.column}}>
                  <View style={{...styles.row}}>
                    <TouchableOpacity style={{justifyContent: 'center'}}>
                      <Image
                        source={require('../assets/Attachment_Icons/list.png')}></Image>
                    </TouchableOpacity>
                    <Text> Tasks</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.bigNumberStyle}>2 </Text>
                    <View style={{...styles.column, alignSelf: 'center'}}>
                      <Text style={styles.smallNumberStyle2}>OverDue</Text>
                      <Text style={styles.smallNumberStyle2}>Tasks</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.emptyWidth} />
                <View style={{...styles.column}}>
                  <Text>+ New Task</Text>
                  <View style={styles.row}>
                    <Text style={styles.bigNumberStyle}>3 </Text>
                    <View style={{...styles.column, alignSelf: 'center'}}>
                      <Text style={styles.smallNumberStyle2}>Tasks Due</Text>
                      <Text style={styles.smallNumberStyle2}>Tasks</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>
        </>
      ) : selectedTab == 1 ? (
        <>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 5,
            }}>
            <View style={{flexDirection: 'row'}}>
              <TouchableOpacity style={{paddingHorizontal: 5}}>
                <TouchableOpacity style={styles.iconBackgroundSelected}>
                  <Image
                    source={require('../assets/Attachment_Icons/Search.png')}
                    style={{tintColor: '#ffffff'}}
                  />
                </TouchableOpacity>
              </TouchableOpacity>
              <View style={{flexDirection: 'row'}}>
                <View
                  style={{
                    marginStart: 10,
                    backgroundColor: '#00000',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      fontStyle: 'normal',
                      fontWeight: 'bold',
                      fontSize: 18,
                      flexWrap: 'wrap',
                      color: '#202124',
                      fontFamily: 'Inter',
                    }}>
                    Search
                  </Text>
                </View>
              </View>
            </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <TouchableOpacity
                style={{padding: 5}}
                onPress={() => {
                  setTab(0);
                }}>
                <View style={{marginEnd: 10}}>
                  <Icon name={'close'} size={22} color="black" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.secondContainer}>
            <View style={styles.rowSearch}>
              <TouchableOpacity style={styles.iconBackgroundGreen}>
                <Image
                  source={require('../assets/Attachment_Icons/Bookmark.png')}
                  style={{tintColor: '#ffffff'}}
                />
              </TouchableOpacity>
              <View style={styles.emptyWidth} />
              <Text style={styles.boldFontStyle2}>SAVED SEARCHES</Text>
            </View>
            <View style={styles.mt10}>
              <View style={styles.box}>
                <View style={styles.row}>
                  <TouchableOpacity style={styles.alignCenter}>
                    <Image
                      source={require('../assets/Attachment_Icons/Union.png')}
                      style={{tintColor: '#ffffff'}}
                    />
                  </TouchableOpacity>
                  <View style={styles.emptyWidth} />
                  <Text>
                    You can save your favourite search {'\n'} terms for easy
                    access
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.rowSearch}>
              <TouchableOpacity style={styles.iconBackgroundOrange}>
                <Image
                  source={require('../assets/Attachment_Icons/Search.png')}
                  style={{tintColor: '#ffffff'}}
                />
              </TouchableOpacity>
              <View style={styles.emptyWidth} />
              <Text style={styles.boldFontStyle2}>TRY SEARCHING</Text>
            </View>
            <View style={styles.mt10} />
            <View style={styles.mt10}>
              <Text>I was mentioned</Text>
            </View>
            <View style={styles.mt10}>
              <Text>I was mentioned but did not reply</Text>
            </View>
            <View style={styles.mt10}>
              <Text>Show me the docs created 10 days ago</Text>
            </View>
            <View style={styles.rowSearch}>
              <TouchableOpacity style={styles.iconBackgroundSelected}>
                <Image
                  source={require('../assets/Attachment_Icons/time.png')}
                  style={{tintColor: '#ffffff'}}
                />
              </TouchableOpacity>
              <View style={styles.emptyWidth} />
              <Text style={styles.boldFontStyle2}>RECENTLY SEARCHED</Text>
            </View>
            <View style={styles.mt10} />
            <View style={{...styles.row, ...styles.mt10}}>
              <Icon name={'close'} size={22} color="#9AA0A6" />
              <Text>Call Surya</Text>
            </View>
            <View style={{...styles.row, ...styles.mt10}}>
              <Icon name={'close'} size={22} color="#9AA0A6" />
              <Text>Create new room and add Prasanna</Text>
            </View>
            <View style={{...styles.row, ...styles.mt10}}>
              <Icon name={'close'} size={22} color="#9AA0A6" />
              <Text>Go to Kora.ai workspace</Text>
            </View>
            <View style={{...styles.row, ...styles.mt10}}>
              <Icon name={'close'} size={22} color="#9AA0A6" />
              <Text>What is the new long weekend?</Text>
            </View>
          </View>
        </>
      ) : selectedTab == 2 ? (
        <TabScreen />
      ) : null}
      {selectedTab == 0 || selectedTab == 1 ? (
        <View style={styles.footer}>
          <View style={styles.bar}>
            <MultiLine
              placeholder={'Ask anything'}
              multiStyle={styles.placeholderStyle}
              onChangeText={(value) => changeText('userName', value)}
            />
            <TouchableOpacity
              style={{
                ...styles.buttonStyle,
                backgroundColor: text == '' ? '#D1D5DB' : '#0D6EFD',
              }}>
              <Text style={{color: text == '' ? '#BDC1C6' : '#ffffff'}}>
                Go
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.rowTabs}>
            <TouchableOpacity
              style={styles.firstWidth}
              onPress={() => setTab(0)}>
              <FindlyIcon number="0" size={40} />
            </TouchableOpacity>
            <View>
              <TouchableOpacity
                style={
                  selectedTab == 1
                    ? styles.iconBackgroundSelected2
                    : styles.iconBackground
                }
                onPress={() => setTab(1)}>
                <Image
                  source={require('../assets/Attachment_Icons/Search.png')}
                  style={{tintColor: '#ffffff'}}
                />
              </TouchableOpacity>
            </View>
            <View>
              <View style={styles.notificationBadge}>
                <Text style={styles.textWhite}>4</Text>
              </View>
              <TouchableOpacity
                style={styles.iconBackground}
                onPress={() => setTab(2)}>
                <Image
                  source={require('../assets/Attachment_Icons/notificatios.png')}
                  style={{tintColor: '#ffffff'}}
                />
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                style={styles.iconBackground}
                onPress={() => setTab(3)}>
                <Image
                  source={require('../assets/Attachment_Icons/help.png')}
                  style={{tintColor: '#ffffff'}}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
};

export default CustomBottomTabBar;
const styles = StyleSheet.create({
  boldFontStyle: {
    fontWeight: '800',
    fontSize: 17,
  },
  boldFontStyle2: {
    fontWeight: '800',
    fontSize: 15,
  },
  boldFontSecondStyle: {
    fontWeight: '700',
    fontSize: 15,
  },
  iconBackground: {
    backgroundColor: '#95a5a6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackgroundSelected: {
    backgroundColor: '#7027E5',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackgroundSelected2: {
    backgroundColor: '#7027E5',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBackgroundOrange: {
    backgroundColor: '#FF784B',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  iconBackgroundGreen: {
    backgroundColor: '#28A745',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  bar: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  buttonStyle: {
    marginTop: 15,
    width: '10%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
    height: 40,
  },
  rowTabs: {
    flexDirection: 'row',
    width: '65%',
    alignSelf: 'center',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  placeholderStyle: {
    paddingTop: 25,
    paddingBottom: 0,
    height: 40,
    width: '78%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 120,
    borderTopWidth: 1,
    borderTopColor: '#95a5a6',
    backgroundColor: '#ffffff',
  },
  firstWidth: {
    width: '20%',
  },
  secondWidth: {
    width: '25%',
  },
  thirdWidth: {
    width: '25%',
  },
  fourthWidth: {
    width: '25%',
  },
  emptyWidth: {
    width: '15%',
  },
  textWhite: {
    color: '#ffffff',
  },
  notificationBadge: {
    backgroundColor: '#7f8c8d',
    height: 20,
    width: 20,
    color: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    position: 'absolute',
    bottom: 28,
    left: 22,
    zIndex: 3,
  },
  card: {
    marginTop: 6,
    height: 137,
    width: '90%',
    justifyContent: 'center',
    borderWidth: 1,
    backgroundColor: '#ffffff',
    alignSelf: 'center',
    borderRadius: 5,
    borderColor: 'white',
    shadowColor: 'black',
    shadowOpacity: 0.26,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 10,
  },
  box: {
    marginTop: 5,
    backgroundColor: '#bdc3c7',
    height: 50,
    justifyContent: 'center',
    borderRadius: 2,
    color: '#ffffff',
    padding: 5,
  },
  alignCenter: {
    justifyContent: 'center',
  },
  backgroundBlue: {
    marginTop: 5,
    backgroundColor: '#E7F1FF',
    width: 100,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  backgroundBlue2: {
    marginTop: 5,
    backgroundColor: '#E7F1FF',
    width: 180,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  backgroundBlue3: {
    marginTop: 5,
    backgroundColor: '#E7F1FF',
    width: 270,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  rowSearch: {
    flexDirection: 'row',
    marginTop: 20,
  },
  rowLast: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  emptyWidth: {
    width: '5%',
  },
  column: {
    flexDirection: 'column',
    marginTop: 5,
  },
  lowerFontStyle: {
    fontSize: 13,
  },
  mt5: {
    marginTop: 3,
  },
  mt10: {
    marginTop: 8,
  },
  seeMoreTextStyle: {
    fontSize: 13,
    marginTop: 5,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  imageCircle: {
    backgroundColor: '#F0F0F0',
    width: 110,
    height: 110,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 55,
    borderColor: '#F0F0F0',
  },
  smallNumberStyle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#F0F0F0',
  },
  smallNumberStyle2: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F0F0F0',
  },
  bigNumberStyle: {
    fontSize: 35,
    fontWeight: '700',
  },
  secondContainer: {
    marginTop: 25,
    alignSelf: 'center',
    width: '90%',
    color: '#ffffff',
  },
});
