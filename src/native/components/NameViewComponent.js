import React from 'react';
import {StyleSheet, View, TouchableHighlight, Text} from 'react-native';
import {connect} from 'react-redux';
import {resolveUser} from '../../shared/redux/actions/home.action';
class NameViewComponent extends React.Component {
  render() {
    return (
      <View>
        <Text>{this.state.Name}</Text>
      </View>
    );
  }
  constructor() {
    super();
    this.state = {
      Name: '',
    };
  }
  componentDidMount() {
    if (this.props.memberObject && this.props.memberObject.id) {
      // this.props.memberObject.fN=null;
      if (this.props.memberObject.fN) {
        this.setState({Name: this.props.memberObject.fN});
        // console.log(
        //   '---- ----------not required to calling api-------------------:',
        //   JSON.stringify(this.props.memberObject),
        // );
      } else {
        let _params = {
          id: [this.props.memberObject.id],
        };
        // console.log(
        //   '---- ----------calling api-------------------:',
        //   JSON.stringify(this.props.memberObject),
        // );
        this.props.resolveUser(_params);
      }
    }
  }
  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.userContact !== this.props.userContact &&
      this.props.userContact.length > 0
    ) {
      // This will call after contact resolve
      this.setState({
        Name: this.props.userContact[0].fN + ' ' + this.props.userContact[0].lN,
      });
    }
  }
}

const mapStateToProps = (state) => {
  const {home} = state;

  return {
    userContact: home.contactDetail,
  };
};

export default connect(mapStateToProps, {
  resolveUser,
})(NameViewComponent);
