import React, {Component} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  Text,
  SafeAreaView,
} from 'react-native';
import DraggablePanel from './../components/Library/react-native-draggable-panel';
import {
  DragContainer,
  Draggable,
  DropZone,
} from '../components/Library/react-native-drag-drop-and-swap';
import {connect} from 'react-redux';

import {
  setSelectedRoutes,
  setUnSelectedRoutes,
} from '../../shared/redux/actions/bottom-tab.action';
import {
  getCurrentScreenName,
  navigateAndReset,
} from '../navigation/NavigationService';
import {Icon} from '../components/Icon/Icon';
import * as Constants from '../components/KoraText';
import {normalize} from '../utils/helpers';
import {Dimensions, Platform} from 'react-native';

const d = Dimensions.get('window');
const isXnAbove =
  Platform.OS === 'ios' && (d.height > 800 || d.width > 800) ? true : false;

class DraggyInner extends React.Component {
  render() {
    if (this.props.dragOver && !this.props.ghost && !this.props.dragging) {
      LayoutAnimation.easeInEaseOut();
      if (
        this.props.alphabet.name === 'Home' ||
        this.props.alphabet.name === 'More' ||
        this.props.alphabet.name === 'Findly'
      ) {
      } else {
        return (
          <View style={styles.dragInner1}>
            <Icon name={this.props.alphabet.icon} size={22} />
            <Text style={styles.nameTextStyle}>{this.props.alphabet.name}</Text>
          </View>
        );
      }
    }
    // let shadows = {
    //   shadowColor: '0px 0px 24px',
    //   shadowOffset: {width: 0, height: 20},
    //   shadowOpacity: 0.5,
    //   shadowRadius: 20,
    //   opacity: 0.5,
    // };
    if (
      this.props.alphabet.name === 'Home' ||
      this.props.alphabet.name === 'More' ||
      this.props.alphabet.name === 'Findly'
    ) {
      return (
        <View
          style={[
            styles.dragInner2,
            {opacity: this.props.alphabet.showTitle ? 1.0 : 0.5},
            //this.props.dragging ? shadows : null,
          ]}>
          <Icon
            name={this.props.alphabet.icon}
            size={this.props.alphabet.showTitle ? 22 : 34}
            color={'#bab8b8'}
          />
          {this.props.alphabet.showTitle ? (
            <Text
              style={{
                ...styles.nameTextStyle,
                color: '#bab8b8',
              }}>
              {this.props.alphabet.name}
            </Text>
          ) : null}
        </View>
      );
    } else {
      return (
        <View
          style={[
            styles.dragInner3,
            {width: this.props.dragging ? 80 : null},
            //this.props.dragging ? shadows : null,
          ]}>
          <Icon
            name={this.props.alphabet.icon}
            size={this.props.alphabet.showTitle ? 22 : 34}
          />
          {this.props.alphabet.showTitle ? (
            <Text style={styles.nameTextStyle}>{this.props.alphabet.name}</Text>
          ) : null}
        </View>
      );
    }
  }
}

class Draggy extends React.Component {
  render() {
    return (
      <Draggable
        disabled={this.props.disabled}
        data={this.props.alphabet}
        dragOn={'onPressIn'}
        style={{marginHorizontal: 0}}>
        <DropZone
          onDrop={(e) => this.props.onDrop(e)}
          onEnter={() => this.props.onHover(this.props.alphabet)}>
          <DraggyInner alphabet={this.props.alphabet} />
        </DropZone>
      </Draggable>
    );
  }
}

class Bottom extends Component {
  constructor(props) {
    super(props);
    this.displayName = 'DragDropTest';
    this.onDrop = this.onDrop.bind(this);
    this.onHover = this.onHover.bind(this);
    this.state = {
      // unSelectedRoutes: props.,
      // selectedRoutes: selectedRoutes,
      toggleReorderPanel: false,
      hoverData: {},
      dropData: {},
      hoverDataIndex: null,
    };
  }
  onDrop(data) {
    const shouldDrop =
      this.state.hoverData.name != 'Home' &&
      this.state.hoverData.name != 'More' &&
      this.state.hoverData.name != 'Findly';

    const shouldDrag =
      data.name != 'Home' && data.name != 'More' && data.name != 'Findly';
    if (!shouldDrag || !shouldDrop) {
      return;
    }
    let unSelectedRoutes = this.props.unSelectedRoutes.map((item) => {
      if (item.name == data.name && shouldDrop) {
        return this.state.hoverData;
      }
      if (item.name == this.state.hoverData.name && shouldDrop) {
        return data;
      }
      return item;
    });
    let navigateTo = null;
    let selectedRoutes = this.props.selectedRoutes.map((item) => {
      if (item.name == data.name && shouldDrop && shouldDrag) {
        return this.state.hoverData;
      }
      if (item.name == this.state.hoverData.name && shouldDrop && shouldDrag) {
        const currentScreenName = getCurrentScreenName();

        if (currentScreenName === this.state.hoverData.name) {
          navigateTo = data.name;
        }
        if (currentScreenName === data.name) {
          navigateTo = this.state.hoverData.name;
        }

        return data;
      }

      return item;
    });

    this.props.setSelectedRoutes(selectedRoutes);
    this.props.setUnSelectedRoutes(unSelectedRoutes);
    this.setState({unSelectedRoutes: unSelectedRoutes});
    this.setState({selectedRoutes: selectedRoutes});
    if (navigateTo !== null) {
      setTimeout(() => navigateAndReset(data.name), 0);
    }
  }

