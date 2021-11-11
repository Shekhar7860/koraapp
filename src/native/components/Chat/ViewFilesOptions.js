import React, {Component} from 'react';
import {FlatList, Text} from 'react-native';
import {navigate} from '../../../../src/native/navigation/NavigationService';
import {View, TouchableOpacity} from 'react-native';
import {Icon} from '../Icon/Icon';
import {da} from 'date-fns/locale';
import {normalize} from '../../utils/helpers';

const data = [
  {
    id: 'download',
    imageUrl: 'Download',
    dataType: 'image',
  },
  // {
  //   id: 'copyReference',
  //   imageUrl: 'Copy',
  //   dataType: 'image',
  // },
  {
    id: 'forward',
    imageUrl: 'forward',
    dataType: 'image',
  },
];

export default class ViewFilesOptions extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: data,
    };
  }

  onActionsPress(data) {
    // console.log('on press action', data.id);
    this.props.onPressAction(this.props.selectedFile, data.id);
  }

  render() {
    // console.log('multi selecte action item');
    const selectedCount = this.props.selectedFile.length;
    return (
      <View style={{backgroundColor: 'white'}}>
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
        <View
          style={{
            flexDirection: 'row',
            //alignItems: 'flex-start',
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontSize: normalize(17),
              marginStart: 15,
              justifyContent: 'center',
            }}>
            {' '}
            {selectedCount + ' Selected'}
          </Text>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              justifyContent: 'flex-end',
            }}>
            {data.map((options) => {
              return (
                <TouchableOpacity
                  key={options.id}
                  style={{
                    padding: 15,
                  }}
                  onPress={() => {
                    this.onActionsPress(options);
                  }}>
                  <Icon
                    name={options.imageUrl}
                    size={normalize(24)}
                    color="#202124"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  }
}
