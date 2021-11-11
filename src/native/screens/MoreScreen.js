import React, {Component} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  Dimensions,
} from 'react-native';
import DraggablePanel from '../components/Library/react-native-draggable-panel';
import {Icon} from '../components/Icon/Icon.js';
import * as Constants from '../components/KoraText';
import Bottom from './Reorder_screen.js';
import {Text} from '../components/KoraText';
import {normalize} from '../utils/helpers';
import {getCurrentScreenName} from '../navigation/NavigationService';

export default class MoreScreen extends Component {
  state = {
    toggleMorePanel: false,
  };

  reorderView = () => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.setState({toggleMorePanel: false});
          setTimeout(() => {
            if (this.refs.valueRef) {
              this.refs.valueRef.openModal();
            }
          }, 1000);
        }}>
        <Text style={styles.reorderStyle}>Reorder</Text>
      </TouchableOpacity>
    );
  };

  handleOnClick(id) {
    this.props.navigation.navigate(id);
    this.setState({toggleMorePanel: false});
  }

  list = () => {
    let array = [
      // {icon: 'Automations', name: 'Automations'},
      // {icon: 'More_Apps', name: 'More Apps'},
      {icon: 'Help', name: 'Help'},
      {icon: 'Version', name: 'Version'},
    ];
    let unselected = [];
    this.props.unselectedRoutes.map((item) => {
      unselected.push({icon: item.icon, name: item.name});
    });

    array = unselected.concat(array);
    const currScreenName = getCurrentScreenName();

    return array.map((element) => {
      let highlightName = currScreenName === element.name;
      if (
        currScreenName === 'DiscussionRooms' &&
        element.name === 'Workspaces'
      ) {
        highlightName = true;
      }
      if (`${element.name}` === 'Version') {
        return (
          <TouchableOpacity
            key={element.name}
            style={styles.opacityStyle}
            activeOpacity={0.5}
            onPress={() => {}}>
            <View style={styles.list}>
              <Icon name={element.icon} size={22} color="#202124" />
              <Text style={styles.textStyle}> {element.name} </Text>
              <View style={styles.fill}></View>
              <Text style={[styles.valueStyle, styles.alignSelfFlexEnd]}>
                1.0.0(4.3)
              </Text>
            </View>
          </TouchableOpacity>
        );
      } else {
        return (
          <TouchableOpacity
            key={element.name}
            style={styles.opacityStyle}
            activeOpacity={0.5}
            onPress={() => {
              this.handleOnClick(element.name);
            }}>
            <View style={styles.list}>
              <Icon
                name={element.icon}
                size={22}
                color={highlightName ? '#0D6EFD' : '#202124'}
              />
              <Text
                style={[
                  styles.textStyle,
                  {color: highlightName ? '#0D6EFD' : '#202124'},
                ]}>
                {' '}
                {element.name}{' '}
              </Text>
            </View>
          </TouchableOpacity>
        );
      }
    });
  };
  renderModalContent = () => (
    <SafeAreaView>
      <View style={styles.modalContent}>
        <View style={styles.header}>
          <Text style={[styles.textStyle]}>More</Text>
          {this.reorderView()}
        </View>
        <View style={styles.listContainer1} />
        <View style={styles.listContainer}>{this.list()}</View>
      </View>
    </SafeAreaView>
  );

  openMoreIcon() {
    this.setState({toggleMorePanel: true});
  }

  onDoneClick = () => {
    this.setState({toggleMorePanel: false});
  };

  render() {
    console.log('=================MoreScreen.js================');
    return (
      <View style={styles.container}>
        <DraggablePanel
          borderRadius={15}
          initialHeight={360}
          visible={this.state.toggleMorePanel}
          onDismiss={() => this.setState({toggleMorePanel: false})}>
          {this.renderModalContent()}
        </DraggablePanel>
        <Bottom onDoneButtonClick={this.onDoneClick} ref="valueRef" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 5,
  },
  listContainer1: {borderWidth: 0.4, borderColor: '#ccc9c9'},
  list: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    marginVertical: 18,
    paddingHorizontal: 4,
    // flex: 1,
    // backgroundColor: 'blue',

    // justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 15,
    backgroundColor: 'transparent',
    padding: 5,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  opacityStyle: {},
  reorderStyle: {
    color: '#0D6EFD',
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  textStyle: {
    fontFamily: Constants.fontFamily,
    fontWeight: '500',
    fontStyle: 'normal',
    fontSize: normalize(16),
    color: '#202124',
  },
  valueStyle: {
    alignSelf: 'flex-end',
    fontWeight: '400',
    fontSize: normalize(17),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    textAlign: 'right',
    color: '#9AA0A6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  alignSelfFlexEnd: {
    alignSelf: 'flex-end',
  },
  fill: {
    flexDirection: 'row',
    flex: 1,
  },
});
