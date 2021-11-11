import React, {memo, useEffect} from 'react';
import {View, Image, StyleSheet} from 'react-native';
import * as Constants from '../../KoraText';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import {Text} from '../../KoraText';
import {normalize} from '../../../utils/helpers';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {TouchableHighlight} from 'react-native-gesture-handler';
import {Icon} from '../../Icon/Icon';
import FileIcon from '../FileIcon';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import {getPrettifiedFileSize} from '../helper';
const play_icon = <Play width={18} height={18} type={'play'} />;
import Play from '../../../assets/files/play.svg';
import AudioCompnent from '../AudioCompnent';

const _Component = ({
  component,
  count,
  aspectRatio,
  hideFileName,
  leftCornerRadius,
  rightTopRadius,
  rightBottomRadius,
}) => {
  const {componentType, componentLength} = component;
  let {thumbnailURL, componentThumbnails} = component;

  if (!thumbnailURL && componentThumbnails && componentThumbnails.length > 0) {
    if (componentThumbnails[0].localFilePath !== null) {
      thumbnailURL = componentThumbnails[0].localFilePath;
    } else {
      thumbnailURL = componentThumbnails[0].url;
    }
  }
  var componentDataT = '';
  var componentSizeT = '';
  var filenameT = '';
  var fileTypeT = '';
  const Filename = component?.componentData?.filename;
  if (componentType === 'attachment') {
    const {componentData, componentSize} = component;
    const name = componentData?.filename;
    filenameT = name;
    let type = null;

    if (name) {
      type = name.split('.').pop().toLowerCase();
    }
    componentDataT = componentData;
    componentSizeT = componentSize;
    fileTypeT = type;
  }
  return (
    <View style={styles.audioOrVideo1}>
      {componentType === 'video' ? (
        <LinearGradient
          colors={['#FFFFFF00', '#FFFFFF00', '#44464d']}
          style={styles.audioOrVideo}>
          {true ? (
            //  <Icon name={'Group'} size={24} color="#202124" />
            <View style={styles.videoParent}>
              {componentType === 'video' ? (
                <View style={styles.videoStyle}>
                  <Icon name={'PlayWhite'} size={24} color={'#6182b0'} />
                </View>
              ) : null}
              {/* <Text style={styles.componentTextStyle}>
              {componentType === 'video' ? (
                <FontAwesome name={'video-camera'} />
              ) : (
                <Ionicons
                  name={'musical-notes-outline'}
                  size={24}
                  color={'#6182b0'}
                />
              )}{' '}
              {/* {componentLength} */}
              {/* </Text> */}
              {/* */}
            </View>
          ) : null}
        </LinearGradient>
      ) : null}
      <View
        style={[
          styles.imageParentView,
          {
            borderTopLeftRadius: leftCornerRadius,
            borderBottomLeftRadius: leftCornerRadius,
            borderTopRightRadius: rightTopRadius,
            borderBottomRightRadius: rightBottomRadius,
          },
        ]}>
        <Image
          source={{uri: thumbnailURL}}
          // defaultSource={{uri: thumbnailURL}}
          style={[styles.imageStyle, {aspectRatio: aspectRatio}]}
          // resizeMode={'cover'}
          // resizeMethod={'resize'}
        />
      </View>
      {componentType === 'audio' ? (
        <View style={styles.audioStyle}>
          {!hideFileName ? (
            <View style={localStyles.filterComponentAudio}>
              <Text numberOfLines={2} style={styles.fileNameTextStyle}>
                {Filename}
              </Text>
            </View>
          ) : null}
          <View style={localStyles.filterComponent2}>
            <Ionicons
              name={'musical-notes-outline'}
              size={24}
              color={'#6182b0'}
            />
          </View>
        </View>
      ) : null}
      {componentType === 'attachment' ? (
        <View style={styles.fileStyle}>
          <View style={localStyles.filterComponent5}>
            {!hideFileName ? (
              <Text
                numberOfLines={1}
                lineBreakMode={'clip'}
                style={styles.fileNameTextStyle}>
                {filenameT}
              </Text>
            ) : null}
          </View>
          <View style={localStyles.filterComponent1}>
            {fileTypeT ? (
              <View style={localStyles.filterComponent2}>
                <FileIcon width={36} height={45} type={fileTypeT} />
              </View>
            ) : (
              <View style={localStyles.filterComponent3}>
                <Icon name={'document'} size={16} color={'#85B7FE'} />
              </View>
            )}
          </View>
          <View style={localStyles.filterComponent4}>
            <View style={localStyles.filterComponent6}>
              <View>
                <Text>&nbsp;</Text>
              </View>
              <View style={localStyles.filterComponent7}>
                {!hideFileName ? (
                  <Text style={styles.fileSizeTextStyle}>
                    {getPrettifiedFileSize(componentSizeT)}
                  </Text>
                ) : null}
                {!hideFileName ? (
                  <AntDesignIcon
                    style={localStyles.filterComponent8}
                    name={'arrowdown'}
                    color={'#5F6368'}
                  />
                ) : null}
              </View>
            </View>
          </View>
        </View>
      ) : null}
      {count > 0 ? (
        <View style={styles.multiStyle}>
          <Text style={styles.countTextStyle}>+{count + 1}</Text>
        </View>
      ) : null}
    </View>
  );
};

