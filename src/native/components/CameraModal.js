import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  Image,
} from 'react-native';
import ImagePicker from 'react-native-image-picker';
import {navigate} from '../navigation/NavigationService';
import {ROUTE_NAMES} from '../navigation/RouteNames';

import {isAndroid} from '../utils/PlatformCheck';
import {normalize} from '../utils/helpers';

export default class Camera extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      resourcePath: ' ',
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          {/* <Image
            source={{
              uri: 'data:image/jpeg;base64,' + this.state.resourcePath.data,
            }}
            style={{ width: 100, height: 100 }}
          /> */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: isAndroid ? 0 : 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  button: {
    width: 250,
    height: 60,
    backgroundColor: '#3740ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 12,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: normalize(15),
    color: '#fff',
  },
});
