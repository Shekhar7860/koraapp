import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  FlatList,
} from 'react-native';
import {Icon} from '../../../components/Icon/Icon.js';
import {normalize} from '../../../utils/helpers';
// import {
//   getContactList,
//   selectedContactList,
//   getRecentContactList,
// } from '../../../../shared/redux/actions/create-message.action';
import {LogBox} from 'react-native';
import {Avatar} from '../../../components/Icon/Avatar';
import {BottomUpModalShare} from '../../../components/BottomUpModal/BottomUpModalShare';

const {height} = Dimensions.get('window');
const input = React.createRef();
class AddGuest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchGuest: '',
      guestData: [],
      mapValueGuest: {},
    };
  }

  componentDidMount() {
    LogBox.ignoreLogs(['VirtualizedLists should never be nested']);
    input.current?.focus();
    this.setState({guestData: this.props.data});

    // this.props.getContactList();
    // this.props.selectedContactList([]);
    // this.props.getRecentContactList();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data) {
      this.setState({
        guestData: this.props.data,
      });
    }
  }

  assignKeyValue(tagsSelectedArray) {
    var tempMap = {};
    for (let i = 0; i < tagsSelectedArray.length; i++) {
      tempMap[tagsSelectedArray[i]?.emailId] = tagsSelectedArray[i];
    }
    this.setState({mapValueGuest: tempMap});
  }
  openModal() {
    this.props.setSearchGuest('');
    this.setState({searchGuest: ''});
    this.assignKeyValue(this.props.tagsSelected);
    this.setState({
      guestData: this.props.data,
    });

    this.addGuest.openBottomDrawer();
  }

  renderNoData = () => {
    return (
      <View style={{alignItems: 'center'}}>
        <Text>No results found</Text>
      </View>
    );
  };

  renderGuests() {
    const {searchGuest} = this.state;
    return (
      <View style={{flex: 1}}>
        <View>
          <Text style={styles.headerText}>Add Guests</Text>
        </View>
        <View style={{marginHorizontal: 20}}>
          <TextInput
            ref={input}
            onChangeText={(searchGuest) => {
              this.props.contactListData(searchGuest);
              this.props.setSearchGuest(searchGuest);
              this.setState({searchGuest});
            }}
            placeholder="Type and enter a name to add"
            value={searchGuest}
            style={styles.textInputStyle}
          />
        </View>

        <FlatList
          data={this.state.guestData}
          keyExtractor={(item, index) => item.id || item._id}
          contentContainerStyle={{paddingBottom: 20}}
          style={{
            paddingHorizontal: 20,
            paddingVertical: 13,
            paddingBottom: 50,
            height: '74%',
          }}
          ListEmptyComponent={this.state.searchGuest && this.renderNoData}
          renderItem={({item}) => {
            let name;
            if (item?.fN) {
              name = item?.fN + ' ' + item?.lN;
            } else {
              name = item?.emailId;
            }
            //const {icon, fN, lN, emailId, color} = item;
            return (
              <TouchableOpacity
                underlayColor="rgba(0,0,0,0.2)"
                onPress={() => {
                  let value = this.state.mapValueGuest;
                  if (value[item.emailId] === undefined) {
                    //add itt
                    value[item.emailId] = item;
                    this.setState({mapValueGuest: value});
                  } else {
                    delete value[item.emailId];
                    this.setState({mapValueGuest: value});

                    //remove it
                  }
                }}
                style={{
                  flexDirection: 'row',
                  paddingVertical: 8,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    flex: 1,
                  }}>
                  <Avatar
                    name={name}
                    color={item?.color}
                    profileIcon={item.icon}
                    userId={item._id}
                  />
                  <View
                    style={{
                      flexDirection: 'column',
                      marginStart: 5,
                      //flex: 1,
                      padding: 5,
                    }}>
                    <Text numberOfLines={1} style={styles.nameTextStyle}>
                      {name}
                    </Text>
                    <Text numberOfLines={1} style={styles.emailTextStyle}>
                      {item.emailId}
                    </Text>
                  </View>
                </View>
                <View style={styles.checkboxStyle}>
                  {this.state.mapValueGuest[item.emailId] !== undefined ? (
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
              </TouchableOpacity>
            );
          }}
        />
        <TouchableOpacity
          style={styles.clickEventStyle}
          onPress={() => {
            this.props.setTagsSelected(
              this.getArrayValuesFromMap(this.state.mapValueGuest),
            );
            this.addGuest.closeBottomDrawer();
          }}>
          <Text style={styles.addButton}>Add Guests</Text>
        </TouchableOpacity>
      </View>
    );
  }
  getArrayValuesFromMap(mapArray) {
    let tempArray = [];
    Object.keys(mapArray).map(function (key, index) {
      tempArray.push(mapArray[key]);
    });
    return tempArray;
  }
  render() {
    //console.log('Selected', this.state.selectedGuests);
    return (
      <BottomUpModalShare
        ref={(ref) => {
          this.addGuest = ref;
        }}
        height={height - normalize(310)}>
        {this.renderGuests()}
      </BottomUpModalShare>
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
  addButton: {
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
    borderWidth: 1,
    borderColor: '#E4E5E7',
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
  currentsearchGuest: {
    fontSize: normalize(16),
    color: '#0D6EFD',
    marginLeft: 10,
  },
  emailTextStyle: {
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(13),
    fontStyle: 'normal',
    //top: 2,
  },
  nameTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
  },
  checkboxStyle: {
    height: 18,
    width: 18,
    top: 10,
    justifyContent: 'flex-end',
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
});

export default AddGuest;
