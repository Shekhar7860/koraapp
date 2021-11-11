import {th} from 'date-fns/locale';
import {Button} from 'native-base';
import React, {Component} from 'react';
import {BackHandler, Alert} from 'react-native';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {getComments} from '../../../shared/redux/actions/knowledge.action';
import {connect} from 'react-redux';
import WebView from 'react-native-webview';
import {Header} from '../../navigation/TabStacks';
import * as UsersDao from '../../../dao/UsersDao';
import API_URL from '../../../../env.constants';
import {navigate, goBack} from '../../navigation/NavigationService';
import Modal from 'react-native-modal';
import {Icon} from '../../components/Icon/Icon';
import {normalize} from '../../utils/helpers';
import DateTimePicker from '../../screens/Meetings/NewMeeting/dateTimePicker';

import {ROUTE_NAMES} from '../../navigation/RouteNames';
const setMeetTime = React.createRef();
import moment from 'moment';
import {store} from '../../../shared/redux/store';
import {
  getTableDetail,
  editTableRow,
  getTableHeaderDetail,
} from '../../../shared/redux/actions/workspace.action';
import FormTableView from './FormTableView';
import {Loader} from '../ChatsThreadScreen/ChatLoadingComponent';


class WebViewComponent extends React.Component {
  backAction = () => {
    if (this.state.canGoBack === true) {
      this.webViewBridgeRef?.current?.goBack();
      return true;
    } else {
      Alert.alert('', 'Are you sure you want to go back?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {
          text: 'YES',
          onPress: () => {
            if (this.state?.board?.type === 'document') {
              const INJECTE_BACKPRESS_JAVASCRIPT = `
       receiveNativeMessage(${JSON.stringify(this.BackPressInject)});
       true;
     `;
              this.webViewBridgeRef?.current?.injectJavaScript(
                INJECTE_BACKPRESS_JAVASCRIPT,
              );
            }
            goBack();
            //this.webViewBridgeRef.current.goBack();
          },
        },
      ]);
      return true;
    }
  };
  constructor(props) {
    super(props);
    this.webViewBridgeRef = React.createRef();
    this.state = {
      webViewUrl: '',
      board: null,
      canGoBack: false,

      columnHeader: null,
      rowData: null,
      tabelInfo: null,
    };

    this.accountDetails = null;
    this.BackPressInject = {event: 'save_document'};
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }
  componentDidUpdate(prevProps) {
    if (prevProps.editRowSuccess !== this.props.editRowSuccess) {
      this.updateRow(this.props.editRowSuccess);
    }
  }

  updateRow(row) {
    const dataObj = {
      event: 'update_row',
      meta: this.state.tabelInfo,
      data: row,
    };

    const UPDATE_ROW = `
    receiveNativeMessage(${JSON.stringify(dataObj)});
    true;
  `;
    this.webViewBridgeRef?.current?.injectJavaScript(UPDATE_ROW);

    /*  const INJECT_ROW = `
    update_row(${JSON.stringify(dataObj)});
    true;
  `;
    this.webViewBridgeRef?.current?.injectJavaScript(INJECT_ROW); */
    // console.log(
    //   '--------------ss---editRowSuccess---------------------------------',
    //   JSON.stringify(dataObj),
    // );
    //   this.webViewBridgeRef?.current?.reload();
  }

  getUserAuthData = async () => {
    let user = await UsersDao.getUserInfo();
    let auth = await UsersDao.getAuthorization();

    this.accountDetails = {
      authorization: auth._raw,
      userInfo: user._raw,
    };
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );

    console.log('Props of boards', this.props.route.params.board);
    if (this.props.route.params.board) {
      this.setState({board: this.props.route.params.board});
      this.props.getComments(this.props.route.params.board?.id);
    }
    this.getUserAuthData();
    // let user = UsersDao.getUserFullObject();
    // let auth = UsersDao.getAuthObject();

    // this.accountDetails = {
    //   authorization: auth,
    //   userInfo: user,
    // };
    // console.log(
    //   'account detail :------->',
    //   JSON.stringify(this.accountDetails),
    // );
  }

  renderHeaderIcons() {
    return (
      <View style={styles.flexStyle}>
        <TouchableOpacity
          onPress={() => {
            navigate(ROUTE_NAMES.DOC_COMMENTS, {
              //onSelect: this.onSelect,
              document: this.state.board,
            });
          }}
          style={styles.paddingStyle}>
          <View style={styles.commentCountView}>
            <Text style={styles.commentText}>{this.props.commentCount}</Text>
          </View>
          <Icon name={'Comment_Icon'} size={normalize(24)} color="#202124" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}} style={styles.paddingStyle}>
          <Icon name={'options'} size={normalize(24)} color="#202124" />
        </TouchableOpacity>
      </View>
    );
  }

  renderHeader(type) {
    return (
      <Header
        {...this.props}
        title={this.state.board?.name}
        goBack={true}
        rightContent={type === 'document' ? this.renderHeaderIcons() : null}
      />
    );
  }
  _onMessage = (event) => {
    let data = JSON.parse(event.nativeEvent.data);

    //console.log('_onMessage', event, data);
    if (data?.event === 'document_load') {
      const INJECTED_JAVASCRIPT = `
      updateAccountDetails(${JSON.stringify(this.accountDetails)});
      true;
    `;
      this.webViewBridgeRef?.current?.injectJavaScript(INJECTED_JAVASCRIPT);
    } else if (data?.event === 'save_successfull') {
      //backpress event save response
      //console.log('------------------------saved triggered-------------');
    } else if (data?.event === 'table_details') {
      let payLoad = {
        boardId: data.payload.boardId,
        tableId: data.payload.activeTableId,
        rowId: data.payload.activeRowId,
        wsId: data.payload.wsId,
      };
      this.getTableHeaderData(payLoad);
    }
  };

  getTableHeaderData = (payLoad) => {
    store.dispatch(
      getTableHeaderDetail(payLoad, (type, responseHeader) => {
        if (type === 'success') {
          // console.log('--------header-----', JSON.stringify(responseHeader));

          store.dispatch(
            getTableDetail(payLoad, (type, response) => {
              if (type === 'success') {
                this.setState({
                  columnHeader: responseHeader,
                  rowData: response,
                  tabelInfo: payLoad,
                });
                this.navigateToRowEdit();
              } else {
              }
            }),
          );
        } else {
        }
      }),
    );
  };
  setMeetTime(type, date) {
    this.setState({startDate: date});
  }

  navigateToRowEdit = () => {
    navigate(ROUTE_NAMES.TABLE_ROW_EDIT, {
      columnHeader: this.state.columnHeader,
      rowData: this.state.rowData,
      tabelInfo: this.state.tabelInfo,
    });
  };

  renderModalView() {
    return (
      <FormTableView
        columnHeader={this.state.columnHeader}
        rowData={this.state.rowData}
      />
    );
  }
  
 ActivityIndicatorElement = () => {
  //making a view to show to while loading the webpage
  if(this.state?.board?.type==='embeddedweb'){
  return <Loader />;
 }
 return null;
};
  render() {
    let wsId = this.state.board?.wsId;
    let id = this.state.board?._id;
    let type = this.state.board?.type;

    let url = null;
    let route = 'mobileeditor?';
    switch (type) {
      case 'document':
        route = 'mobileeditor?';
        break;
      case 'table':
        route = 'mobiletable?';
        break;
      case 'embeddedweb':
        url = this.state.board?.payload?.url;
        break;
    }

    if (type !== undefined && type !== null && type !== 'embeddedweb') {
      if (id && wsId) {
        url = API_URL.appServer + route + 'wsId=' + wsId + '&boardId=' + id;
      }
      [];
    }
    if (url !== null) {
      // console.log(type + ':url------------:>', url);
    }

    return (
      <View style={styles.container}>
        {this.renderHeader(type)}
        <DateTimePicker
          ref={setMeetTime}
          setDateTime={(type, date) => this.setMeetTime(type, date)}
        />
        {/*   <Modal isVisible={this.state.moduleOpen}>
          {this.renderModalView()}
        </Modal> */}
        <WebView
          ref={this.webViewBridgeRef}
          source={{uri: url}}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          javaScriptEnabledAndroid={true}
          renderLoading={this.ActivityIndicatorElement}
          //Want to show the view or not
          startInLoadingState={true}
          onNavigationStateChange={(navState) => {
            this.setState({canGoBack: navState.canGoBack});
          }}
          onMessage={this._onMessage}
        />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  buttonStyle: {
    width: 35,
    height: 35,
    alignItems: 'center',
    borderColor: 'grey',
    marginStart: 10,
    borderWidth: 0.4,
    borderRadius: 5,
    justifyContent: 'center',
  },
  view_row: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 5,
    flexDirection: 'row',
  },
  tvHeader: {
    fontSize: normalize(12),

    marginStart: normalize(5),
  },
  titleInputStyle: {
    borderWidth: 0.5,
    borderColor: 'grey',
    fontSize: normalize(14),
    borderRadius: 4,
    justifyContent: 'center',
    padding: 5,
    minHeight: 40,
    marginBottom: 15,
  },
  buttonStyleV: {
    width: 35,
    height: 35,
    alignItems: 'center',
    borderColor: 'grey',

    borderWidth: 0.4,
    borderRadius: 5,
    justifyContent: 'center',
  },
  container: {
    backgroundColor: '#F5FCFF',
    flex: 1,
  },
  activityIndicatorStyle: {
    flex: 1,
    position: 'absolute',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: 'auto',
    marginBottom: 'auto',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  commentCountView: {
    width: 18,
    height: 18,
    backgroundColor: '#FFDA2D',
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 18,
    top: 1,
    zIndex: 1,
  },
  commentText: {fontSize: 9, fontWeight: '500'},
  paddingStyle: {padding: 5},
  flexStyle: {
    flexDirection: 'row',
  },
});

const mapStateToProps = (state) => {
  const {workspace, knowledge} = state;
  return {
    editRowSuccess: workspace.editRowSuccess,
    commentCount: knowledge.docComments?.total,
  };
};

export default connect(mapStateToProps, {
  getTableDetail,
  getComments,
})(WebViewComponent);
