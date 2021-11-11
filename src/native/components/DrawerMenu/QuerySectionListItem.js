import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import withObservables from '@nozbe/with-observables';

import {Icon} from '../../components/Icon/Icon';
import {colors} from '../../theme/colors';
import * as Constants from '../../components/KoraText';
import {normalize} from '../../utils/helpers';

const QuerySectionListItem = ({
  queryItem,
  handlePress = () => {},
  menuSelectedState,
}) => {
  return (
    <TouchableOpacity
      key={queryItem.id}
      style={[
        styles.drawerMenuItem,
        styles.section1,
        {
          backgroundColor:
            menuSelectedState === queryItem.id ? '#EFF0F1' : 'white',
        },
      ]}
      onPress={() => handlePress(queryItem)}>
      <View style={styles.section11}>
        {queryItem?.value > 0 && (
          <Icon name={queryItem.badge} size={6} color={colors.color_DD3646} />
        )}
      </View>
      <Icon name={queryItem.icon} size={24} color={colors.color_202124} />
      <Text style={styles.text}> {queryItem.name} </Text>
      <Text style={styles.number}>
        {queryItem?.value > 0 ? queryItem.value : ''}
      </Text>
    </TouchableOpacity>
  );
};

const enhance = withObservables([], ({queryItem}) => ({
  queryItem: queryItem ? queryItem.observe() : null,
}));

export default enhance(QuerySectionListItem);

const styles = StyleSheet.create({
  drawerMenuItem: {
    paddingVertical: 10,
  },
  section1: {
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 5,
  },
  section11: {
    width: 25,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  number: {
    fontWeight: '400',
    fontSize: normalize(15.5),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    alignSelf: 'center',
    alignContent: 'flex-end',
    flex: 1.5,
  },
  text: {
    flex: 7,
    marginLeft: 8.5,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});
