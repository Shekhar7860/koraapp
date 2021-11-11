import React from 'react';
import {Text, StyleSheet, TouchableOpacity, View} from 'react-native';

import {normalize} from '../../../utils/helpers';
import {RoomAvatar} from '../../../components/RoomAvatar';
import database from '../../../realm';
import * as Entity from '../../../realm/dbconstants';
import {colors} from '../../../theme/colors';

class WorkspaceDBItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workspaceItem: [],
    };
  }

  componentDidMount() {
    this.getWorkSpace(this.props.id);
  }

  getWorkSpace = async (workspace_id) => {
    try {
      // if (this.wsItemSubscription && this.wsItemSubscription.unsubscribe) {
      //   this.wsItemSubscription.unsubscribe();
      // }
      const db = database.active;

      const workspace = await db.collections
        .get(Entity.Workspaces)
        .find(workspace_id);

      this.setState({workspaceItem: workspace});
      if (workspace?.name) {
        this.props.hasWorkspace(true);
      }
    } catch (e) {
      this.props.hasWorkspace(false);
      console.log('error in subscribeWorkspace WD', e);
    }
  };

  // componentWillUnmount() {
  //   if (this.wsItemSubscription && this.wsItemSubscription.unsubscribe) {
  //     this.wsItemSubscription.unsubscribe();
  //   }
  // }

  render() {
    const {workspaceItem} = this.state;
    if (this.props?.fromMenu) {
      if (workspaceItem?.logo) {
        return (
          <TouchableOpacity
            onPress={() => this.props?.onPressWorkspace(workspaceItem?.id)}
            style={[
              styles.wsView,
              // !workspaceItem?.logo ? {height: 0} : {height: 50},
            ]}>
            <RoomAvatar
              size={26}
              showCircle={false}
              boardIcon={workspaceItem?.logo}
            />
            <Text style={{...styles.text, marginLeft: 10}}>
              {workspaceItem?.name}
            </Text>
          </TouchableOpacity>
        );
      }
      return <></>;
    } else if (workspaceItem?.name) {
      return (
        <View style={styles.mainContainerSub3}>
          <View style={styles.mainContainerSub4}>
            <RoomAvatar
              size={normalize(15)}
              showCircle={false}
              boardIcon={workspaceItem?.logo}
            />
          </View>
          <Text
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.workSpaceTextStyle}>
            {workspaceItem.name}
          </Text>
        </View>
      );
    }
    return <></>;
  }
}

export default WorkspaceDBItem;

const styles = StyleSheet.create({
  wsView: {
    alignItems: 'center',
    padding: 13,
    marginLeft: 14,
    borderRadius: 4,
    flexDirection: 'row',
  },
  text: {
    flex: 7,
    marginLeft: 8.5,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
  },
  mainContainerSub3: {
    paddingBottom: 6,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  mainContainerSub4: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 0,
  },
  workSpaceTextStyle: {
    fontSize: normalize(16),
    marginLeft: 5,
    paddingRight: 5,
    flexShrink: 1,
    color: '#202124',
    fontWeight: '600',
    fontStyle: 'normal',
  },
});
