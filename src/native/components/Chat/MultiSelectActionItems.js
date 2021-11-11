import React, {Component} from 'react';
import {FlatList, Text, StyleSheet} from 'react-native';
import {navigate} from '../../../../src/native/navigation/NavigationService';
import {View, TouchableOpacity} from 'react-native';
import {Icon} from '../Icon/Icon';
import {da, id} from 'date-fns/locale';
const data = [
  // {
  //   imageUrl: "http://via.placeholder.com/160x160",
  //   title: "something",
  //   dataType: 'text',
  // },
  // {
  //   imageUrl: "Contact_Search",
  //   title: "something two",
  //   dataType: 'image',
  // },
  // {
  //   imageUrl: "Share_Dot",
  //   title: "something three",
  //   dataType: 'image',
  // },
  // {
  //   imageUrl: "Copy",
  //   title: "something four",
  //   dataType: 'image',
  // },
  {
    imageUrl: 'forward',
    title: 'something five',
    dataType: 'image',
  },
  // },
  //  {
  //   imageUrl: "Delete_T",
  //   title: "something five",
  //   dataType: 'image',
  // },
];

export default class MultiSelectItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: data,
    };
  }

  onActionsPress(data) {
    // console.log('on press action', navigate);
    this.props.onPressAction(this.props.selectedMessages);
  }

  render() {
    console.log('multi selecte action item');
    const selectedMEssagesCount = this.props.selectedMessages.length;
    var selectionMessageText = '';
    if (selectedMEssagesCount > 1) {
      selectionMessageText = selectedMEssagesCount + ' Messages selected';
    } else {
      selectionMessageText = selectedMEssagesCount + ' Message selected';
    }
    return (
      <View style={styles.sectionMsgStyle}>
        <View
          style={{
            backgroundColor: 'white',
            borderWidth: 1,
            borderRadius: 0,
            borderColor: '#ddd',
            borderBottomWidth: 0,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 8,
            },
            shadowOpacity: 0.44,
            shadowRadius: 10.32,
            elevation: 16,
          }}></View>
        <View style={styles.selectionMsgStyle}>
          <View style={styles.selMsgSectionStyle}>
            <Text> {selectionMessageText}</Text>
          </View>

          <View style={styles.flatListStyle}>
            <FlatList
              data={this.state.data}
              horizontal={true}
              renderItem={({item: rowData}) => {
                return (
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignContent: 'center',
                      alignSelf: 'center',
                      padding: 10,
                      paddingRight: 15,
                      marginRight: 8,
                    }}
                    onPress={(data) => {
                      this.onActionsPress(data);
                    }}>
                    <Icon name={rowData.imageUrl} size={24} color="#202124" />
                  </TouchableOpacity>
                );
              }}
              keyExtractor={(item, index) => index}
            />
          </View>
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  sectionMsgStyle: {
    backgroundColor: 'white',
    width: '100%',
    height: 50,
  },
  selectionMsgStyle: {
    width: '100%',
    flexDirection: 'row',
    height: '100%',
  },
  selMsgSectionStyle: {
    width: '40%',
    height: '100%',
    justifyContent: 'center',
    marginLeft: 8,
  },
  flatListStyle: {
    width: '60%',
    height: '100%',
    alignItems: 'flex-end',
  },
});
