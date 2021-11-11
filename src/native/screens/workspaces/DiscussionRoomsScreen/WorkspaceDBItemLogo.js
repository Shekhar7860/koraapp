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
    this.subscribeBoard(this.props.id);
  }

  subscribeBoard = async (workspace_id) => {
    try {
      if (this.wsItemSubscription && this.wsItemSubscription.unsubscribe) {
        this.wsItemSubscription.unsubscribe();
      }
      const db = database.active;

      const workspace = await db.collections
        .get(Entity.Workspaces)
        .find(workspace_id);
      const observable = workspace.observe();
      this.wsItemSubscription = observable.subscribe((data) => {
        this.setState({workspaceItem: data});
      });
    } catch (e) {
      console.log('error in subscribeWorkspace', e);
    }
  };

  componentWillUnmount() {
    if (this.wsItemSubscription && this.wsItemSubscription.unsubscribe) {
      this.wsItemSubscription.unsubscribe();
    }
  }

  render() {
    const {workspaceItem} = this.state;
  
      return (
        <TouchableOpacity
         
          style={styles.wsView}>
          <RoomAvatar
            size={30}
            showCircle={false}
            boardIcon={workspaceItem?.logo}
          />
         
        </TouchableOpacity>
      );
 
    return <></>;
  }
}

export default WorkspaceDBItem;

const styles = StyleSheet.create({
  wsView: {
    alignItems: 'center',
   
    borderRadius: 4,
    flexDirection: 'row',
  },
 

 
});
