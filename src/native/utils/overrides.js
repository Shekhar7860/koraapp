import React from 'react';
import {StyleSheet, Platform, Text, TextInput} from 'react-native';

// One plus text issue fix
export const overrideTextRender = () => {
  const oldRender = Text.render;
  Text.render = function (...args) {
    const origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [styles.defaultFontFamily, origin.props.style],
    });
  };
};

export const overrideTextInputRender = () => {
  const oldRender = TextInput.render;
  TextInput.render = function (...args) {
    const origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [
        styles.defaultFontFamily,
        styles.androidStyles,
        origin.props.style,
      ],
    });
  };
};

const styles = StyleSheet.create({
  defaultFontFamily: {fontFamily: 'Inter'},
  androidStyles: {textAlignVertical: 'center'},
});
