import React from 'react';
import {ViewBase} from 'react-native';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import {normalize} from '../../utils/helpers';

class Indicator extends React.Component {
  renderAllIndicator() {
    let position = this.props.position;
    let totalIndicator=this.props.totalIndicator;
    let view = [];
    for (let i = 1; i <= totalIndicator; i++) {
      view.push(
        <View
          style={[
            {minWidth: 16, minHeight: 3, borderRadius: 70, marginEnd: 4},
            {backgroundColor: position == i ? '#0D6EFD' : '#85B7FE'},
          ]}
        />,
      );
    }
    return view;
  }
  render() {
    return (
      <View style={{flexDirection: 'row', flex: 1}}>
        {this.renderAllIndicator()}
      </View>
    );
  }
}

export default Indicator;
