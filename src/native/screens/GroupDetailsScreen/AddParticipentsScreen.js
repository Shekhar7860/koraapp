import React, {Component} from 'react';
import {Text, StyleSheet, TouchableHighlight} from 'react-native';
import {connect} from 'react-redux';
import {Header} from '../../navigation/TabStacks';
import ContactsTag from './../NewChatScreen/ContactsTag';
import * as Constants from '../../components/KoraText';
import {normalize} from '../../utils/helpers';
import {
  getRecentContactList,
  getContactList,
} from '../../../shared/redux/actions/create-message.action';
import {addParticipants,sendParticipantBack} from '../../../shared/redux/actions/message-preview.action';
import { emptyArray } from '../../../shared/redux/constants/common.constants';
import { goBack } from '../../navigation/NavigationService';
import { stubTrue } from 'lodash';

class _AddParticipentsScreen extends Component {
  constructor(props) {
    super(props);
    this.participents = props.route.params.participants || emptyArray;

    this.state = {
      recentContactArray: [],
      contactListArray: [],
      tagsSelected: [],
      participents: props.route.params.participants || emptyArray,
    };
  }

  componentDidMount() {
    this.props.getContactList();
    this.props.getRecentContactList();
   

    let recentContactArray = this.props.recentData;
    recentContactArray = recentContactArray.filter((contact) => {
      const id = contact._id;
      const p = this.state.participents.map((a) => a);
      const index = p.indexOf((part) => part._id === id);
      return index === -1;
    });
    console.log('TEST', recentContactArray.length);
    this.setState({recentContactArray});
    
  }

  componentDidUpdate(prevProps) {
    // console.log(
    //   'FLAGS',
    //   this.props.recentData !== prevProps.recentData,
    //   this.props.contactList !== prevProps.contactList,
    // );
    if (this.props.recentData !== prevProps.recentData) {
      console.log('FLAGS 1');
      let recentContactArray = this.props.recentData;
      recentContactArray = recentContactArray.filter((contact) => {
        const id = contact._id;
        const index = this.state.participents.indexOf((part) => {
          console.log('FLAGS 2', part);
          return false;
        });
        return index === -1;
      });

      this.setState({recentContactArray});
    }
  }

  onDoneClick() {
    const contacts = this.props.contactData;
    let selectedContactUserIdArr = contacts.map((contact) => {
      return {userId: contact.id || contact._id};
    });
    let payload = {
      addMembers: selectedContactUserIdArr,
    };
    const fromTable=this.props.route.params.fromTable;
    if(fromTable)
    {
     
     
      let data=
      {
        value:this.props.route.params.value,
        index:this.props.route.params.index,
        members:contacts, 
      }
      this.props.sendParticipantBack(data)
      goBack();

    }else{
      let _params = this.props.route.params.thread?._id;
        // console.log('ADD PARTICIPENTS');
      this.props.addParticipants(_params, payload, {contacts, goBack: true});
    }
  

  }

  doneButton() {
    const showDoneButton = this.props.contactData?.length > 0;
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.05)"
        onPress={() => this.onDoneClick()}
        style={{
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 5,
          borderRadius: 5,
        }}>
        <Text
          style={{
            ...styles.doneTextStyle,
            color: showDoneButton ? '#0D6EFD' : 'grey',
          }}>
          Done
        </Text>
      </TouchableHighlight>
    );
  }

  render() {
    return (
      <>
        <Header
          {...this.props}
          title={'Add People'}
          goBack={true}
          rightContent={this.doneButton()}
        />
        <ContactsTag
          visible={true}
          extraFilter={this.state.participents}
        
          showTo={false}
          fromTable={this.props.route.params.fromTable}
          editGroupName={false}
        />
      </>
    );
  }
}

const styles = StyleSheet.create({
  doneTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});

const mapStateToProps = (state) => {
  let {createMessage} = state;
  return {
    contactList: createMessage.contactlistData,
    recentData: createMessage.recentData,
    contactData: createMessage.contactData,
  };
};

const AddParticipentsScreen = connect(mapStateToProps, {
  getContactList,
  getRecentContactList,
  addParticipants,
  sendParticipantBack,
})(_AddParticipentsScreen);
export {AddParticipentsScreen};
