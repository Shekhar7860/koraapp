import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import {APP_NAME} from '../../../utils/AppConstants';
import Clipboard from '@react-native-community/clipboard';
import {Icon} from '../../../components/Icon/Icon.js';
import {getTimeline, normalize} from '../../../utils/helpers';
import * as UsersDao from '../../../../dao/UsersDao';
import {BottomUpModal} from '../../../components/BottomUpModal';
import Geolocation from '@react-native-community/geolocation';
import Geocoder from 'react-native-geocoding';
Geocoder.init('AIzaSyAVsazUkXkmi6mgZeZlMtcshymDve8_piQ', {language: 'en'});
const input = React.createRef();
class MeetLocation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      coordinates: {},
      location: '',
    };
  }

  // componenetDidUpdate(prevState) {
  //   if (prevState.coordinates !== this.state.coordinates) {
  //     console.log('Coordinates Updated');
  //   }
  // }

  openModal(coordinates) {
    if (coordinates) {
      this.setState({coordinates});
    }
    this.addLocation.openBottomDrawer();
  }

  requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      this.getOneTimeLocation();
      this.subscribeLocationLocation();
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Access Required',
            message: 'This App needs to Access your location',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          this.getOneTimeLocation();
          this.subscribeLocationLocation();
        } else {
          Alert.alert(
            'alert',
            'Please Go into Settings -> Applications ->' +
              APP_NAME +
              ' -> Permissions and Allow permissions to continue',
          );
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  getOneTimeLocation = () => {
    Geolocation.getCurrentPosition(
      (position) => {
        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);
        this.setState({coordinates: position.coords});
      },
      (error) => {
        console.log(error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 10000,
      },
    );
  };

  subscribeLocationLocation = () => {
    let watchID = Geolocation.watchPosition(
      (position) => {
        console.log(position);
        const currentLongitude = JSON.stringify(position.coords.longitude);
        const currentLatitude = JSON.stringify(position.coords.latitude);
        this.setState({coordinates: position.coords});
      },
      (error) => {
        console.log(error.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
      },
    );
    Geolocation.clearWatch(watchID);
  };

  geocoding() {
    const {coordinates} = this.state;
    console.log('Geocoding', coordinates.latitude);
    Geocoder.from(coordinates.latitude, coordinates.longitude)
      .then((json) => {
        var addressComponent = json.results[0].address_components[0];
        console.log('Address', addressComponent);
      })
      .catch((error) => console.warn('Geocoding', error));
  }

  setLocation() {
    const {location, coordinates} = this.state;
    return (
      <View style={{marginBottom: 10}}>
        <View style={styles.mainView}>
          <Text style={styles.headerText}>Location</Text>
        </View>
        <View style={{marginTop: 15, marginHorizontal: 20}}>
          <TextInput
            ref={input}
            onChangeText={(location) => this.setState({location})}
            placeholder="Enter location"
            value={location}
            style={styles.textInputStyle}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            this.requestLocationPermission();
            setTimeout(() => this.geocoding(), 1000);
          }}
          style={styles.optionView}>
          <Icon name="Record" size={normalize(22)} color="#0D6EFD" />
          <Text style={styles.currentLocation}>Add current location</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.clickEventStyle}
          onPress={() => {
            this.props.setLocation(location, coordinates);
            this.addLocation.closeBottomDrawer();
          }}>
          <Text style={styles.applyEvent}>Apply</Text>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    //console.log('Co ordinates', this.state.coordinates);
    return (
      <BottomUpModal
        ref={(ref) => {
          this.addLocation = ref;
        }}>
        {this.setLocation()}
      </BottomUpModal>
    );
  }
}

const styles = StyleSheet.create({
  headerText: {
    margin: 20,
    fontWeight: '600',
    fontSize: normalize(16),
    color: '#202124',
  },
  mainView: {
    borderBottomWidth: 1,
    borderColor: '#E4E5E7',
  },
  applyEvent: {
    fontWeight: '400',
    fontSize: normalize(16),
    color: '#ffffff',
  },
  clickEventStyle: {
    padding: 16,
    backgroundColor: '#0D6EFD',
    borderRadius: 4,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  textInputStyle: {
    marginVertical: 15,
    borderWidth: 1,
    borderColor: '#9AA0A6',
    fontSize: normalize(16),
    borderRadius: 4,
    padding: 10,
  },
  optionView: {
    marginVertical: 5,
    marginBottom: 20,
    padding: 10,
    marginHorizontal: 10,
    borderRadius: 5,
    flexDirection: 'row',
  },
  currentLocation: {fontSize: normalize(16), color: '#0D6EFD', marginLeft: 10},
});

export default MeetLocation;