export const Component = memo(_Component);

export const MultiComponentView = memo((props) => {
  const {components, postId, audioPlayer, hindeControls = false} = props;
  const hasMoreImagesCount = components?.length - 3;

  function navigationLong() {
    if (props?.onLongClickMedia) {
      props?.onLongClickMedia();
    }
  }

  function navigation(component) {
    if (props?.particularMediaClick) {
      let componentID = component.componentId;
      props?.particularMediaClick(componentID);
    }
  }

  function playPauseClick(url, audioCallback = null) {
    // console.log('---------> playPauseClick <-----------', url);
    if (audioPlayer) {
      if (audioPlayer.isPlayingAudio()) {
        audioPlayer.pauseAudio();
        if (url !== audioPlayer.getFilePath()) {
          setTimeout(() => {
            audioPlayer?._reloadPlayer(url, audioCallback);
          }, 500);
          // audioPlayer?.stop();
        }
      } else {
        if (url === audioPlayer.getFilePath()) {
          // audioPlayer.seek(0);
          setTimeout(() => {
            audioPlayer._playPause(url, audioCallback);
          }, 500);
        } else {
          audioPlayer.stop();
          setTimeout(() => {
            audioPlayer._reloadPlayer(url, audioCallback);
          }, 500);
        }
        // setTimeout(() => {

        //}, 500);
      }
    }
  }
  function sliderSeek(percentage) {
    if (audioPlayer && audioPlayer.isPlayingAudio()) {
      // console.log('---------> sliderSeek <-----------', percentage);
      audioPlayer.seek(percentage);
    }
  }

  function audioComponent(component) {
    return (
      <View>
        {!hindeControls ? (
          <AudioCompnent
            playPauseClick={(url, audioCallback) => {
              playPauseClick(url, audioCallback);
            }}
            sliderSeek={(percentage) => {
              if (audioPlayer && audioPlayer.isPlayingAudio()) {
                audioPlayer?.seek(percentage);
              }
            }}
            item={component._raw}
            postId={postId}
            sliderMax={100}
            sliderMin={1}
            btnState="Play"
            duration={component?.componentLength}
          />
        ) : (
          <View
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              height: 46,
              width: 46,
            }}>
            <Play />
          </View>
        )}
      </View>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
        borderRadius: props.borderRadius,
        marginTop: 5,
      }}>
      {components?.length >= 3 ? (
        <>
          <View style={styles.components11}>
            <TouchableHighlight
              onLongPress={() => {
                navigationLong();
              }}
              style={{
                flexShrink: 1,
                borderTopLeftRadius: props.borderRadius,
                borderBottomLeftRadius: props.borderRadius,
                borderColor: '#BDC1C6',
                borderWidth: 1,
                overflow: 'hidden',
              }}
              onPress={() => {
                navigation(components[0]);
              }}>
              <Component
                component={components[0]}
                aspectRatio={1.15}
                leftCornerRadius={10}
                rightTopRadius={0}
                rightBottomRadius={0}
              />
            </TouchableHighlight>
          </View>

          <View
            style={{
              width: '30%',
              flexDirection: 'column',
              borderTopRightRadius: props.borderRadius,
              borderBottomRightRadius: props.borderRadius,
              overflow: 'hidden',
            }}>
            <TouchableHighlight
              onLongPress={() => {
                navigationLong();
              }}
              style={{
                borderTopRightRadius: props.borderRadius,
                borderColor: '#BDC1C6',
                borderWidth: 1,
                marginBottom: 1,
                overflow: 'hidden',
              }}
              onPress={() => {
                navigation(components[1]);
              }}>
              <Component
                component={components[1]}
                aspectRatio={1}
                hideFileName={true}
                leftCornerRadius={0}
                rightTopRadius={10}
                rightBottomRadius={0}
              />
            </TouchableHighlight>

            <TouchableHighlight
              style={{
                borderBottomRightRadius: props.borderRadius,
                borderColor: '#BDC1C6',
                borderWidth: 1,
              }}
              onLongPress={() => {
                navigationLong();
              }}
              onPress={() => {
                navigation(components[2]);
              }}>
              <Component
                component={components[2]}
                count={hasMoreImagesCount}
                aspectRatio={1}
                hideFileName={true}
                leftCornerRadius={0}
                rightTopRadius={0}
                rightBottomRadius={10}
              />
            </TouchableHighlight>
          </View>
        </>
      ) : null}
      {components?.length === 2 ? (
        <>
          <View style={styles.components2}>
            <View style={styles.components3}>
              <TouchableHighlight
                onLongPress={() => {
                  navigationLong();
                }}
                style={{
                  borderTopLeftRadius: props.borderRadius,
                  borderBottomLeftRadius: props.borderRadius,
                  borderColor: '#BDC1C6',
                  borderWidth: 1,
                }}
                onPress={() => {
                  navigation(components[0]);
                }}>
                <Component
                  component={components[0]}
                  aspectRatio={0.8}
                  showCornerRadiusLeft={true}
                  leftCornerRadius={10}
                  rightTopRadius={0}
                  rightBottomRadius={0}
                />
              </TouchableHighlight>
            </View>
            <View style={styles.components4}>
              <TouchableHighlight
                onLongPress={() => {
                  navigationLong();
                }}
                style={{
                  borderTopRightRadius: props.borderRadius,
                  borderBottomRightRadius: props.borderRadius,
                  borderColor: '#BDC1C6',
                  borderWidth: 1,
                }}
                onPress={() => {
                  navigation(components[1]);
                }}>
                <Component
                  component={components[1]}
                  aspectRatio={0.8}
                  leftCornerRadius={0}
                  rightTopRadius={10}
                  rightBottomRadius={10}
                />
              </TouchableHighlight>
            </View>
          </View>
        </>
      ) : null}
      {components?.length === 1 ? (
        // <>
        components[0].componentType === 'audio' ? (
          <View
            style={{
              backgroundColor: '#EFF0F1',
              paddingStart: 10,
              paddingEnd: 6,
            }}>
            {audioComponent(components[0])}
          </View>
        ) : (
          <View style={styles.components1}>
            <View
              style={{
                borderRadius: props.borderRadius,
                overflow: 'hidden',
                borderColor: '#BDC1C6',
                borderWidth: 1,
              }}>
              <TouchableHighlight
                onLongPress={() => {
                  navigationLong();
                }}
                onPress={() => {
                  navigation(components[0]);
                }}>
                <Component component={components[0]} aspectRatio={16 / 9} />
              </TouchableHighlight>
            </View>
          </View>
        )
      ) : // </>
      null}
    </View>
  );
});

