import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import VideoPlayer from '../../components/Library/react-native-video-controls';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

import FileIcon from '../findly/singleItem/FileIcon';
import {isAndroid} from '../../utils/PlatformCheck';
import FileViewer from 'react-native-file-viewer';
import {normalize} from '../../utils/helpers';
import {Icon} from '../../components/Icon/Icon.js';
import RNFetchBlob from 'rn-fetch-blob';
import API_URL from '../../../../env.constants';
let deviceHeight = Dimensions.get('window').height;
var deviceWidth = Dimensions.get('window').width;
import {Loader} from '../ChatsThreadScreen/ChatLoadingComponent';
import * as UsersDao from '../../../dao/UsersDao';
import AudioCompnent from '../../components/Chat/AudioCompnent';
import {AudioPlayer} from '../../components/Chat/AudioPlayer';
import AccountManager from '../../../shared/utils/AccountManager';
import PagerView from 'react-native-pager-view';
import PhotoView from 'react-native-photo-view-ex';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
//import WebView from 'react-native-webview';
//import PDFView from 'react-native-view-pdf';
import Pdf from 'react-native-pdf';

let audioPlayer = new AudioPlayer();
class ChatMediaView extends Component {
  viewPager = null;
  dataSourceCords = [];
  scrollViewRef = null;
  imageRef = null;
  zoomableRef = React.createRef();
  player = React.createRef();
  clickedIndex = -1;
  indexNumber = 0;
  pagerViwes = null;
  isCheckSingleFile = true;
  state = {
    mediaList: [],
    selectedObj: null,
    inputTextValue: '',
    messageId: '',
    loader: false,
    filePath: '',
    titleName: '',
    selectedComponentID: '',
    viewPagerScrollEnable: true,
  };

  constructor(props) {
    super(props);
    //  audioFilePath = '';
    this.viewPager = React.createRef();
    this.videoRef = [];
  }

  componentDidMount() {
    const {route} = this.props;
    if (audioPlayer === null) {
      audioPlayer = new AudioPlayer();
    }

    //console.log('From componentDidMount : ', route.params);

    let components = route.params.components;
    this.state.messageId = route.params.messageId || route.params.postId;
    this.state.titleName = route.params.titleName || 'Media View';
    this.state.selectedComponentID = route.params.selectedComponentID || '';

    if (this.state.titleName === '') {
      this.state.titleName = 'Media View';
    }
    var directoryPath = '';
    let account = AccountManager.getCurrentAccount();
    let KoraV2_DIR_Name = account?.user?.id || 'KoraV2';
    if (isAndroid) {
      directoryPath =
        RNFetchBlob.fs.dirs.SDCardDir + '/' + KoraV2_DIR_Name + '/';
    } else {
      directoryPath =
        RNFetchBlob.fs.dirs.CacheDir + '/' + KoraV2_DIR_Name + '/';
    }
    let newComponents = [];
    if (route.params.viewFiles) {
      components.map((data) => {
        var item2 = {
          componentFileId: data.id,
          messageId: data.resourceId,
          localFilePath: null,
          componentType: data.fileType,
          directoryPath: directoryPath,
          filename: data.fileName,
          thumbnailURL: API_URL.appServer + data.thumbnailURL,
        };
        newComponents.push(item2);
      });
      this.setState({
        mediaList: newComponents,
      });
    } else {
      components.map((data) => {
        if (
          data.componentType === 'image' ||
          data.componentType === 'video' ||
          data.componentType === 'audio' ||
          data.componentType === 'attachment'
        ) {
          var item2 = {
            componentFileId: data.componentFileId,
            messageId: data.messageId,
            localFilePath: null,
            componentType: data.componentType,
            directoryPath: directoryPath,
            filename: data.componentData.filename,
            thumbnailURL: data.thumbnailURL,
          };
          newComponents.push(item2);
        }
      });
      this.setState({
        mediaList: newComponents,
      });
      this.setDownlodedPaths(components);
    }

    // newComponents.map(this.downloadItem);

    // this.setState({
    //   mediaList: newComponents,
    // });
    if (this.state.selectedComponentID !== '') {
      let selectedIndex = 0;

      for (let i = 0; i < components?.length; i++) {
        if (
          components[i]?.componentId === this.state.selectedComponentID ||
          components[i]?.id === this.state.selectedComponentID
        ) {
          selectedIndex = i;
          break;
        }
      }
      setTimeout(() => {
        // Add your logic for the transition
        this.scrollHandler(selectedIndex);
        this.viewPager?.current?.setPage(selectedIndex);
        this.checkAndDownloadMedia(
          this.state.mediaList[selectedIndex],
          selectedIndex,
        );
      }, 100);
    }
  }

