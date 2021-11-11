import React, {Component} from 'react';
import {View, Text, TouchableHighlight, StyleSheet} from 'react-native';
import {FlatList} from 'react-native';
import {connect} from 'react-redux';
import CheckBox from '@react-native-community/checkbox';

import {toggleExceptionListItem} from '../../../shared/redux/actions/native.action';
import {Avatar} from '../../components/Icon/Avatar';
import {Header} from '../../navigation/TabStacks';
import * as Constants from '../../components/KoraText';
import {normalize} from '../../utils/helpers';
export const UserItemWithSelection = ({
  fN = '',
  lN = '',
  emailId = '',
  marked = false,
  profileIcon = null,
  userId = null,
  onMarkToggle = () => {},
}) => {
  const fullName = fN + ' ' + lN;
  const email = emailId;
  return (
    <TouchableHighlight
      underlayColor="rgba(0,0,0,0.2)"
      style={{
        margin: 5,
        padding: 5,
        borderRadius: 5,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
      }}>
      <View style={{flexDirection: 'row', alignItems: 'center'}}>
        <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
          <Avatar profileIcon={profileIcon} userId={userId} name={fullName} />
          <View style={{marginLeft: 14}}>
            <Text style={styles.fullNameTextStyle}>{fullName}</Text>
            <Text style={styles.emailTextStyle}>{email}</Text>
          </View>
        </View>
        <CheckBox
          boxType={'square'}
          value={marked}
          onValueChange={(value) => onMarkToggle(value)}
          // onChange={(val) => onMarkToggle(val)}
          // onValueChange={onMarkToggle}
          onFillColor="#0D6EFD"
          onCheckColor="#FFFFFF"
          style={{height: 18, width: 18, paddingRight: 20}}
        />
      </View>
    </TouchableHighlight>
  );
};

class AddExceptionScreen extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     allowedForPost: {
  //       isAllMembers: true,
  //       members: [],
  //     },
  //     board: {},
  //     // allowViaEmail: true,
  //     // emailid: '',
  //   };
  // }
  renderHeader() {
    return <Header title={'Add Exceptions'} {...this.props} goBack={true} />;
  }

  render() {
    // console.log('toggle list', toggleExceptionListItem(this.props.route.params.board))
    return (
      <View>
        {this.renderHeader()}
        <FlatList
          data={this.props.list}
          renderItem={({item}) => {
            const {fN, lN, marked, id, emailId = ''} = item;
            return (
              <UserItemWithSelection
                fN={fN}
                lN={lN}
                profileIcon={item?.icon}
                userId={item?.id}
                marked={marked}
                emailId={emailId}
                onMarkToggle={(val) => this.props.toggleExceptionListItem(id)}
              />
            );
          }}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {native} = state;
  return {
    list: native.exceptionList,
  };
};

export default connect(mapStateToProps, {toggleExceptionListItem})(
  AddExceptionScreen,
);

const styles = StyleSheet.create({
  fullNameTextStyle: {
    fontSize: normalize(16),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  emailTextStyle: {
    color: '#9AA0A6',
    fontSize: normalize(14),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});

// membersToPost = (e, index, contact, members) => {
//   let allMembs = [...members];
//   allMembs[index].checked = e.checked;
//   //this.props.updatePostsList(allMembs);
//   let finalArr = []
//   for (let mem of allMembs) {
//       if (mem.checked) {
//           finalArr.push(mem.id)
//       }
//   }
//   let _params, payload = {};

//   _params = {
//       wsId: this.props.selectedDiscussion.wsId,
//       rId: this.props.selectedDiscussion.boardId
//   }
//   payload.allowedForPost = {};
//   payload.allowedForPost.isAllMembers = false;
//   payload.allowedForPost.members = [...finalArr, this.props.currentUser.userInfo.id];
//   this.props.boards[this.props.discIndex].members = [...allMembs];
//   this.props.boards[this.props.discIndex].allowedForPost = payload.allowedForPost;
//   let updataDiscData = { action_type: 'post-control', boards: this.props.boards }
//   this.props.updateDiscussion(_params, payload, updataDiscData);
//   //this.setState({ allMembers: allMembs })
// }
// allowAllMembers(val) {
//   this.setState({ allowMemberToPost: val });
//   let _params, payload = {};

//   _params = {
//       wsId: this.props.selectedDiscussion.wsId,
//       rId: this.props.selectedDiscussion.boardId
//   }
//   payload.allowedForPost = {};
//   payload.allowedForPost.isAllMembers = val;
//   payload.allowedForPost.members = !val ? [this.props.currentUser.userInfo.id] : [];
//   this.props.boards[this.props.discIndex].allowedForPost = payload.allowedForPost;
//   // let members = this.props.boards[this.props.discIndex].members;
//   // members?.map(mem=>mem.checked = false);
//   // this.props.boards[this.props.discIndex].members = members
//   let updataDiscData = { action_type: 'post-control', boards: this.props.boards }
//   this.props.updateDiscussion(_params, payload, updataDiscData);
//   if (val) {
//       this.setState({ addExceptions: false })
//   }

// }
// postControl(selectedDiscussion) {
//   //console.log(this.props.boards[this.props.discIndex])
//   let members = selectedDiscussion?.members?.length ? [...selectedDiscussion?.members] : [];
//   members?.map(mem => mem.checked ? mem.checked : false);
//   if (selectedDiscussion?.allowedForPost?.isAllMembers) {
//       //members.map(mem=>mem.checked = false);
//       //this.setState({allowMemberToPost:true})

//   } else if (selectedDiscussion?.allowedForPost?.members?.length) {

//       let allowedForPostMembers = this.props.selectedDiscussion?.allowedForPost?.members;
//       for (let i = 0; i < members.length; i++) {
//           if (members[i].id === allowedForPostMembers[allowedForPostMembers?.indexOf(members[i].id)]) {
//               members[i].checked = true;
//           }
//       }
//   }
//   // else {
//   //     members.map(mem=>mem.checked = false);
//   // }
//   return (members?.map((mem, index) => {
//       return (
//           userAuth.getUserId() !== mem.id ?
//           (<div key={mem?.id} className="memberListItem">
//               <Checkbox onChange={(e) => this.membersToPost(e, index, mem, members)} checked={mem?.checked}></Checkbox>
//               <span className="memberAvatar"></span>
//               <div className="memberDetails">
//                   <div className="name">{mem?.fN ? mem?.fN : mem?.firstName} {mem?.lN ? mem?.lN : mem?.lastName} </div>
//                   <div className="email">{mem?.emailId}</div>
//               </div>
//           </div>) : null
//       )
//   }))
// }
