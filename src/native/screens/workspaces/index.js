import React from 'react';
import {StyleSheet, View} from 'react-native';
import {connect} from 'react-redux';
import {
  setActiveWsId,
} from '../../../shared/redux/actions/workspace.action';
import {normalize} from '../../utils/helpers';
import Placeholder from '../../components/Icon/Placeholder';
import * as Constants from '../../components/KoraText';

class Workspaces extends React.Component {
  constructor(props) {
    super();
  }

  componentDidMount() {
    // this.props.getWorkSpaceList();
    this._unsubscribe = this.props.navigation.addListener('focus', () => {
      // this.navigateToFirst();
    });
  }

  componentWillUnmount() {
    this._unsubscribe();
  }

  // navigateToFirst() {
  //   if (
  //     Array.isArray(this.props.workspacelist) &&
  //     this.props.workspacelist.length > 0
  //   ) {
  //     this.props.navigation.navigate(ROUTE_NAMES.DISCUSSION_ROOMS);
  //   }
  // }

  componentDidUpdate(prevProps) {
    // if (prevProps.workspacelist !== this.props.workspacelist) {
    //   this.navigateToFirst();
    // }
  }

  render() {
    // if (this.props.showLoader || this.props.workspacelist?.length !== 0) {
    //   return (
    //     <View style={styles.container}>
    //       <View style={{justifyContent: 'center', paddingTop: 10}}>
    //         <ActivityIndicator>Loading</ActivityIndicator>
    //       </View>
    //     </View>
    //   );
    // }

    // if (!this.props.showLoader && this.props.workspacelist?.length === 0) {
    return (
      <View
        style={styles.style1}>        
        <Placeholder name="workspaces" />        
      </View>
    );
    // }
    // return (
    //   <View style={styles.container}>
    //     {/* <Placeholder name="workspaces" /> */}
    //     <FlatList
    //       data={this.props.workspacelist}
    //       // contentContainerStyle={{flex: 1}}
    //       renderItem={({item}) => {
    //         return (
    //           <TouchableHighlight
    //             underlayColor="rgba(0,0,0,0.2)"
    //             onPress={() => {
    //               this.props.setActiveWsId(item.id);
    //               navigate(ROUTE_NAMES.DISCUSSION_ROOMS);
    //             }}
    //             style={{padding: 10, backgroundColor: 'white'}}>
    //             <Text style={styles.itemNameTextStyle}>{item.name}</Text>
    //           </TouchableHighlight>
    //         );
    //       }}
    //     />
    //   </View>
    // );
  }
}

const mapStateToProps = (state) => {
  const {workspace, home} = state;
  return {
    // workspacelist: workspace.workspacelist?.ws || emptyArray,
    showLoader: home.showLoader,
    activeWsId: workspace.activeWsId,
  };
};

export default connect(mapStateToProps, {setActiveWsId})(
  Workspaces,
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  itemNameTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  style1 :{
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:"white"
  },
});