  setDownlodedPaths = (components) => {
    //======================================================
    //                  Start
    //======================================================
    let account = AccountManager.getCurrentAccount();
    let KoraV2_DIR_Name = account?.user?.id || 'KoraV2';
    var directoryPath = '';

    if (isAndroid) {
      directoryPath =
        RNFetchBlob.fs.dirs.SDCardDir + '/' + KoraV2_DIR_Name + '/';
    } else {
      directoryPath =
        RNFetchBlob.fs.dirs.CacheDir + '/' + KoraV2_DIR_Name + '/';
    }

    let newComponents = [];

    components.map((data, index) => {
      if (
        data.componentType === 'image' ||
        data.componentType === 'video' ||
        data.componentType === 'audio' ||
        data.componentType === 'attachment'
      ) {
        let allPromises = [];
        let path = null;

        let promise = this.getDownloadedPaths(data, index, directoryPath);
        allPromises.push(promise);

        Promise.all(allPromises)
          .then((values) => {
            if (data.componentType === 'video') {
              path = null;
            } else if (values && values[0]) {
              path = values[0]?.filePath;
            }
            // console.log('values promise path ======> :  ', path);

            var item2 = {
              componentFileId: data.componentFileId,
              messageId: data.messageId,
              localFilePath: path,
              componentType: data.componentType,
              directoryPath: directoryPath,
              filename: data.componentData.filename,
              thumbnailURL: data.thumbnailURL,
            };
            newComponents.push(item2);

            if (values[0].index === components.length - 1) {
              this.setState({
                mediaList: newComponents,
              });
            }
          })
          .catch((e) => {
            console.log('ERROR  setDownlodedPaths  =======>', e);
          });
      }
    });

    //======================================================
    //                  End
    //======================================================
  };

  getDownloadedPaths = (component, index, directoryPath) => {
    return new Promise((resolve, reject) => {
      let fileType = component.componentData.filename
        .split('.')
        .pop()
        .toLowerCase();
      //let fileId = component.componentFileId;
      let filePath = directoryPath + component.componentFileId + '.' + fileType;

      if (filePath)
        RNFetchBlob.fs.exists(filePath).then((exists) => {
          if (exists) {
            //  console.log('This file exist ', filePath);
            resolve({filePath, index});
          } else {
            if(!component.componentFileId || component.componentFileId === ''){
            if(component?.componentThumbnails?.[0].localMainUri){
              resolve({filePath: component.componentThumbnails?.[0].localMainUri, index});
            }else{
              resolve({filePath: null, index});
            }
          }else{
              resolve({filePath: null, index});
            }
            
          }
        });
    });
  };
  downloadItem = (item, index) => {
    this.checkAndDownloadMedia(item, index, false);

    if (index === this.state.mediaList?.length - 1) {
      this.setState({loader: false});
      console.log(
        'this.checkAndDownloadMedia(item, index); ---->: ',
        index === this.state.mediaList?.length - 1,
      );
    }
  };
  createOrGetFilePath(
    directoryPath,
    response,
    fileId,
    index,
    isFromSingle,
    isJustDownloaded = false,
  ) {
    let self = this;
    return new Promise(function (resolve, reject) {
      RNFetchBlob.fs
        .exists(directoryPath)
        .then((exists) => {
          if (!exists) {
            RNFetchBlob.fs
              .mkdir(directoryPath)
              .then(() => {
                console.log('PATH_TO_CREATE : ' + directoryPath);
                self.saveFileToInternal(
                  directoryPath,
                  response,
                  fileId,
                  index,
                  isFromSingle,
                  isJustDownloaded,
                );
              })
              .catch((error) => {
                // error
                console.log('----------', error);
                console.log(
                  'There has been a problem with your Mkdir operation: ' +
                    error.message,
                );
                // ADD THIS THROW error
                throw error;
              });
          } else {
            self.saveFileToInternal(
              directoryPath,
              response,
              fileId,
              index,
              isFromSingle,
              isJustDownloaded,
            );
          }
        })
        .catch((error) => {
          // error
          console.log('----------', error);
          console.log(
            'There has been a problem with your Mkdir _2 operation: ' +
              error.message,
          );
          // ADD THIS THROW error
          throw error;
        });
    });
  }

  async readLocalFile(path) {
    await RNFetchBlob.fs
      .readStream('file://' + path.replace('file://', ''), 'base64')
      .then((ifstream) => {
        ifstream.open();

        ifstream.onData((chunk) => {
          this.setState({
            filePath: chunk,
          });
        });

        ifstream.onError((e) => {
          console.log('Error : ', e);
        });

        ifstream.onEnd(() => {});
      });
  }

