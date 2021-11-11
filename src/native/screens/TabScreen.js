import React, {useState, useRef} from 'react';
import {
  TouchableOpacity,
  View,
  StyleSheet,
  Text,
  Linking,
  Image,
  SafeAreaView,
  Alert,
  PermissionsAndroid,
  Dimensions,
  ImageBackground,
  ScrollView,
  Pressable,
  FlatList,
  Picker,
} from 'react-native';
import Modal from 'react-native-modal';
import ScrollableTabView, {
  DefaultTabBar,
} from 'react-native-scrollable-tab-view';
import {Icon} from '../components/Icon/Icon';
import {FloatingAction} from '../../native/components/Library/react-native-floating-action/src';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
const renderFirstView = () => {
  const items = [
    {name: 'Best Match'},
    {name: 'Last edited : Newest'},
    {name: 'Last edited : Oldest'},
    {name: 'created : Newest'},
    {name: 'created : Oldest'},
  ];
  const [modalVisible, setModalVisible] = useState(false);
  const [secondModalVisible, setSecondModalVisible] = useState(false);
  const [selectedValue, setSelectedValue] = useState('java');
  const fabRef = useRef();
  const content = [
    {
      text: 'Newest',
      icon: <Icon name={'Day_View'} size={20} color={'#202124'} />,
      name: 'new',
      color: '#202124',
      position: 1,
      textColor: '#ffffff',
    },
    {
      text: 'Filterby',
      icon: <Icon name={'Task'} size={20} color={'#202124'} />,
      name: 'filter',
      color: '#202124',
      position: 2,
      textColor: '#ffffff',
    },
  ];

  fabActionPress = (actionName) => {
    if (actionName === 'new') {
      setModalVisible(true);
    } else {
      setSecondModalVisible(true);
    }
  };
  const [isSearch, setSearch] = useState(true);
  return (
    <>
      {!isSearch ? (
        <>
          <ScrollView>
            <View style={{alignSelf: 'flex-start', marginHorizontal: 20}}>
              <Text style={{color: '#95a5a6', marginTop: 10}}>People </Text>
            </View>
            <View style={styles.alignRow}>
              <View style={{...styles.row, ...styles.borderContent}}>
                <Image
                  source={require('../assets/Attachment_Icons/imagep.png')}
                />
                <Text> Shanmuga Priya </Text>
              </View>
              <View style={{...styles.row, ...styles.borderContent}}>
                <Image
                  source={require('../assets/Attachment_Icons/image2.png')}
                />
                <Text> Shanmuga Shiva </Text>
              </View>
            </View>
            <View style={styles.box}>
              <View style={{...styles.row, marginTop: 2}}>
                <View style={styles.emptyWidth} />
                <TouchableOpacity style={styles.firstView}>
                  <Image
                    source={require('../assets/Attachment_Icons/fire.png')}
                  />
                </TouchableOpacity>
                <View style={styles.secondView}>
                  <Text>Shanmuga's WS</Text>
                </View>
                <View style={styles.thirdView}>
                  <Text style={styles.smallFont}>12 Boards </Text>
                </View>
              </View>
            </View>
            <View style={styles.box}>
              <View style={{...styles.row, marginTop: 2, paddingTop: 3}}>
                <View style={styles.emptyWidth} />
                <TouchableOpacity style={styles.firstView}>
                  <Image
                    source={require('../assets/Attachment_Icons/transactions.png')}
                  />
                </TouchableOpacity>
                <View style={styles.secondView}>
                  <Text>Shanmuga's WS</Text>
                </View>
                <View style={styles.thirdView}>
                  <Text style={styles.smallFont}>6 Boards </Text>
                </View>
              </View>
            </View>
            <View style={styles.box}>
              <View style={{...styles.row, marginTop: 2, paddingTop: 2}}>
                <View style={styles.emptyWidth} />
                <TouchableOpacity style={styles.firstView}>
                  <Image
                    source={require('../assets/Attachment_Icons/vector3.png')}
                  />
                </TouchableOpacity>
                <View style={styles.secondView}>
                  <Text>Shanmuga status r...</Text>
                </View>
                <View style={styles.thirdView}>
                  <Text style={styles.smallFont}>3 Collaborators</Text>
                </View>
              </View>
            </View>
            <View style={styles.mt20} />
            <View style={styles.margin10}>
              <View style={{...styles.row, marginTop: 4, alignItems: 'center'}}>
                <Image
                  source={require('../assets/Attachment_Icons/high.png')}
                />
                <Text style={styles.smallFont}> Workspace/{'  '}</Text>
                <Image
                  source={require('../assets/Attachment_Icons/vector5.png')}
                />
                <Text style={styles.smallFont}>{'  '}Document Name /Page</Text>
              </View>
              <View style={styles.mt10}>
                <Text>
                  This can be the matched text block or sentence. Shanmuga The
                  matched word can be highlighted. This can be the matched text
                  block or sentence. The matched word can be highlighted
                </Text>
              </View>
              <View style={styles.borderBottom} />
            </View>
            <View style={styles.mt10} />
            <View style={styles.margin10}>
              <View style={{...styles.row, marginTop: 4, alignItems: 'center'}}>
                <Image
                  source={require('../assets/Attachment_Icons/high.png')}
                />
                <Text style={styles.smallFont}> Works/{'  '}</Text>
                <Image
                  source={require('../assets/Attachment_Icons/vector5.png')}
                />
                <Text style={styles.smallFont}>
                  {'  '}Table app.../table.../view name
                </Text>
              </View>
              <Text style={{...styles.smallFont, marginTop: 5}}>
                Opportunity
              </Text>
              <Text style={styles.boldFont}>Write feature blog posts</Text>
              <View style={styles.borderBottom} />
              <View style={styles.mt10} />
              <View style={{...styles.row, marginTop: 4, alignItems: 'center'}}>
                <Image
                  source={require('../assets/Attachment_Icons/high.png')}
                />
                <Text style={styles.smallFont}> WorkSpace/{'  '}</Text>
                <Image
                  source={require('../assets/Attachment_Icons/vector5.png')}
                />
                <Text style={styles.smallFont}>{'  '}Chat Thread Name</Text>
              </View>
              <View style={styles.mt10} />
              <View style={styles.row}>
                <Image
                  source={require('../assets/Attachment_Icons/image3.png')}
                />
                <View style={styles.column}>
                  <Text style={styles.boldFont2}> Dulce Kenter</Text>
                  <Text style={styles.smallFont}>
                    {' '}
                    Simple text post like this
                  </Text>
                </View>
                <Text>06:20 PM</Text>
              </View>
            </View>
          </ScrollView>
          <FloatingAction
            ref={fabRef}
            style={styles.floatingIcon1}
            actions={content}
            floatingIcon={require('../assets/Attachment_Icons/rectangle1.png')}
            onPress={(data) => fabRef.current.animateButton(data)}
            onPressItem={fabActionPress}
          />
          <View style={{flex: 1}}>
            <Modal
              style={{margin: 0, padding: 0}}
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => {
                setModalVisible(!modalVisible);
              }}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <FlatList
                    data={items}
                    renderItem={({item, index}) => (
                      <TouchableOpacity
                        style={{
                          ...styles.listContainer,
                          backgroundColor: index == 0 ? '#bdc3c7' : '#ffffff',
                        }}>
                        <View style={{width: '5%'}} />
                        <View style={styles.firstModalViewWidth}>
                          <Text>{item.name}</Text>
                        </View>
                        {index == 0 ? (
                          <Image
                            source={require('../assets/Attachment_Icons/check.png')}
                          />
                        ) : null}
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item) => item.email}
                  />
                </View>
              </View>
            </Modal>
            <Modal
              style={{margin: 0, padding: 0}}
              animationType="slide"
              transparent={true}
              visible={secondModalVisible}
              onRequestClose={() => {
                setSecondModalVisible(!secondModalVisible);
              }}>
              <View style={styles.centeredView2}>
                <View style={styles.modalView2}>
                  <Text style={styles.boldFont2}>Filters</Text>
                  <Text style={{...styles.smallFont2, marginTop: 5}}>
                    Narrow down your search results
                  </Text>
                  <View style={styles.mt10}>
                    <Text>WorkSpace</Text>
                    <View style={styles.mt5} />
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedValue}
                        style={styles.pickerView}
                        onValueChange={(itemValue, itemIndex) =>
                          setSelectedValue(itemValue)
                        }>
                        <Picker.Item label="All workspace" value="java" />
                        <Picker.Item label="JavaScript" value="js" />
                      </Picker>
                    </View>
                  </View>
                  <View style={styles.mt10}>
                    <Text>WorkSpace Owner</Text>
                    <View style={styles.mt5} />
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedValue}
                        style={styles.pickerView}>
                        <Picker.Item label="All" value="All" />
                        <Picker.Item label="JavaScript" value="js" />
                      </Picker>
                    </View>
                  </View>
                  <View style={styles.mt10}>
                    <Text>Board Type</Text>
                    <View style={styles.mt5} />
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={selectedValue}
                        style={styles.pickerView}>
                        <Picker.Item label="All" value="All" />
                        <Picker.Item label="JavaScript" value="js" />
                      </Picker>
                    </View>
                  </View>
                  <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.buttonLast1}>
                      <Text style={{color: '#ffffff'}}>Apply Filters</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.buttonLast2}>
                      <Text>Reset Filters</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </>
      ) : (
        <TouchableOpacity
          style={styles.alignCenter}
          onPress={() => setSearch(!isSearch)}>
          <ImageBackground
            resizeMode="contain"
            style={styles.imgBackground}
            source={require('../assets/Attachment_Icons/ellipse.png')}>
            <Image
              source={require('../assets/Attachment_Icons/rectangle1.png')}
              style={{marginTop: 30}}
            />
            <Image
              source={require('../assets/Attachment_Icons/rectangle3.png')}
              style={{marginTop: -40}}
            />
            <Image
              source={require('../assets/Attachment_Icons/rectangle1.png')}
              style={{marginTop: -50}}
            />
            <TouchableOpacity>
              <Image
                source={require('../assets/Attachment_Icons/vector4.png')}
                style={{position: 'absolute', bottom: 100, left: 50}}
              />
              <Image
                source={require('../assets/Attachment_Icons/vector2.png')}
                style={{position: 'absolute', bottom: 95, left: 72}}
              />
            </TouchableOpacity>
          </ImageBackground>
        </TouchableOpacity>
      )}
    </>
  );
};
// import ScrollableTabView, { DefaultTabBar, ScrollableTabBar } from 'react-native-scrollable-tab-view-forked'
const TabScreen = () => {
  const [isSearch, setSearch] = useState(true);

  return (
    <ScrollableTabView
      style={{flexGrow: 1, justifyContent: 'center'}}
      initialPage={0}
      renderTabBar={() => <DefaultTabBar tabStyle={{paddingBottom: 0}} />}>
      <View tabLabel="WorkSpace...">{renderFirstView()}</View>
      <Text tabLabel="Tasks...">Tasks</Text>
      <Text tabLabel="Messages...">Messages</Text>
    </ScrollableTabView>
  );
};

