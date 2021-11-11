import React from 'react';
//import {getLinkPreview} from 'link-preview-js';
import PropTypes from 'prop-types';
import {normalize} from '../../utils/helpers';
import {
  Image,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  View,
  ViewPropTypes,
  TouchableWithoutFeedback,
} from 'react-native';
import {Icon} from '../Icon/Icon';
//ref from https://www.npmjs.com/package/react-native-url-preview

//const REGEX = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/g;
import {SvgUri, SvgCssUri} from 'react-native-svg';

import {LinkPreview, getPreviewData} from '@flyerhq/react-native-link-preview';

export default class RNUrlPreview extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      isUri: false,
      linkTitle: undefined,
      linkDesc: undefined,
      linkFavicon: undefined,
      linkImg: undefined,
    };
    this.getPreview(props.text);
  }
  checkValidData = (data) => {
    if (!data) {
      return false;
    }
    // {"description": undefined, "image": undefined, "link": undefined, "title": undefined}

    if (!data.description || !data.link || !data.title) {
      return false;
    }

    return true;
  };

  hidePreview = () => {
    this.setState({isUri: false});
  };

  getPreview = (url) => {
    const {onError, onLoad} = this.props;
    getPreviewData(url)
      .then((data) => {
        console.log('url  ------>:', url);
        console.log('getPreviewData  ==============>:', data);
        if (this.checkValidData(data)) {
          //{"description": undefined, "image": undefined, "link": undefined, "title": undefined}
          onLoad(data);
          this.setState({
            isUri: true,
            linkTitle: data.title ? data.title : undefined,
            linkDesc: data.description ? data.description : undefined,
            linkImg: data.image && data.image.url ? data.image.url : undefined,
          });
        }
      })
      .catch((error) => {
        console.log('error ----------->: ', error);
        onError(error);
        this.setState({isUri: false});
      });
  };

  // getPreview_test = (text) => {
  //   console.log('text_1  ------>:', text);
  //   this.getPreview_1(text);

  //   const {onError, onLoad} = this.props;
  //   getLinkPreview(text)
  //     .then((data) => {
  //       console.log('data_1  ------> ', data);
  //       //  let isValid = this.checkValidData(data);
  //       //  if (isValid) {
  //       onLoad(data);
  //       this.setState({
  //         isUri: true,
  //         linkTitle: data.title ? data.title : undefined,
  //         linkDesc: data.description ? data.description : undefined,
  //         linkImg:
  //           data.images && data.images.length > 0
  //             ? data.images.find(function (element) {
  //                 return (
  //                   element.includes('.png') ||
  //                   element.includes('.jpg') ||
  //                   element.includes('.jpeg') ||
  //                   element.includes('.svg')
  //                 );
  //               })
  //             : undefined,
  //         linkFavicon:
  //           data.favicons && data.favicons.length > 0
  //             ? data.favicons[data.favicons.length - 1]
  //             : undefined,
  //       });
  //       // }
  //     })
  //     .catch((error) => {
  //       console.log('error ----------->: ', error);
  //       onError(error);
  //       this.setState({isUri: false});
  //     });
  // };

  componentDidUpdate(nextProps) {
    console.log(
      'componentDidUpdate this.props.text----------->: ',
      this.props.text,
    );
    // if (nextProps.text !== this.props.text) {
    //   this.getPreview(this.props.text);
    // } else
    if (!this.props.text || this.props.text === '') {
      this.setState({isUri: false});
    }
  }

  _onLinkPressed = () => {
    //Linking.openURL(this.props.text.match(REGEX)[0]);
  };

  renderImage = (
    imageLink,
    faviconLink,
    imageStyle,
    faviconStyle,
    imageProps,
  ) => {
    // console.log('faviconLink ----->:', faviconLink);
    let fileExtension = imageLink?.split('.').pop().toLowerCase();
    // console.log('fileExtension _123 ----->:', fileExtension);
    return imageLink ? (
      fileExtension && fileExtension === 'svg' ? (
        <SvgCssUri height={50} width={80} uri={imageLink} />
      ) : (
        <Image style={imageStyle} source={{uri: imageLink}} {...imageProps} />
      )
    ) : faviconLink ? (
      <Image style={faviconStyle} source={{uri: faviconLink}} {...imageProps} />
    ) : null;
  };

  renderHeader = (
    showTitle,
    title,
    description,
    textContainerStyle,
    titleStyle,
    descriptionStyle,
    titleNumberOfLines,
    descriptionNumberOfLines,
  ) => {
    return (
      <View style={{}}>
        {showTitle && (
          <Text numberOfLines={titleNumberOfLines} style={titleStyle}>
            {title}
          </Text>
        )}
      </View>
    );
  };
  renderText = (
    showTitle,
    title,
    description,
    textContainerStyle,
    titleStyle,
    descriptionStyle,
    titleNumberOfLines,
    descriptionNumberOfLines,
  ) => {
    return (
      <View style={textContainerStyle}>
        {/* {showTitle && (
                    <Text numberOfLines={titleNumberOfLines} style={titleStyle}>
                        {title}
                    </Text>
                )} */}
        {description && (
          <Text
            numberOfLines={descriptionNumberOfLines}
            style={descriptionStyle}>
            {description}
          </Text>
        )}
      </View>
    );
  };
  renderLinkPreview = (
    containerStyle,
    imageLink,
    faviconLink,
    imageStyle,
    faviconStyle,
    showTitle,
    title,
    description,
    textContainerStyle,
    titleStyle,
    descriptionStyle,
    titleNumberOfLines,
    descriptionNumberOfLines,
    imageProps,
    onDeleteClick,
  ) => {
    return (
      <View
        style={[styles.containerStyle, containerStyle, styles.containerStyle1]}>
        <View
          style={[
            styles.containerStyle,
            containerStyle,
            {
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 2,
              paddingEnd: 5,
            },
          ]}>
          {showTitle && (
            <Text numberOfLines={titleNumberOfLines} style={[titleStyle, {}]}>
              {title}
            </Text>
          )}
          <View
            style={{
              marginTop: 2,
              paddingLeft: 10,
              // position: 'absolute',
            }}>
            <TouchableOpacity
              style={{}}
              onPress={() => {
                if (onDeleteClick) {
                  onDeleteClick();
                } else {
                  // console.log("props.onDeleteClick ------> ", onDeleteClick)
                }
              }}>
              <Icon color={'black'} name={'Close'} size={20} />
            </TouchableOpacity>
          </View>
        </View>

        <View
          style={[styles.containerStyle, {flexDirection: 'row', marginTop: 6}]}
          activeOpacity={0.9}>
          {this.renderText(
            showTitle,
            title,
            description,
            textContainerStyle,
            titleStyle,
            descriptionStyle,
            titleNumberOfLines,
            descriptionNumberOfLines,
          )}
          <View
            style={{
              borderColor: '#E4E5E7',
              borderWidth: 1,
              borderRadius: 4,
              padding: 5,
            }}>
            {this.renderImage(
              imageLink,
              faviconLink,
              imageStyle,
              faviconStyle,
              imageProps,
            )}
          </View>
        </View>
      </View>
    );
  };

  render() {
    const {
      text,
      containerStyle,
      imageStyle,
      faviconStyle,
      textContainerStyle,
      title,
      titleStyle,
      titleNumberOfLines,
      descriptionStyle,
      descriptionNumberOfLines,
      imageProps,
      onDeleteClick,
    } = this.props;
    return this.state.isUri
      ? this.renderLinkPreview(
          containerStyle,
          this.state.linkImg,
          this.state.linkFavicon,
          imageStyle,
          faviconStyle,
          title,
          this.state.linkTitle,
          this.state.linkDesc,
          textContainerStyle,
          titleStyle,
          descriptionStyle,
          titleNumberOfLines,
          descriptionNumberOfLines,
          imageProps,
          onDeleteClick,
        )
      : null;
  }
}

