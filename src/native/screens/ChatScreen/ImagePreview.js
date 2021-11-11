import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  TextInput,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {isAndroid} from '../../utils/PlatformCheck';
import {Icon} from '../../components/Icon/Icon.js';
import {normalize} from '../../utils/helpers';
class ImagePreview extends Component {
  state = {
    mediaList: [],
    selectedObj: null,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {route} = this.props;
    //const {params} = route;
    // const res = route.params;
    //console.log('From componentDidMount : ', route.params);

    this.setState({
      mediaList: route.params.mediaList,
    });
  }

  componentDidUpdate(prevProps) {
    const {navigation} = this.props;

    const {route} = this.props;

    if (
      prevProps.route.params.mediaList !== this.props.route.params.mediaList
    ) {
      let newMediaList = Array.isArray(route.params.mediaList)
        ? [...this.state.mediaList, ...route.params.mediaList]
        : this.state.mediaList;
      this.setState({mediaList: newMediaList});
    }

    navigation.setOptions({
      title: 'Media Preview',
      titleColor: 'red',

      headerRight: () => (
        <TouchableOpacity
          onPress={() => {
            this.onMediaDelete();
          }}>
          <View style={{marginEnd: 10}}>
            <Icon name={'Delete_T'} size={24} color="#fff" />
          </View>
          {/* <Image
            source={require('../../assets/drawer/Sports.png')}
            style={{height: 16.36, width: 18, marginEnd: 16, padding: 10}}
          /> */}
        </TouchableOpacity>
      ),
      headerStyle: {
        backgroundColor: 'black',
      },
      color: 'red',
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerTitleAlign: 'left',
    });
  }

  componentWillUnmount() {
    //console.log('From componentWillUnmount');
  }

  getSelectedObj = () => {
    let obj = this.state.selectedObj;
    if (!obj && this.state.mediaList?.length > 0) {
      obj = this.state.mediaList[0];
    }
    return obj;
  };

  onMediaDelete = () => {
    console.warn = () => {};
    var array = [...this.state.mediaList]; // make a separate copy of the array
    let index = array.indexOf(this.getSelectedObj());

    //console.log('index : ' + index);

    if (index !== -1) {
      array.splice(index, 1);
      const totalMedia = array.length;
      //console.log('totalMedia : ' + totalMedia);
      if (totalMedia === 0) {
        this.setState({
          mediaList: array,
          selectedObj: null,
        });
      } else {
        if (totalMedia === index) {
          index--;
        }
        this.setState({
          mediaList: array,
          selectedObj: array[index],
        });
      }
    }
  };

  render() {
    console.warn = () => {};
    var obj = this.state.mediaList;
    obj = obj.toString();
    return (
      <SafeAreaView style={{flex: 1, backgroundColor: 'black'}}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <View style={{flex: 1, backgroundColor: 'black'}}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              margin: 10,
            }}>
            <Image
              source={{
                uri: obj,
              }}
              style={styles.imageStyle}
            />
            {/* {this.previewView()} */}
          </View>

          <View style={{justifyContent: 'flex-end', marginBottom: 0}}>
            <View
              style={{
                marginBottom: 2,
                marginTop: 1,
                height: 78,
                backgroundColor: 'black',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
              {/* <TouchableOpacity
                onPress={() => {}}
                style={{marginRight: 18, marginLeft: 18}}>
                  <Icon name={'Plus_icon'} size={24} color="#ffffff" />
              </TouchableOpacity> */}
            </View>
            <View
              style={[styles.ViewGroup, {alignItems: 'center', height: 57}]}>
              <TextInput
                ref="input"
                style={styles.inputTextStyle}
                multiline
                placeholder="Add a caption"
              />

              <TouchableOpacity onPress={() => {}} style={styles.sendViewStyle}>
                <Image
                  source={require('../../assets/send.png')}
                  style={{
                    height: 16,
                    width: 16,
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}
const styles = StyleSheet.create({
  ViewGroup: {
    alignItems: 'baseline',
    flexDirection: 'row',
    backgroundColor: 'white',
    justifyContent: 'space-between',
  },
  inputTextStyle: {
    flex: 1,
    maxHeight: 80,
    minHeight: 50,
    paddingTop: isAndroid ? 10 : 20,
    height: '100%',
    paddingLeft: 10,
    fontSize: normalize(17),
    borderBottomWidth: 0,
    borderBottomColor: 'white',
  },
  sendViewStyle: {
    backgroundColor: '#0D6EFD',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginEnd: 10,
    width: 36,
    height: 36,
  },
  imageStyle:{
    height: 332,
    width: '100%',
  }
});

export default ImagePreview;