export default TabScreen;

const styles = StyleSheet.create({
  tabStyle: {},
  scrollStyle: {
    backgroundColor: 'white',
    paddingLeft: 65,
    paddingRight: 65,
    // justifyContent: 'center',
  },
  tabBarTextStyle: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  alignCenter: {
    width: '100%',
    justifyContent: 'center',
    height: windowHeight - 100,
    alignItems: 'center',
  },
  underlineStyle: {
    height: 3,
    backgroundColor: 'red',
    borderRadius: 3,
    width: 15,
  },
  container: {
    flex: 1,
  },
  firstView: {
    width: '10%',
  },
  secondView: {
    width: '50%',
  },
  thirdView: {
    width: '40%',
  },
  container2: {},
  margin10: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  box: {
    marginTop: 20,
    width: '90%',
    borderWidth: 1,
    height: 30,
    borderColor: '#bdc3c7',
    marginHorizontal: 20,
    width: 300,
    backgroundColor: '#ecf0f1',
  },
  commonWidth: {
    width: '50%',
    marginHorizontal: 20,
  },
  textColor: {
    color: 'white',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
  },
  borderBottom: {
    width: '100%',
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#95a5a6',
  },
  button2: {
    width: '80%',
    backgroundColor: '#1e3799',
    alignSelf: 'center',
    marginTop: 30,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
  button: {alignItems: 'center'},
  textInput: {
    width: '80%',
    backgroundColor: 'white',
    alignSelf: 'center',
    marginTop: 10,
    height: 50,
  },
  toolbar: {
    backgroundColor: '#1e3799',
    paddingBottom: 10,
    flexDirection: 'row',
    paddingTop: 20, //Step 1
  },
  toolbarButton: {
    //Step 2
    color: '#fff',
    textAlign: 'center',
  },
  toolbarTitle: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    flex: 1,
    fontSize: 20, //Step 3
  },
  boldFont: {
    fontWeight: 'bold',
    marginTop: 5,
  },
  boldFont2: {
    fontWeight: 'bold',
  },
  imgBackground: {
    justifyContent: 'center',
    alignItems: 'center',
    height: windowHeight - 180,
    width: windowWidth - 150,
  },
  alignRow: {
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
  borderContent: {
    width: windowWidth - 210,
    height: 25,
    borderWidth: 1,
    borderColor: '#E7F1FF',
    borderRadius: 10,
    backgroundColor: '#E7F1FF',
  },
  middleContent: {
    justifyContent: 'flex-start',
  },
  emptyWidth: {
    width: '5%',
  },
  smallFont: {
    fontSize: 14,
    color: '#5F6368',
  },
  smallFont2: {
    fontSize: 15,
    color: '#5F6368',
  },
  mt5: {
    marginTop: 5,
  },
  mt10: {
    marginTop: 10,
  },
  mt20: {
    marginTop: 20,
  },
  column: {
    flexDirection: 'column',
  },
  floatingIcon1: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#202124',
  },
  centeredView: {
    height: '50%',
    marginTop: 'auto',
    width: '100%',
  },
  centeredView2: {
    height: windowHeight - 100,
    marginTop: 400,
    width: '100%',
  },
  modalView: {
    marginTop: 80,
    height: windowHeight - 350,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalView2: {
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: '#F194FF',
  },
  buttonClose: {
    backgroundColor: '#2196F3',
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  listContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 40,
    alignItems: 'center',
  },
  firstModalViewWidth: {
    width: '75%',
  },
  secondModalViewWidth: {
    width: '20%',
  },
  pickerContainer: {
    borderWidth: 1,
    height: 50,
    borderColor: '#bdc3c7',
  },
  pickerView: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 25,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'space-between',
  },
  buttonLast1: {
    backgroundColor: '#0D6EFD',
    width: 130,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonLast2: {
    backgroundColor: '#FFFFFF',
    width: 130,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDC1C6',
  },
});
