import {debounce} from 'lodash';
import React, {Component} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  FlatList,
  ScrollView,
  TouchableHighlight,
  TouchableWithoutFeedback,
} from 'react-native';
import {connect} from 'react-redux';
import {
  getContactList,
  getRecentContactList,
  selectedContactList,
} from '../../../shared/redux/actions/create-message.action';
import * as Constants from '../../components/KoraText';
import {normalize} from '../../utils/helpers';
import {Icon} from '../../components/Icon/Icon';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import {SelectedUserTag} from '../../screens/NewChatScreen/AutoTagsView';
class _ContactSelection extends Component {
  constructor(props) {
    super();
    this.backspace = false;
    this.state = {
      inputFocus: false,
      selectedParticipants: [],
      searchText: '',
      updateList: false,
    };
    this.scrollView = React.createRef();
    this.input = React.createRef();
  }

  componentDidMount() {
    this.props.selectedContactList([]);
    //this.props.getContactList('');
    this.props.getRecentContactList();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.contactlistData !== this.props.contactlistData) {
      this.setState({updateList: true});
    }
    if (
      (this.state.searchText.length == 0 && prevState.searchText.length == 0) ||
      (this.state.searchText.length == 0 && prevState.searchText.length == 1)
    ) {
      if (this.backspace === false) {
        setTimeout(() => (this.backspace = true), 0);
      }
    }
  }

  renderDiscussionRoomName() {
    if (this.props.nameContent() === null) {
      return null;
    }

    return <View style={styles.nameViewStyle}>{this.props.nameContent()}</View>;
  }

  get filteredList() {
    const {contactData} = this.props;
    const result = this.props.contactlistData.filter(
      (user) => contactData.findIndex((o) => o.id === user.id) === -1,
    );
    return result;
  }

  hasBeenSelected(user) {
    const {contactData} = this.props;
    return contactData.findIndex((o) => o.id === user.id) !== -1;
  }

  renderSelectedParticipants() {
    const {contactData} = this.props;
    return contactData.map((user) => {
      return (
        <SelectedUserTag
          extraStyle={{marginTop: 0}}
          user={user}
          fullName={user?.fN + ' ' + user?.lN}
          _handleDelete={this.removeFromSelectedList}
        />
      );
    });
  }

  searchLeftContent() {
    return this.props.searchLeftContent();
  }

  searchRightContent() {
    return this.props.searchRightContent();
  }
  onKeyPress = ({nativeEvent}) => {
    if (nativeEvent.key === 'Backspace') {
      if (this.state.searchText === '' || !this.state.searchText) {
        const {contactData} = this.props;
        if (contactData?.length > 0 && this.backspace) {
          this.removeFromSelectedList(contactData[contactData.length - 1]);
        }
      }
    }
  };

  //this.props.fromShare key will be coming from shareNewThread & forwardMessage/forwarddr
  renderTextInput() {
    return (
      <View
        style={[
          this.props.fromShare
            ? {
                display: 'flex',
                flexDirection: 'row',

                maxHeight: 180,

                borderTopColor: '#E4E5E7',
              }
            : [styles.renderTextInputStyle, this.props.renderTextInputStyle],
        ]}>
        <View>{this.searchLeftContent()}</View>
        <ScrollView
          keyboardShouldPersistTaps={'always'}
          contentContainerStyle={[this.props.inputStyles]}
          // style={}
          inverted={true}
          ref={(ref) => {
            this.scrollView = ref;
          }}
          nestedScrollEnabled={true}
          // contentContainerStyle={{backgroundColor: 'green'}}
          onContentSizeChange={() =>
            this.scrollView.scrollToEnd({animated: true})
          }>
          <TouchableOpacity
            onPress={() => {
              this.input.current.focus();
            }}
            style={[
              {
                marginLeft: 3,
                alignContent: 'flex-start',
                flexDirection: 'row',
                flexWrap: 'wrap',

                alignItems: 'center',
              },
            ]}>
            {this.renderSelectedParticipants()}
            <TextInput
              onKeyPress={this.onKeyPress}
              autoFocus={this.props.autoFocus}
              ref={this.input}
              multiline={false}
              onFocus={() => this.textInputEvent(true)}
              onBlur={() => this.textInputEvent(false)}
              style={styles.searchTextStyle}
              value={this.state.searchText}
              onChangeText={this.onComposebarTextChange}
              placeholderTextColor="#9AA0A6"
              placeholder={
                this.props.contactData.length <= 0 ? this.props.placeholder : ''
              }
            />
          </TouchableOpacity>
        </ScrollView>
        <View>{this.searchRightContent()}</View>
      </View>
    );
  }

  onComposebarTextChange = (searchText) => {
    this.backspace = false;
    this.setState({searchText: searchText, updateList: false});
    if (
      searchText !== '' ||
      searchText?.trim() !== '' ||
      searchText !== undefined
    ) {
      /*   let tempList = this.props.suggestions.filter((obj) => {
      const {fN = '', lN = '', emailId = ''} = obj;
      let fullName = fN + ' ' + lN;
      fullName = fullName.toLowerCase();
      return (
        fullName.includes(searchText.toLowerCase()) ||
        emailId.includes(searchText.toLowerCase())
      );
    });

      if (tempList.length == 0) { */
      if (this.props.onComposebarTextChange) {
        this.props.onComposebarTextChange(searchText);
      }

      this.props.getContactList(searchText);
      //  }
    }
  };

  textInputEvent = debounce((val) => {
    this.onToggleFocus(val);
  }, 300);

  onToggleFocus(val = undefined) {
    if (val === this.state.inputFocus) {
      return;
    }

    if (val === undefined) {
      val = !this.state.inputFocus;
    }
    console.log('FOCUS CHANG');
    this.props.onToggleFocus(val);
    this.setState({inputFocus: val});
  }

  addToSelectedList(participant) {
    const {contactData} = this.props;
    this.setState({searchText: ''}, () => {
      this.props.selectedContactList([...contactData, participant]);
    });
  }

  removeFromSelectedList = (participant) => {
    let {contactData} = this.props;
    contactData = contactData.filter(
      (contact) => contact.id !== participant.id,
    );

    this.props.selectedContactList(contactData);
  };

  renderSuggestionListItem(item) {
    let name = (item.fN + ' ' + item.lN).trim();
    if (name.length > 23 && item.type === 'recent') {
      name = name.substring(0, 22) + '...';
    }
    const col = item.color;
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.2)"
        onPress={() => {
          // this.input?.current?.focus();
          this.addToSelectedList(item);
        }}
        style={{
          borderRadius: 5,
          paddingHorizontal: 10,
          flexDirection: 'row',
          flex: 1,
          alignItems: 'flex-start',
          alignContent: 'center',
          justifyContent: 'flex-start',
          paddingVertical: 3,
        }}>
        <>
          <View
            style={{
              paddingBottom: 8,
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              alignContent: 'center',
            }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 48 / 2,
                backgroundColor: col ? col : '#E7F1FF',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={styles.characterTextStyle}>
                {name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'column',
                marginStart: 8,
                padding: 5,
                width: '82%',
              }}>
              <Text style={styles.nameTextStyle} numberOfLines={1}>
                {name}
              </Text>
              <Text style={styles.emailTextStyle} numberOfLines={1}>
                {item.emailId}
              </Text>
            </View>
          </View>
          {item.type === 'recent' ? (
            <View style={styles.recentTextParentStyle}>
              <Text style={styles.recentTextStyle}>{'Recent'}</Text>
            </View>
          ) : null}
        </>
      </TouchableHighlight>
    );
  }

  filter(list) {
    if (!Array.isArray(list)) {
      return [];
    }
    let {searchText} = this.state;
    if (this.props.filterList.length > 0) {
      list = list.filter((obj) => {
        const id = obj._id || obj.id;
        return !this.props.filterList.find((o) => o._id === id);
      });
    }
    searchText = searchText.toLowerCase();
    if (
      searchText === '' ||
      searchText?.trim() === '' ||
      searchText == undefined
    ) {
      return list;
    }
    return list.filter((obj) => {
      const {fN = '', lN = '', emailId = ''} = obj;
      let fullName = fN + ' ' + lN;
      fullName = fullName.toLowerCase();
      return fullName.includes(searchText) || emailId.includes(searchText);
    });
  }

  SuggestionListItemSeparator = () => {
    return <View style={styles.suggestionListStyle} />;
  };
  renderSuggestionList() {
    // const filteredList = this.filteredList;
    //  console.log('Input focus state', this.state.inputFocus);
    // console.log('On change text', this.state.searchText);
    let data;
    if (this.state.searchText !== '') {
      data = this.filter(this.props.contactlistData);
    } else {
      data = this.filter(this.props.recentData);
    }

    //console.log("Contact data",JSON.stringify(data));
    return (
      <View style={{backgroundColor: 'white', width: '100%'}}>
        <FlatList
          nestedScrollEnabled
          contentContainerStyle={([this.props.listStyle], {paddingBottom: 100})}
          keyboardShouldPersistTaps={'always'}
          style={{maxHeight: 300}}
          bounces={false}
          keyExtractor={(obj) => obj.id}
          data={data}
          ListEmptyComponent={() => {
            if (this.state.searchText !== '') {
              return (
                <View style={styles.nomatch}>
                  <Text>No match found</Text>
                </View>
              );
            }
            return <View />;
          }}
          ItemSeparatorComponent={this.SuggestionListItemSeparator}
          renderItem={({item}) => {
            if (this.hasBeenSelected(item)) {
              return null;
            }
            return this.renderSuggestionListItem(item);
          }}
        />
      </View>
    );
  }

  render() {
    const {inputFocus} = this.state;
    return (
      <>
        {this.renderDiscussionRoomName()}
        <View
          style={[styles.mainContainerStyle, this.props.mainContainerStyle]}>
          {this.renderTextInput()}
        </View>
        {this.state.updateList && this.state.searchText ? (
          <View style={styles.suggestionListContainer}>
            {this.renderSuggestionList()}
          </View>
        ) : null}
      </>
    );
  }
}