  //https://github.com/joltup/rn-fetch-blob
  async saveFileToInternal(
    directoryPath,
    response,
    fileId,
    index,
    isFromSingle,
    isJustDownloaded = false,
  ) {
    let self = this;
    let fileType = response.filename.split('.').pop().toLowerCase();
    let filePath = directoryPath + fileId + '.' + fileType;

    if (filePath)
      await RNFetchBlob.fs.exists(filePath).then((exists) => {
        if (exists) {
          if (filePath) {
            // console.log('This file exist ', filePath);
            self.updateFilePath(filePath, index, isFromSingle);
          }
        } else {
          RNFetchBlob.config({
            // response data will be saved to this path if it has access right.
            path: filePath,
          })
            .fetch('GET', response.mediaUrl)
            .then((res) => {
              // the path should be dirs.DocumentDir + 'path-to-file.anything'
              console.log('The file saved to ', res.path());
              self.updateFilePath(filePath, index, isFromSingle);
            });
        }
      });
  }

  updateFilePath(filePath, index, isFromSingle = true) {
    // this.state({});
    let newMediaList = this.state.mediaList; //[index].localFilePath = filePath;
    newMediaList[index].localFilePath = filePath;

    if (isFromSingle) {
      this.setState({
        mediaList: newMediaList,
        loader: false,
      });
    } else {
      const loader = !(this.state.mediaList.length - 1 === index);
      this.setState({
        mediaList: newMediaList,
        loader: loader,
      });
    }
    this.forceUpdate();
  }

  componentDidUpdate(prevProps) {
    const {navigation} = this.props;

    navigation.setOptions({
      title: this.state.titleName,
      titleColor: 'red',

      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            this.pausePlayers(true);
            // if (this.videoRef[this.state.indexNumber]) {
            //   this.videoRef[this.state.indexNumber].state.paused = true;
            // }
            this.props.navigation.goBack();
          }}
          style={{marginStart: 18}}>
          <Icon name={'kr-left_direction'} size={24} color="#fff" />
        </TouchableOpacity>
      ),

