import React from 'react';
import {connect} from 'react-redux';
import {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  TextInput,
  Keyboard,
} from 'react-native';
import {normalize} from '../../utils/helpers';
import {Header} from '../../navigation/TabStacks';
import { Loader } from "../ChatsThreadScreen/ChatLoadingComponent";
const input = React.createRef();
class CreateWorkspace extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      workspaceName: '',
    };
  }
  componentDidMount() {
    this.setState({workspaceName: ''});
    input.current?.focus();
  }

  renderRightContent() {
    let {workspaceName} = this.state;
    if (workspaceName) {
      return (
        <TouchableHighlight
          underlayColor="rgba(0,0,0,0.05)"
          onPress={() => {


            this.props.route?.params?.onCreate(workspaceName);
            Keyboard.dismiss()

          }}
          style={styles.createView}>
          <Text style={styles.createText}>Create</Text>
        </TouchableHighlight>
      );
    } else {
      return (
        <View style={styles.createView}>
          <Text style={styles.greyText}>Create</Text>
        </View>
      );
    }
  }

  create() {
    let {workspaceName} = this.state;
    const {emoji} = this.props.route?.params;
    return (
      <>
        <View style={styles.frame1}>
          <View style={styles.roomIconView}>
            <Text style={{top: 3}}>{emoji}</Text>
          </View>
          <View style={{marginLeft: 10}}>
            <Text style={styles.workspaceName}>Workspace Name</Text>
            <TextInput
              ref={input}
              autoFocus={true}
              onChangeText={(workspaceName) => this.setState({workspaceName})}
              placeholder="Type name here..."
              value={workspaceName}
              style={styles.textInputStyle}
            />
          </View>
        </View>
        {/* <View style={styles.frame2}>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => {
              this.props.onCreate(workspaceName);
            }}
            style={styles.createView}>
            <Text style={styles.createText}>Create</Text>
          </TouchableHighlight>
          <TouchableHighlight
            underlayColor="rgba(0,0,0,0.05)"
            onPress={() => this.closeModal()}
            style={styles.cancelView}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableHighlight>
        </View> */}
      </>
    );
  }

  render() {
    return (
      <View style={{flex: 1, backgroundColor: '#ffffff'}}>

        <Header
          {...this.props}
          title={'Create Workspace'}
          goBack={true}
          rightContent={this.renderRightContent()}
        />
        {this.create()}
        {this.props.showLoader && <Loader />}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  headerText: {
    margin: 20,
    fontWeight: '400',
    fontSize: normalize(16),
    color: '#202124',
  },
  mainView: {
    borderBottomWidth: 1,
    borderColor: '#E4E5E7',
    flexDirection: 'row',
  },
  textInputStyle: {
    marginTop: 5,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    fontSize: normalize(14),
    borderRadius: 4,
    padding: 8,
    width: 280,
  },
  workspaceName: {
    fontWeight: '500',
    fontSize: normalize(14),
    color: '#202124',
  },
  frame1: {
    flexDirection: 'row',
    marginTop: 33,
    marginHorizontal: 20,
  },
  roomIconView: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 10.7,
    backgroundColor: '#EFF0F1',
  },

  cancelView: {
    borderRadius: 4,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#BDC1C6',
    width: '45%',
    alignItems: 'center',
  },
  createView: {
    borderRadius: 4,
    //paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createText: {
    fontWeight: '500',
    fontSize: normalize(16),
    color: '#0D6EFD',
  },
  greyText: {
    fontWeight: '500',
    fontSize: normalize(16),
    color: '#9AA0A6',
  },
  cancelText: {
    fontWeight: '500',
    fontSize: normalize(16),
    color: '#202124',
  },
  frame2: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'space-evenly',
  },
});

const mapStateToProps = (state) => {
  const {home} = state;
  return {
    showLoader: home.showLoader,
  };
};

export default connect(mapStateToProps)(CreateWorkspace);