const styles = StyleSheet.create({
  nomatch: {
    alignItems: 'center',
    minHeight: 50,
    justifyContent: 'center',
    marginHorizontal: 15,
  },
  renderTextInputStyle: {
    display: 'flex',
    flexDirection: 'row',
    // alignItems: 'center',
    maxHeight: 210,
    borderTopWidth: 1,
    borderTopColor: '#E4E5E7',
  },
  suggestionListContainer: {
    // position:'relative',
    width: '100%',
    // top:100,
    backgroundColor: 'white',
    // shadowColor: 'grey',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  tagText: {
    padding: 0,
    margin: 0,
    color: '#07377F',
    fontSize: normalize(13),

    textAlignVertical: 'center',
    textAlign: 'center',
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  customTag: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginLeft: 3,

    alignContent: 'center',
    alignItems: 'center',
    marginRight: 5,
    marginVertical: 3,
    padding: 5,
    paddingRight: 0,
    height: normalize(32),
    backgroundColor: '#E7F1FF',
    borderRadius: 3,
    borderColor: '#85B7FE',
    borderWidth: 1,
  },
  searchTextStyle: {
    textAlignVertical: 'center',
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    minHeight: 35,
    paddingHorizontal: 2,
    //flex: 1,
    padding: 0,
    //lineHeight: 16,

    //minWidth: 50,

    alignContent: 'center',
  },
  characterTextStyle: {
    fontWeight: '500',
    fontSize: normalize(17),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#FFFFFF',
  },
  nameTextStyle: {
    color: '#202124',
    fontWeight: '500',
    fontSize: normalize(17),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    paddingRight: 10,
  },
  emailTextStyle: {
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(12),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    top: 3,
  },
  recentTextStyle: {
    color: '#9AA0A6',
    fontSize: normalize(12),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: '500',
    marginRight: 5,
    textAlignVertical: 'top',
    textAlign: 'center',
  },
  toTextStyle: {
    width: 34,
    textAlign: 'center',
    margin: 10,
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  recentTextParentStyle: {
    flexDirection: 'column',
    justifyContent: 'center',
    height: '100%',
  },
  nameViewStyle: {
    marginLeft: 15,
  },
  suggestionListStyle: {height: 1, backgroundColor: '#EFF0F1'},
  mainContainerStyle: {
    backgroundColor: 'white',
    // padding: 10,
    // shadowColor: 'grey',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E5E7',
    paddingHorizontal: 16,
    paddingTop: 14,
  },
});

_ContactSelection.defaultProps = {
  autoFocus: false,
  nameContent: () => null,
  onToggleFocus: () => {},
  searchLeftContent: () => {
    return <Text style={styles.toTextStyle}>To</Text>;
  },
  searchRightContent: () => {},
  inputStyles: {},
  filterList: [],
  placeholder: 'Add People',
  listStyle: {padding: 10, marginHorizontal: 5},
};

const mapStateToProps = (state) => {
  const {createMessage} = state;
  let obj1 = createMessage.contactlistData || emptyArray;
  let obj2 = createMessage.recentData || emptyArray;
  obj2 = obj2.map((v) => ({
    ...v,
    type: 'recent',
  }));
  obj1 = obj1.filter((obj) => -1 === obj2.findIndex((o) => o._id === obj._id));
  return {
    contactlistData: [...obj2, ...obj1] || emptyArray,
    recentData: obj2,
    contactData: createMessage.contactData || emptyArray,
  };
};

export default connect(mapStateToProps, {
  selectedContactList,
  getContactList,
  getRecentContactList,
})(_ContactSelection);