  onHover(hoverData) {
    this.setState({hoverData});
  }
  openModal() {
    //this.props.onDoneButtonClick();
    this.setState({toggleReorderPanel: true});
  }
  closeModal() {
    this.setState({toggleReorderPanel: false});
  }

  render() {
    // console.log('selectedRoutes', this.props.selectedRoutes);
    //console.log('unSelectedRoutes', this.props.unSelectedRoutes);
    return (
      <View style={styles.container}>
        <DraggablePanel
          borderRadius={15}
          initialHeight={375}
          visible={this.state.toggleReorderPanel}
          //overlayOpacity={0}
          onDismiss={() => this.setState({toggleReorderPanel: false})}>
          <View style={styles.containerInner1}>
            <TouchableOpacity
              style={styles.containerInner2}
              onPress={() => {
                this.closeModal();
              }}>
              <Icon name="Close" size={22} />
            </TouchableOpacity>
            <Text style={styles.editNavigationTextStyle}>Edit Navigation</Text>
            <TouchableOpacity
              style={styles.containerInner3}
              onPress={() => {
                this.closeModal();
                this.props.onDoneButtonClick();
              }}>
              <Text style={styles.doneTextStyle}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.text}>
            <Text style={styles.dragTextStyle}>
              Drag the icon in the bottom navigation bar
            </Text>
          </View>
          <DragContainer>
            <View style={styles.dragContainer1}>
              <View style={styles.dragContainer2}>
                {this.props.unSelectedRoutes.map((item) => (
                  <View key={item.name} style={styles.dragContainer3}>
                    <Draggy
                      alphabet={item}
                      onHover={this.onHover}
                      onDrop={this.onDrop}
                    />
                  </View>
                ))}
              </View>
              <View style={styles.dragContainer4}>
                <Text style={styles.previewTextStyle}>Navigation Preview</Text>
              </View>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  flexDirection: 'row',
                  marginBottom: isXnAbove ? 8 : 0,
                }}>
                {this.props.selectedRoutes.map((item) => (
                  <Draggy
                    key={item.name}
                    disabled={true}
                    alphabet={item}
                    onHover={this.onHover}
                    onDrop={this.onDrop}
                  />
                ))}
              </View>
            </View>
          </DragContainer>
        </DraggablePanel>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  containerInner1: {paddingTop: 20},
  containerInner2: {left: 20, width: 25},
  containerInner3: {position: 'absolute', marginLeft: '85.4%'},
  text: {
    lineHeight: 19,
    alignItems: 'center',
    marginTop: 15,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  nameTextStyle: {
    // color: 'black',
    // paddingTop: 10,
    // fontWeight: '500',
    // fontSize: normalize(10),
    // fontStyle: 'normal',
    // fontFamily: Constants.fontFamily,

    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    paddingTop: 10,
  },
  dragInner1: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    borderRadius: 10,
    backgroundColor: '#EFF0F1',
  },
  dragInner2: {
    height: 70,
    //width: 80,
    marginHorizontal: 16,
    bottom: 8,
    borderRadius: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragInner3: {
    height: 70,
    marginHorizontal: 16,
    bottom: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragContainer1: {flex: 1},
  dragContainer2: {
    flex: 3,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  dragContainer3: {
    marginHorizontal: 0,
    marginTop: 5,
    marginBottom: 5,
  },
  dragContainer4: {flex: 1},
  editNavigationTextStyle: {
    fontWeight: '600',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: 19,
    bottom: 20,
    left: 50,
    color: '#202124',
  },
  doneTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    lineHeight: 20,
    color: '#0D6EFD',
    paddingTop: 20,
  },
  dragTextStyle: {
    //height: 38,
    width: 219,
    textAlign: 'center',
    color: '#9AA0A6',
    fontWeight: 'bold',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  previewTextStyle: {
    fontSize: normalize(12),
    fontWeight: '500',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    textAlign: 'center',
  },
});

const mapStateToProps = (state) => {
  let {bottomTab} = state;
  return {
    unSelectedRoutes: bottomTab.unSelectedRoutes,
    selectedRoutes: bottomTab.selectedRoutes,
  };
};

export default connect(
  mapStateToProps,
  {setUnSelectedRoutes, setSelectedRoutes},
  null,
  {
    forwardRef: true,
  },
)(Bottom);
