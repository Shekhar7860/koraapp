import React from 'react';
import {
  Dimensions,
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableHighlight,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import {Header} from '../navigation/TabStacks';
import * as Constants from '../components/KoraText';
import {Icon} from '../components/Icon/Icon';
import {normalize} from '../utils/helpers';
import {fontFamily} from '../components/KoraText';
import {withTranslation, useTranslation} from 'react-i18next';
import FileIcon from '../components/Chat/FileIcon';
import {getFileKilobyteSize} from '../components/Chat/helper';
import {getTimeline} from '../utils/helpers';
import {connect} from 'react-redux';
import {getContactList} from '../../shared/redux/actions/create-message.action';
import API_URL from '../../../env.constants';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as UsersDao from '../../dao/UsersDao';
const screenWidth = Math.round(Dimensions.get('window').width);

class FileDetails extends React.Component {
  constructor(props) {
    super(props);
  }

  headerView() {
    return (
      <Header
        {...this.props}
        title={'Details'}
        goBack={true}
        rightContent={this.renderMenuIcon()}
      />
    );
  }

  renderMenuIcon() {
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.05)"
        onPress={() => {}}
        style={styles.headerIconStyle}>
        <Icon name={'options'} size={normalize(22)} color="black" />
      </TouchableHighlight>
    );
  }

  renderImage(thumbnailURL) {
    return (
      <Image
        source={{
          uri: API_URL.appServer + thumbnailURL,
        }}
        style={styles.imageStyle}
      />
    );
  }

  renderAttachment(fileType) {
    return (
      <View style={styles.attachmentStyle}>
        <FileIcon width={36} height={45} type={fileType} />
      </View>
    );
  }

  renderAudio() {
    return (
      <View style={styles.audioStyle}>
        <Ionicons
          name={'musical-notes-outline'}
          size={normalize(40)}
          color={'#6182b0'}
        />
      </View>
    );
  }

  renderVideo() {
    return (
      <View style={styles.audioStyle}>
        <FontAwesome
          name={'video-camera'}
          size={normalize(40)}
          color={'#6182b0'}
        />
      </View>
    );
  }

  viewFile(item) {
    if (item.fileType === 'image') {
      return this.renderImage(item.thumbnailURL);
    } else if (item.fileType === 'attachment') {
      return this.renderAttachment(item.fileExtension);
    } else if (item.fileType === 'audio') {
      return this.renderAudio();
    } else {
      return this.renderVideo();
    }
  }

  render() {
    const {t} = this.props;
    const file = this.props.route.params.selectedMessages[0];
    let type = file?.fileType;
    type = type.charAt(0).toUpperCase() + type.slice(1);
    let indexValue = this.props.contactlist?.findIndex(
      (item) => item._id === file.uploadedBy,
    );
    let creatorName =
      this.props.contactlist[indexValue]?.fN +
      ' ' +
      this.props.contactlist[indexValue]?.lN;
    if (file.uploadedBy === UsersDao.getUserId()) {
      creatorName = UsersDao.getUserName();
    }
    return (
      <View style={styles.containerStyle}>
        {this.headerView()}
        <View style={{margin: 20}}>
          {this.viewFile(file)}
          {/* {file.fileType == 'image'
            ? this.renderImage(file.thumbnailURL)
            : file.fileType === 'attachment'
            ? this.renderAttachment(file.fileExtension)
            : file.fileType === 'audio'
            ? this.renderAudio()
            : null} */}
        </View>
        <View style={styles.viewStyle}>
          <Text style={styles.textStyle}>{t('Creator')}</Text>
          <Text style={styles.valueStyle}>{creatorName}</Text>
        </View>
        <View style={styles.viewStyle}>
          <Text style={styles.textStyle}>{t('Type')}</Text>
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                marginRight: 10,
                marginTop: 20,
              }}>
              <FileIcon width={25} height={35} type={file.fileExtension} />
            </View>
            <Text style={styles.valueStyle}>{type}</Text>
          </View>
        </View>
        <View style={styles.viewStyle}>
          <Text style={styles.textStyle}>{t('Shared date')}</Text>
          <Text style={styles.valueStyle}>
            {getTimeline(file.createdOn, 'file')}
          </Text>
        </View>
        <View style={styles.viewStyle}>
          <Text style={styles.textStyle}>{t('Modified date')}</Text>
          <Text style={styles.valueStyle}>
            {getTimeline(file.createdOn, 'file')}
          </Text>
        </View>
        <View style={styles.viewStyle}>
          <Text style={styles.textStyle}>{t('Size')}</Text>
          <Text style={styles.valueStyle}>
            {getFileKilobyteSize(file.size)}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  valueStyle: {
    fontFamily: fontFamily,
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: normalize(16),
    lineHeight: 20,
    marginTop: 18,
  },
  viewStyle: {
    margin: 18,
    marginLeft: 21,
  },
  textStyle: {
    fontFamily: fontFamily,
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: normalize(16),
    lineHeight: 19,
    color: '#9AA0A6',
  },
  headerIconStyle: {
    flexDirection: 'column',
    justifyContent: 'center',
    borderRadius: 5,
  },
  containerStyle: {
    flex: 1,
    backgroundColor: 'white',
  },
  imageStyle: {
    height: 190,
    width: screenWidth - 40,
    borderWidth: 1.5,
    borderColor: '#BDC1C6',
    borderRadius: 9,
  },
  attachmentStyle: {
    height: 190,
    backgroundColor: '#FFF1ED',
    width: screenWidth - 40,
    borderWidth: 1.5,
    borderColor: '#BDC1C6',
    borderRadius: 9,
    alignItems: 'center',
  },
  audioStyle: {
    height: 190,
    width: screenWidth - 40,
    borderWidth: 1.5,
    borderColor: '#BDC1C6',
    borderRadius: 9,
    backgroundColor: '#85B7FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const mapStateToProps = (state) => {
  let {createMessage} = state;
  return {
    contactlist: createMessage.contactlistData,
  };
};

export default connect(mapStateToProps, {getContactList})(
  withTranslation()(FileDetails),
);
