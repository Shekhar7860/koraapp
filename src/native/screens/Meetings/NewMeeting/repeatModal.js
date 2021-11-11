import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {getTimeline, normalize} from '../../../utils/helpers';
import * as UsersDao from '../../../../dao/UsersDao';
import {BottomUpModal} from '../../../components/BottomUpModal';

const options = [
  {text: 'No repeat'},
  {text: 'Daily'},
  {text: 'Week days'},
  {text: 'Weekly'},
  {text: 'Monthly'},
  {text: 'Yearly'},
  {text: 'Custom'},
];

class RepeatModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSelected: '',
    };
  }
  openModal(isSelected) {
    this.setState({isSelected});
    this.repeat.openBottomDrawer();
  }

  setRepeatMode() {
    const {isSelected} = this.state;
    return (
      <>
        <Text style={styles.header}>Repeat</Text>
        <View>
          {options.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                padding: 17.92,
                paddingLeft: 30,
                marginVertical: 5,
                marginHorizontal: 10,
                borderRadius: 4,
                backgroundColor: isSelected === item.text ? '#EFF0F1' : null,
              }}
              onPress={() => {
                this.setState({isSelected: item.text});
                this.props.setRepeat(item.text);
                this.repeat.closeBottomDrawer();
              }}>
              <Text style={styles.textStyle}>{item.text}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </>
    );
  }

  render() {
    return (
      <BottomUpModal
        ref={(ref) => {
          this.repeat = ref;
        }}
        height={560}>
        {this.setRepeatMode()}
      </BottomUpModal>
    );
  }
}

const styles = StyleSheet.create({
  textStyle: {fontWeight: '500', fontSize: normalize(16), color: '#202124'},
  header: {
    margin: 18.93,
    marginLeft: 30,
    fontWeight: '600',
    fontSize: normalize(16),
    color: '#202124',
  },
  clickEventStyle: {
    padding: 16,
    backgroundColor: '#0D6EFD',
    borderRadius: 4,
    marginHorizontal: 20,
    alignItems: 'center',
  },
});

export default RepeatModal;