      headerStyle: {
        backgroundColor: 'black',
      },
      color: 'red',
      headerTintColor: 'white',
      headerTitleStyle: {
        fontWeight: 'bold',
        marginLeft: -12,
        fontSize: normalize(18),
      },
      headerTitleAlign: 'left',
    });
  }

  componentWillUnmount() {
    console.log('From componentWillUnmount');
    if (audioPlayer) {
      audioPlayer?.stop();
      audioPlayer = null;
      // audioPlayer?.destroy();
    }
  }

  checkAndDownloadMedia(component, index, isFromSingle = true) {
    if (this.state.loader) {
      console.log('this.state.loader:', this.state.loader);
      return;
    }

    if (
      this.state.mediaList[index] &&
      this.state.mediaList[index].localFilePath
    ) {
      if (this.state.loader) {
        this.setState({loader: false});
      }
      // let filePathAudio = this.state.mediaList[index].localFilePath;
      // this.audioFilePath = this.state.mediaList[index].localFilePath; //filePathAudio;
      // console.log(
      //   'This file exist in local DB :',
      //   this.state.mediaList[index].localFilePath,
      // );
      return;
    }
    if (!component?.filename || !component?.componentFileId) {
      return;
    }
    let self = this;
    this.setState({loader: true});
    var directoryPath = '';
    let account = AccountManager.getCurrentAccount();
    let KoraV2_DIR_Name = account?.user?.id || 'KoraV2';
    if (isAndroid) {
      directoryPath =
        RNFetchBlob.fs.dirs.SDCardDir + '/' + KoraV2_DIR_Name + '/';
    } else {
      directoryPath =
        RNFetchBlob.fs.dirs.CacheDir + '/' + KoraV2_DIR_Name + '/';

      //console.log('sdcard path', directoryPath);
    }
    let fileType = component.filename.split('.').pop().toLowerCase();
    let fileId = component.componentFileId;
    let filePath = directoryPath + fileId + '.' + fileType;

    if (filePath)
      RNFetchBlob.fs.exists(filePath).then((exists) => {
        if (exists) {
          //  console.log('This file exist ', filePath);
          self.updateFilePath(filePath, index, isFromSingle);
          return;
        } else {
          console.log('Downloading start ........................ ', filePath);
          let url =
            API_URL.appServer +
            'api/1.1/ka/users/' +
            UsersDao.getUserId() +
            '/' +
            this.state.messageId +
            '/' +
            fileId +
            '/signedMediaURL';

          console.log('url : ', url);

          fetch(url, {
            method: 'get',
            headers: new Headers({
              Authorization: 'bearer ' + UsersDao.getAccessToken(),
            }),
          })
            .then((response) => {
              //console.log('response', response);
              return response.json();
            })

            .then((responseJson) => {
              if (responseJson && responseJson?.errors) {
                console.log('responseJson error  -------->>: ', responseJson);
                if (isFromSingle) {
                  this.setState({
                    loader: false,
                  });
                } else {
                  const loader = !(this.state.mediaList.length - 1 === index);
                  this.setState({
                    loader: loader,
                  });
                }
                return;
              }
              this.createOrGetFilePath(
                directoryPath,
                responseJson,
                fileId,
                index,
                isFromSingle,
                true,
              );
            })
            .catch((error) => {
              // error
              console.log('----------', error);
              console.log(
                'There has been a problem with your fetch url operation: ' +
                  error.message,
              );
              // ADD THIS THROW error
              throw error;
            });
        }
      });
  }
  playPauseClick = (url, audioCallback = null) => {
    // console.log('---------> playPauseClick <-----------', url);
    if (audioPlayer) {
      console.log('---------> playPauseClick <-----------', audioPlayer.player);
      if (audioPlayer.isPlayingAudio()) {
        audioPlayer.pauseAudio();
        if (url !== audioPlayer.getFilePath()) {
          audioPlayer.stop();
          setTimeout(() => {
            audioPlayer._reloadPlayer(url, audioCallback);
          }, 500);
        }
      } else {
        if (url === audioPlayer.getFilePath()) {
          // audioPlayer.seek(0);
          setTimeout(() => {
            audioPlayer._playPause(url, audioCallback);
          }, 500);
        } else {
          //audioPlayer.seek(0);
          audioPlayer.stop();
          setTimeout(() => {
            audioPlayer._reloadPlayer(url, audioCallback);
          }, 500);
        }
        // setTimeout(() => {

        //}, 500);
      }
    }
  };

  sliderSeek = (percentage) => {
    if (audioPlayer && audioPlayer.isPlayingAudio()) {
      // console.log('---------> sliderSeek <-----------', percentage);
      audioPlayer.seek(percentage);
    }
  };
  sliderValue = () => {
    return 5;
  };

  getPlayerCurrentTime = () => {
    return 0;
  };
  getSelectedObj = (index) => {
    let obj = this.state.selectedObj;
    if (
      !obj &&
      this.state.mediaList?.length > 0 &&
      this.state.mediaList?.length > index
    ) {
      // obj = this.state.mediaList[index];
      // this.checkAndDownloadMedia(obj, index);
    }
    return obj;
  };

  // logOutZoomState = (event, gestureState, zoomableViewEventObject) => {
  //   this.scrollViewRef.scrollEnabled = false;
  //   //  this.viewPager.scrollEnabled = false;
  //   if (zoomableViewEventObject.zoomLevel === 1) {
  //     this.setState({viewPagerScrollEnable: true});
  //   } else {
  //     if (this.state.viewPagerScrollEnable) {
  //       this.setState({viewPagerScrollEnable: false});
  //     }
  //   }
  //   this.zoomableRef._zoomToOrignal();
  //   this.setState({viewPagerScrollEnable: true});

  //   // this.zoomableRef.current.zoomLevel = 1;
  // };

  onDoubleTapAfterAction = (event, gestureState, zoomableViewEventObject) => {
    //   this.scrollViewRef.scrollEnabled = false;
    //  this.viewPager.scrollEnabled = false;
    if (zoomableViewEventObject.zoomLevel === 1) {
      this.setState({viewPagerScrollEnable: true});
    } else {
      if (this.state.viewPagerScrollEnable) {
        this.setState({viewPagerScrollEnable: false});
      }
    }
  };

  isPaused = (index) => {
    // clickedIndex;
    return false; //true; //this.state.mex
  };

  allowedFileTypes() {
    return [
      'm4a',
      'amr',
      'aac',
      'wav',
      'mp3',
      'mp4',
      'mov',
      '3gp',
      'flv',
      'png',
      'jpg',
      'jpeg',
      'gif',
      'bmp',
      'csv',
      'txt',
      'json',
      'pdf',
      'doc',
      'dot',
      'docx',
      'docm',
      'dotx',
      'dotm',
      'xls',
      'xlt',
      'xlm',
      'xlsx',
      'xlsm',
      'xltx',
      'xltm',
      'xlsb',
      'xla',
      'xlam',
      'xll',
      'xlw',
      'ppt',
      'pot',
      'pps',
      'pptx',
      'pptm',
      'potx',
      'potm',
      'ppam',
      'ppsx',
      'ppsm',
      'sldx',
      'sldm',
      'zip',
      'rar',
      'tar',
      'wpd',
      'wps',
      'rtf',
      'msg',
      'dat',
      'sdf',
      'vcf',
      'xml',
      '3ds',
      '3dm',
      'max',
      'obj',
      'ai',
      'eps',
      'ps',
      'svg',
      'indd',
      'pct',
      'accdb',
      'db',
      'dbf',
      'mdb',
      'pdb',
      'sql',
      'apk',
      'cgi',
      'cfm',
      'csr',
      'css',
      'htm',
      'html',
      'jsp',
      'php',
      'xhtml',
      'rss',
      'fnt',
      'fon',
      'otf',
      'ttf',
      'cab',
      'cur',
      'dll',
      'dmp',
      'drv',
      '7z',
      'cbr',
      'deb',
      'gz',
      'pkg',
      'rpm',
      'zipx',
      'bak',
      'avi',
      'm4v',
      'mpg',
      'rm',
      'swf',
      'vob',
      'wmv',
      '3gp2',
      '3g2',
      'asf',
      'asx',
      'srt',
      'wma',
      'mid',
      'aif',
      'iff',
      'm3u',
      'mpa',
      'ra',
      'aiff',
      'tiff',
    ];
  }

  fileTypes = {
    audio: ['m4a', 'amr', 'wav', 'aac', 'mp3'],
    video: ['mp4', 'mov', '3gp', 'flv'],
    image: ['png', 'jpg', 'jpeg'],
  };

  getFileType = (filename) => {
    let fileType = '';
    let fileExtn = filename?.split('.').pop() || '';
    if (this.allowedFileTypes().indexOf(fileExtn) !== -1) {
      if (this.fileTypes.audio.indexOf(fileExtn) !== -1) {
        fileType = 'audio';
      } else if (this.fileTypes.video.indexOf(fileExtn) !== -1) {
        fileType = 'video';
      } else if (this.fileTypes.image.indexOf(fileExtn) !== -1) {
        fileType = 'image';
      }
    }
    return fileType;
  };

  previewView = (obj, indexNumber) => {
    let type = obj ? obj.componentType : '';
    if (!type || type === '') {
      if (obj?.filename) {
        type = this.getFileType(obj?.filename);
      }
    }
    type = type?.trim();
    if(type === 'image'){
      const path=obj.localFilePath?'file://' + obj.localFilePath:obj.thumbnailURL
      let key=indexNumber+2;
      if(obj?.localFilePath){
        key=key*key;
      }
        return (
          <View style={styles.imageContainer}>
            <PhotoView
            key={key}
              source={
               {
                 uri: path,
                 cache:'reload'
              }
              }
              loadingIndicatorSource={{
                uri: obj.thumbnailURL,
                //height: 120, //Dimensions.get('window').height,
                //width: 160,//Dimensions.get('window').width,
              }}
              minimumZoomScale={1}
              maximumZoomScale={4}
              resizeMode="center"
              onLoad={() => {
                //console.log('Image loaded!');
              }}
              //style={{width: 300, height: 300}}
              style={styles.imageStyle}
            />
{/*             
<ReactNativeZoomableView
   maxZoom={2}
   minZoom={0.5}
   zoomStep={0.5}
   initialZoom={1}
   bindToBorders={true}
  // onZoomAfter={this.logOutZoomState}
   style={{
      backgroundColor: 'black',
   }}
>
<Image
        style={obj.localFilePath?styles.imageStyle:styles.imageStyle_2}
        source={{
          uri: path,
        }}
        //resizeMode="center"
        loadingIndicatorSource={{
          uri: obj.thumbnailURL,
          height: 320,
          width: 240,
        }}
      />
</ReactNativeZoomableView> */}

            {/* <Text style={{color:'white'}}
            >Path: {path}</Text> */}

           
          </View>
        );
      }else if(type === 'video'){
        return (
          <View style={styles.videoStyle}>
            {/* https://www.npmjs.com/package/react-native-video-player */}
            {obj.localFilePath && (
              <VideoPlayer
                endWithThumbnail={true}
                thumbnail={
                  obj.thumbnailURL
                    ? {uri: obj.thumbnailURL}
                    : {uri: 'file://' + obj.localFilePath}
                }
                source={{uri: 'file://' + obj.localFilePath}}
                repeat={false}
                navigator={this.props.navigation}
                videoWidth={1}
                disableVolume={true}
                paused={true}
                disableFullscreen={true}
                showControlAnimation={false}
                disableBack={true}
                onEnd={(props) => {
                  const ref = this.videoRef[indexNumber];
                  ref?.resetPlayer();
                }}
                // showOnStart={true}
                videoHeight={2}
                resizeMode="contain"
                onError={(err) => {
                  console.log('Error', err);
                  if (this.videoRef[indexNumber]) {
                    this.videoRef[indexNumber].state.error = false;
                  }
                }}
                scrubbing={2}
                playInBackground={false}
                tapAnywhereToPause={true}
                showControls={true}
                // controlsTimeout={true}
                fullScreenOnLongPress={true}
                // duration={this.state.video.duration}
                /* I'm using a hls stream here, react-native-video
              can't figure out the length, so I pass it here from the vimeo config */
                ref={(ref) => {
                  this.videoRef[indexNumber] = ref;
                }}
                onLoad={(a) => {
                  this.indexNumber = indexNumber;
                  this.pausePlayers();
                  // console.log(
                  //   'this.state.mediaList.length =====>: ',
                  //   this.state.mediaList.length,
                  // );
                  // this.setState({indexNumber});
                  // if (this.state.mediaList.length === 1) {
                  //   this.videoRef[indexNumber].state.paused = false;
                  // } else {
                  //   this.videoRef[indexNumber].methods.togglePlayPause();
                  // }
                }}
              />
            )}
          </View>
        );
      }else if(type === 'audio'){
        let index = this.state.mediaList.findIndex(
          (o) => o.componentFileId == obj.componentFileId,
        );
        // let filePathAudio = this.state.mediaList[index].localFilePath;
        //  this.audioFilePath = this.state.mediaList[index].localFilePath;
        // console.log(
        //   'This file exist ',
        //   this.state.mediaList[index].localFilePath,
        // );

        // var directoryPath = '';
        // let account = AccountManager.getCurrentAccount();
        // let KoraV2_DIR_Name = account?.user?.id || 'KoraV2';
        // if (isAndroid) {
        //   directoryPath =
        //     RNFetchBlob.fs.dirs.SDCardDir + '/' + KoraV2_DIR_Name + '/';
        // } else {
        //   directoryPath =
        //     RNFetchBlob.fs.dirs.CacheDir + '/' + KoraV2_DIR_Name + '/';

        //   //console.log('sdcard path', directoryPath);
        // }
        // let fileType = obj.filename.split('.').pop().toLowerCase();
        // let fileId = obj.componentFileId;
        let filePath = obj.localFilePath; //directoryPath + fileId + '.' + fileType;

        return (
          <View>
            <View style={styles.audioStyle}>
              {filePath && (
                <AudioCompnent
                  path={filePath}
                  fromChatMedia={true}
                  playPauseClick={(filePath, audioCallback) =>
                    this.playPauseClick(filePath, audioCallback)
                  }
                  sliderSeek={(percentage) => {
                    if (audioPlayer && audioPlayer.isPlayingAudio()) {
                      audioPlayer?.seek(percentage);
                    }
                  }}
                  sliderMax={100}
                  sliderMin={1}
                  btnState="Play"
                  //duration={'0'}
                />
              )}
            </View>
            <Text style={{color: 'white', alignSelf: 'center', marginTop: 5}}>
              {obj?.filename}
            </Text>
          </View>
        );
      }else{
        let type = obj?.filename?.split('.').pop();
        let path = obj.localFilePath;
        //  const resourceType = 'file';
        // const fileFrom = 'bundle';
        return type === 'pdf' ? (
          path === null ? (
            <View></View>
          ) : (
            <Pdf
              style={{flex: 1, width: deviceWidth, height: deviceHeight}}
              source={{uri: 'file://' + obj.localFilePath}}
              //resource={isAndroid  ? obj.localFilePath : obj.localFilePath} //'u-7fd6f0a7-d80a-5924-833c-d3610794f0a5/60d41716e49ff77e24b86066.pdf'}
              onError={(error) => console.log('Cannot render PDF', error)}
              //fileFrom={fileFrom}
            />
          )
        ) : (
          <TouchableHighlight
            style={styles.defaultStyle1}
            onPress={() => {
              console.log('local file path', obj.localFilePath);
              if (obj.localFilePath === null) {
                return;
              }
              FileViewer.open('file://' + obj.localFilePath)
                .then(() => {
                  // success
                  console.log('----------success');
                })
                .catch((error) => {
                  // error
                  console.log('----------', error);
                  console.log(
                    'There has been a problem with your FileViewer.open operation: ' +
                      error.message,
                  );
                  // ADD THIS THROW error
                  throw error;
                });
            }}>
            <View style={styles.defaultStyle2}>
              <FileIcon type={obj.filename.split('.').pop().toLowerCase()} />
              <Text style={styles.defaultStyle3}>{obj.filename}</Text>
            </View>
          </TouchableHighlight>
        );
    }
    
  };

  section = () => {
    var sectionList = [];
    for (let i = 0; i < this.state.mediaList.length; i++) {
      let data = this.state.mediaList[i];
      sectionList.push(this.singleSectionItem(data, i));
    }

    return sectionList;
  };

  pausePlayers = (isStopAll = false) => {
    this.videoRef.map((ref, index) => {
      //this.videoRef[indexNumber];
      if (isStopAll) {
        ref.state.paused = true;
        // ref.state.showControls = true;
      } else {
        if (index === this.indexNumber) {
          ref.methods.togglePlayPause();
        } else {
          if (!ref.state.paused) {
            ref.methods.togglePlayPause();
          }
        }
      }
    });
  };

  singleSectionItem = (data, index) => {
    let isSelected = false;
    let selectObj = this.getSelectedObj(index);
    if (selectObj && data.componentFileId === selectObj.componentFileId) {
      isSelected = true;
    }
    if (audioPlayer && audioPlayer.isPlayingAudio()) {
      audioPlayer.stop();
      audioPlayer.destroy();
      audioPlayer._updateState();
      audioPlayer = new AudioPlayer();
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          this.pausePlayers(true);
          this.checkAndDownloadMedia(data, index);
          //console.log('Selected media', data);
          //console.log('Selected Index', index);
          this.viewPager?.current?.setPage(index);
          this.scrollHandler(index);
          this.setState({
            selectedObj: data,
            viewPagerScrollEnable: true,
          });
        }}>
        <View
          style={[
            styles.singleSection1,
            {
              // height: isSelected ? 52 : 48,
              // width: isSelected ? 52 : 48,
              // borderColor: isSelected ? '#0D6EFD' : 'white',
              // borderWidth: isSelected ? 2 : 0,
            },
          ]}>
          {this.getSelctionImage(data, isSelected)}
        </View>
      </TouchableOpacity>
    );
  };

  getSelctionImage = (data, isSelected) => {
    const type = data.filename.split('.').pop().toLowerCase(); //data ? data.componentType : '';
    // FastImage.preload();
    if (type == 'png' || type == 'jpg' || type == 'jpeg') {
      return (
        <FastImage
          source={{
            uri: data.thumbnailURL || 'file://' + data.localFilePath,
            priority: FastImage.priority.normal,
          }}
          style={[
            styles.singleSection2,
            {
              width: isSelected ? 50 : 46,
              height: isSelected ? 50 : 46,
              borderColor: isSelected ? '#0D6EFD' : 'white',
              borderWidth: isSelected ? 2 : 0,
            },
          ]}
        />
      );
    } else if (data.componentType == 'video') {
      return (
        <View
          style={[
            styles.videoContainer,
            {
              height: isSelected ? 52 : 48,
              width: isSelected ? 52 : 48,
              borderColor: isSelected ? '#0D6EFD' : 'white',
              borderWidth: isSelected ? 2 : 0,
              borderRadius: 4,
            },
          ]}>
          <View style={styles.videoIconContainer}>
            <Icon name={'PlayWhite'} size={24} color={'#6182b0'} />
          </View>
          <FastImage
            source={{
              uri: data.thumbnailURL,
              priority: FastImage.priority.normal,
            }}
            style={[
              styles.singleSection3,
              {width: isSelected ? 50 : 48, height: isSelected ? 50 : 48},
            ]}
          />
        </View>
      );
    } else if (type.length > 0) {
      return (
        <ImageBackground
          style={[
            styles.singleSection4,
            {
              width: isSelected ? 40 : 36,
              height: isSelected ? 49 : 45,
              borderColor: isSelected ? '#0D6EFD' : 'white',
              borderWidth: isSelected ? 2 : 0,
              borderRadius: 4,
            },
          ]}>
          <FileIcon type={data.filename.split('.').pop().toLowerCase()} />
        </ImageBackground>
      );
    }
  };

  onComposebarTextChange = (text) => {
    // this.setState({sendVisible: text.trim().length > 0 ? true : false});
    // this.setState({inputTextValue: text});
    //this.props.textDidChange(text);
  };

  getUID = (pattern) => {
    var _pattern = pattern || 'xxxxyx';
    _pattern = _pattern.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return _pattern;
  };
  previewNewView(obj, index) {
    return (
      <View key={index} style={styles.previewNew1}>
        {this.previewView(obj, index)}
      </View>
    );
  }

  getAllPreviews = () => {
    return Array.isArray(this.state.mediaList) ? (
      this.state.mediaList.map((data, index) => {
        return this.previewNewView(data, index);
      })
    ) : (
      <></>
    );
  };
  scrollHandler = (scrollToIndex) => {
    // //console.log(this.dataSourceCords.length, scrollToIndex);
    if (this.scrollViewRef && this.dataSourceCords.length > scrollToIndex) {
      this.scrollViewRef.scrollTo({
        y: 0,
        x: this.dataSourceCords[scrollToIndex] - 150,
        animated: true,
      });
    }
  };

  onPageSelected = (event) => {
    const index = event.nativeEvent.position;
    // console.log('event   ========>:', event);
    // console.log('onPageSelected index   ========>:', index);
    // if (true) {
    //   return;
    // }
    let data = this.state.mediaList[index];

    this.pausePlayers(true);
    this.checkAndDownloadMedia(data, index);
    //console.log('Selected media', data);
    //console.log('Selected Index', index);
    // this.viewPager?.current?.setPage(index);
    this.scrollHandler(index);
    //this.selectedObj = data;
    this.setState({
      selectedObj: data,
      //viewPagerScrollEnable: true,
    });

    // let obj = this.state.mediaList[event.nativeEvent.position];

    // this.scrollHandler(event.nativeEvent.position);
    // this.setState({
    //   selectedObj: obj,
    // });
  };

  //https://github.com/callstack/react-native-viewpager/blob/master/example/src/App.tsx
  mediaPager = () => {
    return (
      <PagerView
        ref={this.viewPager}
        style={styles.mediaPager1}
        onPageSelected={this.onPageSelected}
        showPageIndicator={false}
        overScrollMode="always"
        // Lib does not support dynamically orientation change
        orientation="horizontal"
        // Lib does not support dynamically transitionStyle change
        transitionStyle="scroll"
        keyboardDismissMode="on-drag"
        // scrollEnabled={true}
        pageMargin={10}
        // initialPage={0}
        offscreenPageLimit={1.5}
        onPageScrollStateChanged={(event) => {}}
        onPageScroll={(event) => {
          // console.log('onPageScroll  ----> ', event);
        }}>
        {this.getAllPreviews()}
      </PagerView>
    );
    // return (
    //   <ViewPager
    //     ref={this.viewPager}
    //     style={styles.mediaPager1}
    //     onPageSelected={this.onPageSelected}
    //     showPageIndicator={false}
    //     overScrollMode="always"
    //     // Lib does not support dynamically orientation change
    //     orientation="horizontal"
    //     // Lib does not support dynamically transitionStyle change
    //     transitionStyle="scroll"
    //     keyboardDismissMode="on-drag"
    //     scrollEnabled={this.state.viewPagerScrollEnable}
    //     pageMargin={10}
    //     initialPage={0}>
    //     {this.getAllPreviews()}
    //   </ViewPager>
    // );
  };

  singleSection = (item, key) => {
    return (
      // Flat List Item
      <View
        key={key}
        //style={styles.item}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          this.dataSourceCords[key] = layout.x;
        }}>
        {this.singleSectionItem(item, key)}
      </View>
    );
  };

  render() {
    console.log('chat media view');
    return (
      <SafeAreaView style={styles.mediaPager2}>
        <StatusBar backgroundColor="black" barStyle="light-content" />
        <View style={styles.mediaPager3}>
          {this.state.loader && (
            <View style={styles.loaderStyle}>
              <Loader />
            </View>
          )}

          {this.mediaPager()}
          <View style={styles.mediaPager4}>
            <View style={styles.mediaPager5}>
              <View style={styles.scrollParentView}>
                <ScrollView
                  ref={(ref) => {
                    this.scrollViewRef = ref;
                  }}
                  horizontal={true}
                  centerContent={true}
                  style={styles.scrollViewStylePreviewApp}>
                  <View style={styles.scrollViewInnerView}>
                    {this.state.mediaList.map(this.singleSection)}
                  </View>
                </ScrollView>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
  },
  imageStyle: {
    height: deviceHeight,
    width: deviceWidth,
    flex: 1,
  },
  imageStyle_2:{
    height: 240,
    width: 320,
    
    // resizeMode: 'contain',
  },
  videoStyle: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioStyle: {
    backgroundColor: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  defaultStyle1: {
    borderWidth: 2,
    width: '100%',
    borderRadius: 5,
  },
  videoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: 'white',
    borderRadius: 4,
  },
  videoIconContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  defaultStyle2: {alignItems: 'center'},
  defaultStyle3: {color: 'white', marginTop: 28},
  scrollParentView: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
  },
  scrollViewStylePreviewApp: {
    width: '100%',
    height: '100%',
  },
  scrollViewInnerView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  singleSection1: {
    marginHorizontal: 8,
    alignItems: 'center',
    padding: 2,
    borderColor: 'white',
    borderRadius: 4,
    // height: 50,
    // width: 50,
    justifyContent: 'center',
  },
  singleSection2: {
    height: 48,
    width: 48,
    backgroundColor: 'black',
    borderRadius: 4,
  },
  singleSection3: {
    height: 48,
    width: 48,
    backgroundColor: 'black',
    borderRadius: 4,
  },
  singleSection4: {
    height: 45,
    width: 36,
  },
  previewNew1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 0,
  },
  mediaPager1: {flex: 1},
  mediaPager2: {flex: 1, backgroundColor: 'black'},
  mediaPager3: {flex: 1, backgroundColor: 'black'},
  loaderStyle: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // opacity: 0.5,
    zIndex: 1,

    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPager4: {justifyContent: 'center', marginBottom: 0},
  mediaPager5: {
    marginBottom: 2,
    marginTop: 1,
    height: 78,
    backgroundColor: 'black',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
export default ChatMediaView;