const styles = StyleSheet.create({
  componentTextStyle: {
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    zIndex: 1,
  },
  countTextStyle: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: normalize(19),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    //backgroundColor: 'white',
  },
  audioOrVideo1: {overflow: 'hidden'},
  audioOrVideo: {
    overflow: 'hidden',
    width: '100%',
    margin: 1,
    height: '100%',
    position: 'absolute',
    justifyContent: 'flex-end',
    padding: 11,
    zIndex: 1,
  },
  imageParentView: {
    width: '100%',
    height: null,
    overflow: 'hidden',
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageStyle: {
    width: '100%',
    overflow: 'hidden',
    // borderTopLeftRadius: 10,
    // borderLeftColor: 'white',
    // borderColor: 'white',
    // borderWidth: 1,
    resizeMode: 'cover',
    height: null,
  },
  videoParent: {
    width: '100%',
    height: '100%',
    justifyContent: 'space-evenly',
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  audioStyle: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    padding: 11,
    backgroundColor: '#85B7FE',
  },
  videoStyle: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  fileStyle: {
    overflow: 'hidden',
    width: '100%',
    height: '100%',
    position: 'absolute',
    // justifyContent: 'center',
    // alignContent: 'center',
    // alignItems: 'center',
    padding: 20,
  },
  multiStyle: {
    backgroundColor: 'black',
    width: '100%',
    height: '100%',
    opacity: 0.7,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  components11: {
    width: '70%',
    paddingRight: 2,
    overflow: 'hidden',
  },
  components2: {
    width: '100%',
    flexDirection: 'row',
  },
  components3: {
    width: '50%',
    paddingRight: 1,
  },
  components4: {
    width: '50%',
    paddingLeft: 1,
  },
  components1: {
    width: '100%',
    overflow: 'hidden',
  },
  fileSizeTextStyle: {
    textAlign: 'right',
  },
  fileNameTextStyle: {
    color: '#202124',
    lineHeight: 17,
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});
const localStyles = StyleSheet.create({
  authorStyle1: {
    flexDirection: 'column',
    marginHorizontal: 10,
    minWidth: 40,
  },
  filterComponent1: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '60%',
  },
  filterComponent2: {
    height: 40,
    width: 40,

    alignItems: 'center',
    justifyContent: 'center',
  },
  filterComponent3: {
    borderWidth: 0,
    borderBottomWidth: 2,
    borderRadius: 3,
    backgroundColor: '#F8F9FA',
    borderColor: '#85B7FE',
  },

  filterComponent4: {
    flexDirection: 'column',

    height: '20%',
    justifyContent: 'flex-end',
  },
  filterComponentAudio: {marginBottom: 5},
  filterComponent5: {justifyContent: 'flex-start', height: '20%'},
  filterComponent6: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignSelf: 'flex-end',
  },
  filterComponent7: {
    flexDirection: 'row',

    alignItems: 'center',
  },
  filterComponent8: {
    justifyContent: 'flex-end',
    alignItems: 'baseline',
  },
  unfurlUrl1: {
    flexDirection: 'column',
    backgroundColor: '#F7F7F7',
    borderRadius: 8,
    padding: 5,
    marginEnd: 5,
  },
  unfurlUrl2: {
    flex: 1,
    flexDirection: 'column',
    marginEnd: 5,
    alignSelf: 'baseline',
  },
  unfurlUrl3: {
    height: 50,
    width: 80,
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  unfurlUrl4: {
    height: 50,
    minHeight: 30,
    width: 80,
    borderColor: 'gray',
    resizeMode: 'cover',
    alignSelf: 'center',
    borderRadius: 6,
    alignContent: 'center',
    overflow: 'hidden',
  },
  multiEmoji1: {
    position: 'relative',
    borderRadius: 19,
    zIndex: 20,
    // width: 23,
    marginHorizontal: -3,
    borderColor: 'white',
    backgroundColor: '#F8F9FA',
  },
  multiEmoji2: {flexShrink: 0, overflow: 'visible'},
  multiEmoji3: {flexDirection: 'row', alignItems: 'center'},
  multiSelect1: {
    // height: 50,
    width: 50,
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    paddingRight: 20,
  },
  msgRetry1: {marginLeft: 7},
  hasReminder1: {
    backgroundColor: '#EFF0F1',
    flexDirection: 'row',
    borderRadius: 4,
    padding: 4,
  },
  hasReminder2: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-start',
  },
});
