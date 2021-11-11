import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {View, Image} from 'react-native';
import {TextAvatar, ImageAvatar, CustomAvatar} from './components/';
import {isIOS} from './../../../../utils/PlatformCheck';
import API_URL from '../../../../../../env.constants';
import * as UsersDao from '../../../../../dao/UsersDao';
import FastImage from 'react-native-fast-image';

import {
  fetchImage,
  getContainerStyle,
  generateBackgroundStyle,
  getColor,
} from './helpers';

const colors = [
  {
    bgColor: '#2ecc71',
    textColor: '#fff',
  },
  {
    bgColor: '#3498db',
    textColor: '#fff',
  },

  {
    bgColor: '#8e44ad',
    textColor: '#fff',
  },
  {
    bgColor: '#e67e22',
    textColor: '#fff',
  },
];

const UserAvatar = (props) => {
  let {
    name,
    src,
    bgColor,
    bgColors,
    color,
    size,
    imageStyle,
    style,
    borderRadius,
    component,
    height,
    width,
    textStyle,
    backgroundColor,
    displayFullText,
    twoLettersText = null,
    profileIcon = null,
    updateProfile = null,
    userId = null,
  } = props;
  // Validations
  if (typeof size === 'string') {
    console.log('size prop should be a number');
    size = parseInt(size);
  }
  let textColor = color || getColor(name, colors).textColor;
  const val = displayFullText;
  height = height || size;
  width = width || size;
  const [inner, setInner] = useState(
    <TextAvatar
      // textColor={'white'}
      size={size}
      height={height}
      width={width}
      name={name}
      textColor={backgroundColor ? textColor : 'white'}
      displayFullText={val}
      textStyle={textStyle}
      twoLettersText={twoLettersText}
    />,
  );

  useEffect(() => {
    if (profileIcon && userId && profileIcon === 'profile.png') {
      let url =
        API_URL?.appServer +
        'api/1.1/getMediaStream/profilePictures/' +
        userId +
        // UsersDao.getUserId() +
        '/d_64x64_profile.png';
      // '/profile.jpg';
      const hash = UsersDao.getUserId() === userId ? new Date().getTime() : '';
      Image.getSize(
        url,
        (w, h) => {
          setInner(
            <FastImage
              // key={new Date.now()}
              source={{
                uri: `${url}?${hash}`,
                //priority: FastImage.priority.normal,
              }}
              style={{height, width}}
              resizeMode ="contain"
            />,
          );
        },
        (error) => {
          // console.log('Profile Image URL  error ------------> :', error);
          setInner(
            <TextAvatar
              // textColor={'white'}
              size={size}
              height={height}
              width={width}
              name={name}
              textColor={backgroundColor ? textColor : 'white'}
              displayFullText={val}
              textStyle={textStyle}
            />,
          );
        },
      );
    } else {
      setInner(
        <TextAvatar
          // textColor={'white'}
          size={size}
          height={height}
          width={width}
          name={name}
          textColor={backgroundColor ? textColor : 'white'}
          displayFullText={val}
          textStyle={textStyle}
        />,
      );
    }

    return function cleanup() {
      setInner(null);
    };
  }, [name, updateProfile, profileIcon]);

  const extraStyles = {
    height,
    width,
  };
  let _color = null;
  if (color) {
    _color = {
      bgColor: color,
    };
  }

  return (
    <View
      style={[
        generateBackgroundStyle(name, _color, colors),
        getContainerStyle(size, src, borderRadius),
        backgroundColor ? {backgroundColor: backgroundColor} : {},
        extraStyles,
        style,
        isIOS ? {borderWidth: 1.5, borderColor: 'white'} : {},
      ]}>
      {inner}
    </View>
  );
};

UserAvatar.propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  bgColor: PropTypes.string,
  bgColors: PropTypes.array,
  size: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.number,
  imageStyle: PropTypes.object,
  // style: PropTypes.object || PropTypes.array,
  borderRadius: PropTypes.number,
  component: PropTypes.any,
  textStyle: PropTypes.object,
};

UserAvatar.defaultProps = {
  size: 32,
  name: 'User',
  height: undefined,
  width: undefined,
  textStyle: {},
  bgColors: [
    // from https://flatuicolors.com/
    '#2ecc71', // emerald
    '#3498db', // peter river
    '#8e44ad', // wisteria
    '#e67e22', // carrot
    '#e74c3c', // alizarin
    '#1abc9c', // turquoise
    '#2c3e50', // midnight blue
  ],
  colors: [
    {
      bgColor: '#2ecc71',
      textColor: 'white',
    },
    {
      bgColor: '#3498db',
      textColor: 'white',
    },

    {
      bgColor: '#8e44ad',
      textColor: 'white',
    },
    {
      bgColor: '#e67e22',
      textColor: 'white',
    },
  ],
};

export default UserAvatar;
