import React from 'react';
import {
  Dimensions,
  View,
  Text,
  StyleSheet,
  TouchableHighlight,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import {SafeAreaView} from 'react-native';
import {Header} from '../navigation/TabStacks';
import {Icon} from '../components/Icon/Icon';
import {connect} from 'react-redux';
import ViewFilesOptions from '../components/Chat/ViewFilesOptions';
import {BottomUpModal} from '../components/BottomUpModal';
import {normalize} from '../utils/helpers';
import {getBoardFiles} from '../../shared/redux/actions/message-thread.action';
import {Loader} from './ChatsThreadScreen/ChatLoadingComponent';
import {navigate, goBack} from '../navigation/NavigationService';
import RNFetchBlob from 'rn-fetch-blob';
import Toast from 'react-native-simple-toast';
import API_URL from '../../../env.constants';
import {isAndroid} from '../utils/PlatformCheck';
import FileIcon from '../components/Chat/FileIcon';
import ShareComponentView from './Share/shareSheetKora';
import NewThreadShareComponentView from './Share/shareNewThread';
import BackButton from './../components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as UsersDao from '../../dao/UsersDao';
import {ROUTE_NAMES} from '../navigation/RouteNames';
import {emptyArray} from '../../shared/redux/constants/common.constants';
import FastImage from 'react-native-fast-image';
import {BottomUpModalShare} from '../components/BottomUpModal/BottomUpModalShare';
import {th} from 'date-fns/locale';
import AccountManager from '../../shared/utils/AccountManager';
import Placeholder from '../components/Icon/Placeholder';

const {height} = Dimensions.get('window');
const screenWidth = Math.round(Dimensions.get('window').width);
const fileOptions = [
  {
    id: 'download',
    icon: 'Download',
    text: 'Download',
  },
  // {
  //   id: 'copyReference',
  //   icon: 'Copy',
  //   text: 'Copy reference',
  // },
  {
    id: 'forward',
    icon: 'forward',
    text: 'Forward',
  },
  {
    id: 'message',
    icon: 'External_Link',
    text: 'Go to message',
  },
  {
    id: 'details',
    icon: 'traceInfo',
    text: 'Details',
  },
];

const fileOptionsReduced = [
  {
    id: 'download',
    icon: 'Download',
    text: 'Download',
  },
  {
    id: 'forward',
    icon: 'forward',
    text: 'Forward',
  },
];

class ViewFiles extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedFiles: [],
      checkBoxEnabled: false,
      searchOn: false,
      searchText: '',
      filesList: [],
      fileLoading: true,
      paginationloading: false,
    };
    this.fileOptionRef = React.createRef();
    this.shareModal = React.createRef();
    this.shareNewThreadModal = React.createRef();
  }

  componentDidMount() {
    Keyboard.dismiss();
    this.tempNextPageToken = 0;
    let _params = {
      boardId: this.props.route.params.threadId,
    };
    this.props.getBoardFiles(_params);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.boardFiles !== this.props.boardFiles) {
      let filesList = this.props.boardFiles?.files;
      if (filesList !== undefined) {
        let reset = this.props.boardFiles?.reset;
        this.tempNextPageToken = this.props.boardFiles?.nextPageToken;
        filesList?.map((data) => (data.isSelected = false));
        this.setState({
          fileLoading: false,
          filesList: reset
            ? filesList
            : [...this.state.filesList, ...filesList],
        });
      } else {
        this.setState({
          fileLoading: false,
        });
      }
    }
    if (prevProps.boardFilesFail !== this.props.boardFilesFail) {
      this.setState({fileLoading: false});
    }
  }

  get fileList() {
    if (this.state.searchText !== '' && this.state.searchText?.length > 0) {
      return this.state.filesList.filter((data) => {
        return data.fileType?.includes(this.state.searchText.toLowerCase());
      });
    }
    return this.state.filesList;
  }

  renderCheckBox() {
    let data = this.state.filesList;
    data.map((item) => {
      item.isSelected = false;
    });
    this.setState({
      checkBoxEnabled: !this.state.checkBoxEnabled,
      filesList: data,
    });
  }

  headerView() {
    return (
      <Header
        {...this.props}
        title={'View Files'}
        goBack={true}
        rightContent={
          this.state.selectedFiles.length !== 0
            ? this.renderMenuIcon()
            : this.renderSearchIcon()
        }
      />
    );
  }

  renderSearchMode() {
    return (
      <SafeAreaView
        style={{
          backgroundColor: 'white',
          paddingTop: isAndroid ? 10 : 0,
        }}>
        <View style={styles.s1}>
          <TouchableOpacity
            onPress={() => {
              //this.setState({searchOn: false, fileLoading: true});
              this.setState({searchOn: false, searchText: ''});
              // this.setState({fileLoading: true});
              let _params = {
                boardId: this.props.route.params.threadId,
              };
              this.props.getBoardFiles(_params);
              setTimeout(() => {
                this.setState({
                  checkBoxEnabled: false,
                });
              }, 500);
            }}
            style={{marginLeft: 18, marginRight: 5}}>
            <Icon
              color={'#202124'}
              name="kr-left_direction"
              size={normalize(25)}
            />
          </TouchableOpacity>
          <View style={styles.s2}>
            <Icon
              name={'Contact_Search'}
              size={normalize(18)}
              color={'#BDC1C6'}
              style={{
                marginLeft: 10,
                marginRight: 10,
              }}
            />
            <TextInput
              placeholder="Search"
              placeholderTextColor="#BDC1C6"
              maxLength={20}
              onChangeText={(searchText) => {
                this.setState({searchText});
              }}
              style={styles.searchTextInputStyle}
            />
          </View>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => {
              navigate('Files Search Filter', {
                boardId: this.props.route.params.threadId,
              });
            }}
            style={{marginStart: 15, marginEnd: 20}}>
            <Icon name={'Filter'} size={normalize(17)} color="black" />
          </TouchableHighlight>
        </View>
      </SafeAreaView>
    );
  }
  renderMenuIcon() {
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.05)"
        onPress={() => {
          this.fileOptionRef.current.open();
        }}>
        <Icon name={'options'} size={normalize(22)} color="black" />
      </TouchableHighlight>
    );
  }
  renderSearchIcon() {
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.05)"
        onPress={() => {
          this.setState({searchOn: true});
        }}>
        <Icon name={'Contact_Search'} size={normalize(23)} color="black" />
      </TouchableHighlight>
    );
  }

  fileSelected(file, checked) {
    let data = this.state.filesList;
    const indexValue = data.findIndex((a) => a.id === file.id);
    data[indexValue].isSelected = checked;
    this.setState({filesList: data});
    if (checked) {
      let selectedId = this.state.selectedFiles.concat(file);
      this.setState({selectedFiles: selectedId});
    } else {
      let array = [...this.state.selectedFiles]; // make a separate copy of the array
      //var index = array.indexOf(file.id);
      var index = array.findIndex((i) => i.id === file.id);
      if (index !== -1) {
        array.splice(index, 1);
        this.setState({selectedFiles: array});
      }
    }
  }
  renderFileOption() {
    var optionList = [];
    if (this.state.selectedFiles.length < 2) {
      optionList = fileOptions;
    } else {
      optionList = fileOptionsReduced;
    }
    return (
      <BottomUpModal ref={this.fileOptionRef}>
        <View style={{padding: 10}} />

        {optionList.map((options) => (
          <TouchableHighlight
            key={options.id}
            onPress={() => {
              this.fileOptions(this.state.selectedFiles, options.id);
            }}
            style={styles.s3}
            underlayColor="rgba(0,0,0,0.05)">
            <View style={styles.s4}>
              <Icon name={options.icon} color="black" size={normalize(24)} />
              <Text style={styles.textStyle}>{options.text}</Text>
            </View>
          </TouchableHighlight>
        ))}
      </BottomUpModal>
    );
  }

  async saveFile(directoryPath, response, fileId, index) {
    let self = this;

    let fileType = response.filename.split('.').pop().toLowerCase();

    let filePath = directoryPath + fileId + '.' + fileType;

    await RNFetchBlob.fs.exists(filePath).then((exists) => {
      if (exists) {
        console.log('This file exist ', filePath);
        self.updateFilePath(filePath, index);
      } else {
        RNFetchBlob.config({
          // response data will be saved to this path if it has access right.
          path: filePath,
        })
          .fetch('GET', response.mediaUrl)
          .then((res) => {
            // the path should be dirs.DocumentDir + 'path-to-file.anything'
            console.log('The file saved to ', res.path());
            Toast.showWithGravity('Downloaded', Toast.SHORT, Toast.CENTER);
            self.updateFilePath(filePath, index);
          });
      }
    });
  }

  getFilePath(directoryPath, response, fileId, index) {
    let self = this;
    return new Promise(function (resolve, reject) {
      RNFetchBlob.fs
        .exists(directoryPath)
        .then((exists) => {
          if (!exists) {
            RNFetchBlob.fs
              .mkdir(directoryPath)
              .then(() => {
                self.saveFile(directoryPath, response, fileId, index);
              })
              .catch((error) => {
                console.log('PATH_TO_CREATE ERROR : ' + error);
              });
          } else {
            self.saveFile(directoryPath, response, fileId, index);
          }
        })
        .catch((error) => {
          console.log('PATH CHECK ERROR : ' + error);
        });
    });
  }

  updateFilePath(filePath, index) {
    let newMediaList = this.state.filesList;
    newMediaList[index].localFilePath = filePath;
    this.setState({filesList: newMediaList});
  }

  renderDownload(fileData) {
    let data = this.state.filesList;
    const indexValue = data.findIndex((a) => a.id === fileData.id);
    if (data[indexValue].localFilePath) {
      let filePathAudio = data[indexValue].localFilePath;
      Toast.showWithGravity('File already exists', Toast.SHORT, Toast.CENTER);
      console.log('This file exist ', data[indexValue].localFilePath);
      return;
    }

    let account = AccountManager.getCurrentAccount();
    let KoraV2_DIR_Name = account?.user?.id || 'KoraV2';
    var directoryPath = '';
    if (isAndroid) {
      directoryPath =
        RNFetchBlob.fs.dirs.SDCardDir + '/' + KoraV2_DIR_Name + '/';
    } else {
      directoryPath =
        RNFetchBlob.fs.dirs.CacheDir + '/' + KoraV2_DIR_Name + '/';

      console.log('sdcard path', directoryPath);
    }
    let fileType = fileData.fileType;

    let filePath = directoryPath + fileData.id + '.' + fileType;

    RNFetchBlob.fs.exists(filePath).then((exists) => {
      if (exists) {
        console.log('This file exist ', filePath);
        this.updateFilePath(filePath, indexValue);
        return;
      } else {
        console.log('Downloading start ........................ ', filePath);
        let url =
          API_URL.appServer +
          'api/1.1/ka/users/' +
          UsersDao.getUserId() +
          '/' +
          fileData.resourceId +
          '/' +
          fileData.id +
          '/signedMediaURL';

        console.log('url : ', url);

        fetch(url, {
          method: 'get',
          headers: new Headers({
            Authorization: 'bearer ' + UsersDao.getAccessToken(),
          }),
        })
          .then((response) => {
            console.log('response', response);
            return response.json();
          })

          .then((responseJson) => {
            this.getFilePath(
              directoryPath,
              responseJson,
              fileData.id,
              indexValue,
            );
          })
          .catch((error) => console.log('ViewFiles :', error));
      }
    });
  }

  renderShareModal() {
    return (
      <BottomUpModalShare
        ref={this.shareModal}
        expandable={false}
        height={height - 270}>
        <ShareComponentView
          shareData={this.state.selectedFiles}
          type="file"
          onNewThreadClick={(data) => {
            console.log('from main share----------', data);
            this.newThread();
          }}
        />
      </BottomUpModalShare>
    );
  }

  renderNewThread() {
    return (
      <BottomUpModalShare
        ref={this.shareNewThreadModal}
        expandable={false}
        height={height - 270}>
        <NewThreadShareComponentView
          type="file"
          shareData={this.state.selectedFiles}
          onFinishThreadClick={(data) => {
            this.onFinish();
          }}
        />
      </BottomUpModalShare>
    );
  }

  newThread() {
    this.shareModal.current?.closeBottomDrawer();
    setTimeout(() => {
      if (this.shareNewThreadModal) {
        this.shareNewThreadModal.current?.openBottomDrawer();
      }
    }, 1000);
  }

  onFinish() {
    this.shareNewThreadModal.current?.closeBottomDrawer();
    this.shareModal.current?.closeBottomDrawer();
  }

  fileOptions(data, type) {
    console.log('file options', data, type);
    if (type === 'forward') {
      this.fileOptionRef.current.close();
      setTimeout(() => {
        if (this.shareModal) {
          this.shareModal.current?.openBottomDrawer();
        }
      }, 1000);
    } else if (type === 'download') {
      this.fileOptionRef.current.close();
      this.renderDownload(data[0]);
    } else if (type === 'details') {
      this.fileOptionRef.current.close();
      navigate('File Details', {
        selectedMessages: data,
      });
    } else {
      console.log(type);
    }
  }

  displayFiles(item) {
    if (item.fileType === 'image' || item.fileType === 'video') {
      return this.renderImage(item.thumbnailURL || emptyArray, item.isSelected);
    } else if (item.fileType === 'attachment') {
      return this.renderAttachment(item.fileExtension, item.isSelected);
    } else if (item.fileType === 'audio') {
      return this.renderAudio(item.isSelected);
    }
  }

  renderImage(thumbnailURL, selected) {
    return (
      <FastImage
        source={{
          uri: API_URL.appServer + thumbnailURL,
        }}
        style={selected ? styles.imageSelected : styles.imageStyle}
      />
    );
  }

  renderAttachment(fileType, selected) {
    return (
      <View style={selected ? styles.selected : styles.attachmentStyle}>
        <FileIcon width={36} height={45} type={fileType} />
      </View>
    );
  }
  renderAudio(selected) {
    return (
      <View style={selected ? styles.audioSelected : styles.audioStyle}>
        <Ionicons
          name={'musical-notes-outline'}
          size={normalize(35)}
          color={'#6182b0'}
        />
      </View>
    );
  }

  renderVideo(selected, thumbnailURL) {
    return (
      <View style={selected ? styles.audioSelected : styles.audioStyle}>
        <FastImage
          source={{
            uri: API_URL.appServer + thumbnailURL,
          }}
          style={selected ? styles.imageSelected : styles.imageStyle}
        />
      </View>
    );
  }
  displayFileIcon(type) {
    return (
      <View style={styles.fileIconStyle}>
        <FileIcon width={22} height={33} type={type} />
      </View>
    );
  }
  onEndReached = () => {
    if (
      this.props.boardFiles?.moreAvailable === true &&
      this.props.boardFiles?.nextPageToken &&
      this.state.searchText.trim() === ''
    ) {
      let _params = {
        boardId: this.props.route.params.threadId,
        nextPageToken: this.props.boardFiles?.nextPageToken,
      };

      this.props.getBoardFiles(_params);
    }
  };

  renderFooterComponent = () => {
    if (this.props.boardsLoading === true) {
      return (
        <View style={{padding: 10}}>
          <Loader />
        </View>
      );
    } else {
      return null;
    }
  };
  render() {
    //console.log(JSON.stringify(this.fileList));
    return (
      <View style={styles.containerStyle}>
        {this.state.searchOn ? this.renderSearchMode() : this.headerView()}
        {this.renderShareModal()}
        {this.renderNewThread()}
        {this.state.fileLoading ? (
          <View style={styles.s5}>
            <Loader />
          </View>
        ) : (
          <View style={styles.viewStyle}>
            {this.fileList?.length === 0 && this.state.searchText?.length > 0 && (
              <View style={styles.noMatch}>
                <Text style={styles.noResultsTextStyle}>No match found!</Text>
              </View>
            )}
            {this.state.filesList?.length === 0 ? (
              <View style={styles.s6}>
                <Placeholder name={'files'} isSvg={true} />
              </View>
            ) : (
              <FlatList
                data={this.fileList || emptyArray}
                renderItem={({item, index}) => (
                  <View style={styles.flatlistStyle}>
                    {this.state.checkBoxEnabled ? (
                      <TouchableOpacity
                        onLongPress={() => {
                          this.renderCheckBox();
                          this.setState({
                            selectedFiles: [],
                          });
                        }}
                        onPress={() =>
                          this.fileSelected(item, !item.isSelected)
                        }
                        style={styles.s8}>
                        {this.displayFiles(item)}
                        <View style={styles.checkboxStyle}>
                          {item.isSelected ? (
                            <View style={styles.selectedUI}>
                              <Icon
                                name={'SingleTick'}
                                size={normalize(13)}
                                color={'#fff'}
                                style={styles.checkboxTickImg}
                              />
                            </View>
                          ) : (
                            <View style={styles.uncheckedCheckbox} />
                          )}
                        </View>
                        {/* {this.displayFileIcon(item.fileExtension)} */}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        onLongPress={() => this.renderCheckBox()}
                        onPress={() =>
                          navigate(ROUTE_NAMES.CHAT_MEDIA_VIEW, {
                            viewFiles: true,
                            components: [item] || emptyArray,
                            messageId: item.resourceId,
                            titleName: this.props.route.params.titleName || '',
                            selectedComponentID: item?.id,
                          })
                        }>
                        {this.displayFiles(item)}
                        {/* {this.displayFileIcon(item.fileExtension)} */}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                numColumns={3}
                keyExtractor={(item) => item.id}
                onEndReachedThreshold={0.1}
                onEndReached={this.onEndReached}
                ListFooterComponent={this.renderFooterComponent}
              />
            )}
            {this.state.checkBoxEnabled ? (
              <SafeAreaView>
                {this.state.selectedFiles.length !== 0 ? (
                  <ViewFilesOptions
                    selectedFile={this.state.selectedFiles}
                    onPressAction={(data, id) => {
                      this.fileOptions(data, id);
                    }}
                  />
                ) : null}
              </SafeAreaView>
            ) : null}
          </View>
        )}
        {this.renderFileOption()}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  noMatch: {
    width: '100%',
    minHeight: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  s8: {
    backgroundColor: '#E7F1FF',
    borderRadius: 4,
  },
  s7: {
    fontWeight: '500',
    fontSize: normalize(18),
    fontStyle: 'normal',
  },
  s6: {
    backgroundColor: 'white',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  s5: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // opacity: 0.5,
    zIndex: 5,

    justifyContent: 'center',
    alignItems: 'center',
  },
  s4: {flexDirection: 'row', alignItems: 'center'},
  s3: {
    padding: 15,
    margin: 4,
    borderRadius: 5,
  },
  s2: {
    flex: 1,
    borderColor: '#E5E8EC',
    borderWidth: 1,
    borderRadius: 8,
    height: 38,
    flexDirection: 'row',
    alignItems: 'center',
  },
  s1: {
    /*     flexDirection: 'row',

    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'grey',
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
    backgroundColor: 'white', */

    minHeight: 54,
    maxHeight: 60,
    paddingBottom: isAndroid ? 10 : 0,
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#BDC1C6',
    borderBottomWidth: 0.7,
    borderBottomColor: '#BDC1C6',
    backgroundColor: 'white',
  },
  selectedUI: {
    borderRadius: 2,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0D6EFD',
  },
  uncheckedCheckbox: {
    borderRadius: 2,
    flex: 1,
    backgroundColor: '#fff',
    borderColor: '#BDC1C6',
    borderWidth: 1,
  },
  checkboxTickImg: {
    width: '85%',
    height: '85%',
    tintColor: '#ffffff',
    resizeMode: 'contain',
  },

  textStyle: {
    marginLeft: 10,
    fontSize: normalize(16),
    fontWeight: '500',
    fontStyle: 'normal',
  },
  mainView: {
    margin: 25,
    marginBottom: 10,
  },
  dropdownView: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    marginTop: 1,
    flexDirection: 'row',
  },
  viewStyle: {
    justifyContent: 'space-between',
    margin: 5,
    flex: 1,
  },
  fileIconStyle: {
    bottom: 4,
    left: 7,
    position: 'absolute',
  },
  checkboxStyle: {
    height: 18,
    width: 18,
    bottom: 87,
    left: 10,
    position: 'absolute',
  },
  documentIconStyle: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 2,
    borderRadius: 3,
    backgroundColor: '#E7F1FF',
    borderColor: '#0D6EFD',
  },
  imageSelected: {
    height: 97,
    width: screenWidth / 3 - 31,
    margin: 9,
    borderRadius: 4,
  },
  imageStyle: {
    height: 115,
    width: screenWidth / 3 - 13,
    borderWidth: 1,
    borderColor: '#E4E5E7',
    borderRadius: 4,
  },
  selected: {
    height: 97,
    width: screenWidth / 3 - 31,
    margin: 9,
    borderRadius: 4,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  attachmentStyle: {
    height: 115,
    width: screenWidth / 3 - 13,
    borderWidth: 1,
    borderColor: '#E4E5E7',
    borderRadius: 4,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  audioSelected: {
    height: 97,
    width: screenWidth / 3 - 31,
    margin: 9,
    borderRadius: 4,
    backgroundColor: '#85B7FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioStyle: {
    height: 115,
    width: screenWidth / 3 - 13,
    borderWidth: 1,
    borderColor: '#E4E5E7',
    borderRadius: 4,
    backgroundColor: '#85B7FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flatlistStyle: {
    marginLeft: 7,
    marginTop: 10,
  },
  containerStyle: {
    flex: 1,
    backgroundColor: 'white',
  },
  searchTextInputStyle: {
    flex: 1,
    fontSize: normalize(16),
    fontWeight: '500',
    fontStyle: 'normal',
    color: '#202124',
    alignItems: 'center',
    textAlignVertical: 'center',
    padding: 0,
  },
});
const mapStateToProps = (state) => {
  const {messageThreadList} = state;
  return {
    boardFiles: messageThreadList.boardFiles,
    boardsLoading: messageThreadList.boardsLoading,
    boardFilesFail: messageThreadList.boardFilesFail,
  };
};

export default connect(mapStateToProps, {
  getBoardFiles,
})(ViewFiles);
