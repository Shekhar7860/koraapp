import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import {View, Image, Text} from 'react-native';

const RenderImage = (props) => {
  let {member, url, styles} = props;
  // Validations

  const [inner, setInner] = useState(
    <View
      style={[
        styles.image_container,
        {backgroundColor: member?.color ? member?.color : 'white'},
      ]}>
     
    </View>,
  );

  useEffect(() => {
    Image.getSize(
      url,
      (w, h) => {
        setInner(
          <View
            style={[
              styles.image_container,
              {backgroundColor: member?.color ? member?.color : 'white'},
            ]}>
            <Image
              source={{
                uri: `${url}?${new Date().getTime()}`,
                cache: 'force-cache',
              }}
              style={styles.image}
            />
          </View>,
        );
      },
      (error) => {
        // console.log('Profile Image URL  error ------------> :', error);
        setInner(
          <View
            style={[
              styles.image_container,
              {backgroundColor: member?.color ? member?.color : 'white'},
            ]}>
            <View
              style={[
                styles.image,
                {
                  backgroundColor: member?.color ? member?.color : 'white',
                  justifyContent: 'center',
                },
              ]}>
              {member?.fN && (
                <Text style={[styles.fullNameTextStyleAvtar]}>
                  {member?.fN?.charAt(0)}
                </Text>
              )}
            </View>
          </View>,
        );
      },
    );
  }, []);

  return <View style={{ width: '100%'}}>{inner}</View>;
};

export default RenderImage;
