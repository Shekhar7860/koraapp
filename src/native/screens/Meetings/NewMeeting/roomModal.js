import React from 'react';
import {withTranslation} from 'react-i18next';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import {Icon} from '../../../components/Icon/Icon.js';
import {getTimeline, normalize} from '../../../utils/helpers';
import * as UsersDao from '../../../../dao/UsersDao';
import {BottomUpModal} from '../../../components/BottomUpModal';
import {Loader} from '../../../screens/ChatsThreadScreen/ChatLoadingComponent';

const input = React.createRef();
const scrollView = React.createRef();
class MeetRoom extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: '',
      showMore: false,
      showLoader: true,
    };
  }
  componentDidUpdate(prevProps) {
    if (prevProps.roomsList !== this.props.roomsList) {
      this.setState({showLoader: false});
    }
  }
  openModal() {
    this.addRoom.openBottomDrawer();
    this.setState({showLoader: true});
  }

  setRoom(roomsList) {
    const {selected, showMore} = this.state;
    return (
      <>
        <View style={styles.mainView}>
          <Text style={styles.headerText}>Room</Text>
        </View>
        <View style={{marginTop: 15, marginHorizontal: 17}}>
          <TextInput
            ref={input}
            onChangeText={(searchRoom) => {
              this.props.getRoomList(searchRoom.toUpperCase());
              this.setState({showLoader: true});
            }}
            placeholder="Search a room"
            style={styles.textInputStyle}
          />
        </View>
        {this.state.showLoader ? (
          <View style={styles.loader}>
            <Loader />
          </View>
        ) : (
          <ScrollView bounces={false} ref={scrollView} style={{marginLeft: 5}}>
            {roomsList?.map((item, index) => {
              return (
                <>
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      this.props.setRoom({...item});
                      this.setState({selected: item.name});
                      this.addRoom.closeBottomDrawer();
                    }}
                    style={[
                      styles.optionView,
                      {
                        backgroundColor:
                          selected === item.name ? '#EFF0F1' : null,
                      },
                    ]}>
                    <Text style={{fontSize: normalize(16), color: '#202124'}}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </>
              );
            })}
            {this.props.roomsList?.length > 4 ? (
              <TouchableOpacity
                onPress={() => {
                  this.setState({showMore: !showMore});
                }}
                style={{
                  marginLeft: 25,
                  marginTop: 15,
                  marginBottom: showMore ? 40 : 15,
                }}>
                <Text style={{color: '#0D6EFD', fontSize: normalize(16)}}>
                  {!showMore ? 'Show more' : 'Show less'}
                </Text>
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        )}
      </>
    );
  }

  render() {
    let roomData = this.props.roomsList;
    if (!this.state.showMore) {
      roomData = this.props.roomsList?.slice(0, 4);
      scrollView.current?.scrollTo({x: 0, y: 0, animated: true});
    } else {
      roomData = this.props.roomsList;
    }
    return (
      <BottomUpModal
        ref={(ref) => {
          this.addRoom = ref;
        }}
        height={470}>
        {this.setRoom(roomData)}
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
    padding: 15,
    marginHorizontal: 10,
    borderRadius: 5,
  },
  loader: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MeetRoom;
