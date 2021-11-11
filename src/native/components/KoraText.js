import React from 'react';
import {useTranslation} from 'react-i18next';
import {Text as NativeText} from 'react-native';
import {normalize} from '../utils/helpers';
export const fontFamily = 'Inter';

export const Text = ({translate = false, children, ...props}) => {
  const {t, i18n} = useTranslation();
  if (translate) {
    children = t(children);
  }
  return (
    <NativeText
      {...props}
      style={
        {fontFamily: fontFamily, fontSize: normalize(16), fontStyle: 'normal',
        ...props.style}

      }
     >
      {children}
    </NativeText>
  );
};