const styles = {
  containerStyle: {
    flexDirection: 'row',
  },
  containerStyle1: {
    flexDirection: 'column',
    width: '100%',
    padding: 5,
    borderColor: '#E4E5E7',
    borderWidth: 1,
  },
};

RNUrlPreview.defaultProps = {
  onLoad: () => {},
  onError: () => {},
  text: null,
  containerStyle: {
    backgroundColor: 'rgba(239, 239, 244,0.62)',
    //alignItems: "center"
  },
  imageStyle: {
    width: Platform.isPad ? 160 : 110,
    height: Platform.isPad ? 160 : 110,
    // paddingRight: 10,
    //paddingLeft: 10
  },
  faviconStyle: {
    width: 40,
    height: 40,
    // paddingRight: 10,
    // paddingLeft: 10
  },
  textContainerStyle: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    // padding: 10
  },
  title: true,
  titleStyle: {
    fontSize: normalize(17),
    color: '#000',
    // marginRight: 10,
    marginBottom: 5,
    alignSelf: 'flex-start',
    fontFamily: 'Helvetica',
  },
  titleNumberOfLines: 2,
  descriptionStyle: {
    fontSize: normalize(14),
    color: '#81848A',
    // marginRight: 10,
    alignSelf: 'flex-start',
    fontFamily: 'Helvetica',
  },
  descriptionNumberOfLines: Platform.isPad ? 4 : 3,
  imageProps: {resizeMode: 'contain'},
};

RNUrlPreview.propTypes = {
  onLoad: PropTypes.func,
  onError: PropTypes.func,
  text: PropTypes.string,
  containerStyle: ViewPropTypes.style,
  imageStyle: ViewPropTypes.style,
  faviconStyle: ViewPropTypes.style,
  textContainerStyle: ViewPropTypes.style,
  title: PropTypes.bool,
  titleStyle: Text.propTypes.style,
  titleNumberOfLines: Text.propTypes.numberOfLines,
  descriptionStyle: Text.propTypes.style,
  descriptionNumberOfLines: Text.propTypes.numberOfLines,
};
