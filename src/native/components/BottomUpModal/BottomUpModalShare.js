import React, {createRef} from 'react';
import DraggablePanel from '../Library/react-native-draggable-panel';
import { View } from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';

export class BottomUpModalShare extends React.Component {
  actionSheetRef = createRef();
  constructor(props) {
    super(props);
    this.state = {
      openBottomDrawer: false,
    };
  }

  open(cb = () => {}) {
    this.openBottomDrawer(cb);
  }

  close(cb = () => {}) {
    this.closeBottomDrawer(cb);
  }

  openBottomDrawer(cb = () => {}) {
    // this.actionSheetRef.current?.setModalVisible();
     this.setState({openBottomDrawer: true}, () => cb());
  }
  closeBottomDrawer(cb = () => {}) {
    // this.actionSheetRef.current?.hide();
     this.setState({openBottomDrawer: false}, () => cb());
  }

  onDismiss = () => {
    // console.log("on dismiss called");  
    this.setState({openBottomDrawer: false});
    if(this.props.onDismissSheet !== undefined) {
      this.props.onDismissSheet();
    }
  }

  render() {
    // console.log('=================BottomupModel.js================');
    let extraProps = {};
    const {height} = this.props;
    if (height) {
      extraProps = {initialHeight: height};
    }
    return (
      //  <View style={{marginBottom: 20}}>
      //   <ActionSheet
      //     ref={this.actionSheetRef}
      //     defaultOverlayOpacity={0.3}
      // gestureEnabled={false} 
      // bottomOffset={1000}>
      //  {this.props.children}
      //  <View style={{paddingBottom: 10}} />
      //  </ActionSheet>
      //  </View>
      <SafeAreaInsetsContext.Consumer>
      {(insets) => (
      <DraggablePanel
        expandable={this.props.expandable}
        borderRadius={20}
        overlayOpacity={0.6}
        visible={this.state.openBottomDrawer}
        {...extraProps}
        onDismiss={() => this.onDismiss()}>
        {this.props.children}
        <View style={{height: 15, width: '100%'}} />
      </DraggablePanel>)}
      </SafeAreaInsetsContext.Consumer>
    );
  }
}

DraggablePanel.defaultProps = {
  expandable: false,
  height: null,
};

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalContent: {
//     backgroundColor: 'white',
//     padding: 5,
//     borderRadius: 4,
//     borderColor: 'rgba(0, 0, 0, 0.1)',
//   },
//   bottomModal: {
//     justifyContent: 'flex-end',
//     margin: 0,
//   },
//   textStyle: {
//     fontStyle: 'normal',
//     fontWeight: 'bold',
//     fontSize: normalize(16),
//     padding: 15,
//   },
//   viewStyle: {
//     padding: 5,
//   },
//   opacityStyle: {
//     height: 60,
//   },
//   ImageIconStyle: {
//     position: 'absolute',
//     left: 16.67,
//     right: 11.25,
//     top: 19.7,
//     bottom: 14.58,
//   },
//   TextStyle: {
//     left: 50,
//     right: 67.73,
//     top: 19,
//     bottom: 79.8,
//     fontFamily: 'Arial',
//     fontSize: normalize(16),
//     lineHeight: 21,
//     color: '#202124',
//   },
// });
