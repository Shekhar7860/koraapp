/* eslint-disable prettier/prettier */
import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import * as Constants from '../KoraText';
import {normalize} from '../../utils/helpers';
import {BottomUpModal} from '../BottomUpModal';

export default class DeleteMessage extends Component {
  onPaneelStatus = null;
  draggablePanelRef = React.createRef;
  onClickOption = null;
  state = {
    toggleStatePanelVisibility: false,
    array: [],
  };

  componentDidMount() {
    const {route} = this.props;
    this.setState({
      array: this.props.delteOptionsArray,
    });
  }

  componentDidUpdate(prevProps) {
    if(prevProps.delteOptionsArray !== this.props.delteOptionsArray) {
      this.setState({
        array: this.props.delteOptionsArray,
      });
    }
  }

  list = () => {
    return this.state.array
      ? this.state.array.map((element, index) => {
          const styleOnBackground =
            element.name === 'Cancel'
              ? styles.cancelTextStyle1
              : styles.paddingHorizontal16;
          const textStyle =
            element.name === 'Cancel'
              ? styles.cancelTextStyle
              : styles.deleteDiscussionTextStyle;

          return (
            <TouchableOpacity
              underlayColor="rgba(0,0,0,0.05)"
              key={element.id || element.name || index}
              onPress={() => {
                if (
                  this.onClickOption &&
                  typeof this.onClickOption === 'function'
                ) {
                  this.onClickOption(element);
                }
                if (this.draggablePanelRef) {
                  this.draggablePanelRef.closeBottomDrawer();
                }
              }}
              style={styles.paddingHorizontal15}>
              <View style={styleOnBackground}>
                <Text style={textStyle}>{element.name}</Text>
              </View>
            </TouchableOpacity>
          );
        })
      : null;
  };

  renderModalContent = () => (
    <View style={styles.modalContent}>
      <Text style={styles.headertextStyle}>{this.props.title}</Text>
      {/* <Text style={styles.textStyle1}>
        Are you sure? You really want to delete?
      </Text> */}
      {this.list()}
    </View>
  );

  openModal(onPaneelStatus, onClickOption) {
    this.setState({toggleStatePanelVisibility: true});
    this.draggablePanelRef.openBottomDrawer();
    this.onPaneelStatus = onPaneelStatus;
    this.onClickOption = onClickOption;
  }

  closeModal() {
    this.draggablePanelRef.closeBottomDrawer();
  }

  setVisibility(isShow) {
    if (isShow) {
      this.draggablePanelRef.openBottomDrawer();
    } else {
      this.draggablePanelRef.closeBottomDrawer();
    }
  }

  render() {
    return (
      <BottomUpModal
        ref={(ref) => {
          this.draggablePanelRef = ref;
        }}
        height={390}>
        {this.renderModalContent()}
      </BottomUpModal>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 15,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  textStyle: {
    padding: 15,
    color: '#202124',
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  headertextStyle: {
    padding: 16,
    color: '#202124',
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    marginBottom: 15,
    fontFamily: Constants.fontFamily,
  },
  textStyle1: {
    color: '#202124',
    fontWeight: '600',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  parentTextStyle1: {
    paddingLeft: 15,
    paddingTop: 12,
    paddingBottom: 8,
    color: '#202124',
    fontWeight: '600',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  textStyle2: {borderWidth: 1, borderColor: '#EFF0F1', marginBottom: 14},
  viewStyle: {
    padding: 5,
  },
  opacityStyle: {},
  ImageIconStyle: {
    position: 'absolute',
    left: 16.67,
    right: 11.25,
    top: 19.7,
    bottom: 14.58,
  },
  nameTextStyle: {
    fontWeight: '500',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
  },
  paddingHorizontal15: {paddingHorizontal: 15, paddingBottom: 14},
  paddingHorizontal16: {
    borderRadius: 4,
    backgroundColor: '#DD3646',
    alignItems: 'center',
  },
  deleteDiscussionTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    color: '#ffffff',
    marginVertical: 15,
    marginHorizontal: 30,
  },
  cancelTextStyle: {
    color: '#202124',
    fontWeight: '400',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    marginVertical: 10,
    marginHorizontal: 30,
  },
  cancelTextStyle1: {
    borderColor: 'grey',
    alignItems: 'center',
  },
});
