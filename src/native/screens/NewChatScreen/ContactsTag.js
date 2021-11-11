/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {connect} from 'react-redux';
import {normalize} from '../../utils/helpers';
import AutoTagsView from './AutoTagsView';
import {FadeUp} from '../../components/Animations/FadeUp';
import {
  getContactList,
  selectedContactList,
  getRecentContactList,
  setTopicName,
} from '../../../shared/redux/actions/create-message.action';
import {Icon} from '../../components/Icon/Icon';
import {isAndroid} from '../../utils/PlatformCheck';
import * as Constants from './../../components/KoraText';
import {emptyArray} from '../../../shared/redux/constants/common.constants';
import * as UsersDao from '../../../dao/UsersDao';

class MyAutoTag extends React.Component {
  constructor(props) {
    super();
    if (props.showTo !== undefined) {
      this.showTo = props.showTo;
    } else {
      this.showTo = true;
    }
    this.extraFilter = props.extraFilter || emptyArray;
    this.autoTagsRef = React.createRef();
  }
  state = {
    tagsSelected: [],
    suggestions: [],
    recentSuggestions: [],
    isGroupViewShow: false,
  };

  UNSAFE_componentWillMount() {
    // let uniq = {},
    //  recentObj = null;
    // this.setState({
    //   recentSuggestions: this.props.recentContactsData,
    // });
    // console.log(
    //   store.getState().messageThreadList?.thread?.threads,
    //   'store object threadslist',
    // );
    // if (store.getState().messageThreadList?.thread?.threads === undefined) {
    //   return;
    // }
    // recentObj = store
    //   .getState()
    //   .messageThreadList?.thread?.threads.map((v) => ({ ...v?.lastMessage?.from }));
    // if (recentObj !== null && recentObj !== undefined) {
    //   let currentUserId = UsersDao.getUserId();
    //   recentObj = recentObj?.filter((e) => e.id !== currentUserId);
    //   recentObj = recentObj?.filter(
    //     (obj) => !uniq[obj.id] && (uniq[obj.id] = true),
    //   );
    //   recentObj = recentObj.map((v) => ({
    //     ...v,
    //     name: v.fN + ' ' + v.lN,
    //     type: 'recent',
    //   }));
    //   // console.log(recentObj, 'recent object updated');
    //   this.setState({
    //     recentSuggestions: recentObj,
    //   });
    // }
  }

  componentDidMount() {
    this.props.getContactList('');
    this.props.setTopicName('');
    this.props.selectedContactList([]);
    this.props.getRecentContactList();
    this.checkAndUpdateSuggestions();
    if (this.props.fromTable) {
      this.setState({tagsSelected: this.props.extraFilter});
      this.props.selectedContactList([...this.props.extraFilter]);
    } else if (this.props.contacts) {
      let contacts = this.props.contacts;
      this.setState({tagsSelected: contacts});
      this.props.selectedContactList([...contacts]);
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.contactlistData !== this.props.contactlistData) {
      this.checkAndUpdateSuggestions();
    }
  }

  checkAndUpdateSuggestions() {
    if (this.props.contactlistData?.length > 0) {
      let concatContacts = [
        ...this.props.contactlistData,
        ...this.state.recentSuggestions,
      ];
      let uniqueArray = this.removeDuplicates(concatContacts, 'id');
      const l = uniqueArray.length;
      let n_uniqueArray = [];
      for (let i = 0; i < l; i++) {
        const item = uniqueArray[i];
        const index = this.extraFilter.findIndex((obj) => {
          return obj.id === item.id;
        });
        if (index === -1) {
          n_uniqueArray.push(item);
        }
      }
      this.setState({
        suggestions: n_uniqueArray,
      });
    } else {
      this.setState({suggestions: []});
    }
  }

  removeDuplicates(originalArray, prop) {
    var newArray = [];
    var lookupObject = {};

    for (var i in originalArray) {
      lookupObject[originalArray[i][prop]] = originalArray[i];
    }

    for (i in lookupObject) {
      newArray.push(lookupObject[i]);
    }
    return newArray;
  }

  customFilterData = (query) => {
    //override suggestion filter, we can search by specific attributes
    // console.log(query, 'query printed');
    query = query.toUpperCase();
    let searchResults = this.state.suggestions.filter((s) => {
      if (!s.fN) {
        return true;
      }
      var name = s.fN + ' ' + s.lN;
      return (
        name?.toUpperCase().includes(query) ||
        s.emailId.toUpperCase().includes(query) ||
        s.fN.toUpperCase().includes(query)
      );
    });
    return searchResults;
  };

  customRenderTags = (tags) => {
    //override the tags render
    return (
      <View style={styles.customTagsContainer}>
        {this.state.tagsSelected.map((t, i) => {
          return (
            <TouchableHighlight
              key={i}
              style={styles.customTag}
              onPress={() => this.handleDelete(i)}>
              <Text style={styles.tagText}>
                {this.getContactDisplayName(t) || t.emailId} &nbsp;&#x2715;
              </Text>
            </TouchableHighlight>
          );
        })}
      </View>
    );
  };

  getContactDisplayName = (obj) => {
    if (obj === null) {
      return null;
    }
    if (obj.lN != null && obj.fN != null) {
      return obj.fN + ' ' + obj.lN;
    }
    return obj.fN;
  };

  customRenderSuggestion = (suggestion) => {
    const name = (suggestion.fN + ' ' + suggestion.lN).trim();
    const col = suggestion.color;
    return (
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          alignItems: 'flex-start',
          alignContent: 'center',
          justifyContent: 'flex-start',
        }}>
        <View
          style={{
            paddingBottom: 20,
            flexDirection: 'row',
            flex: 1,
            alignItems: 'center',
            alignContent: 'center',
          }}>
          <View
            style={{
              width: 30,
              height: 30,
              borderRadius: 30 / 2,
              backgroundColor: col ? col : '#E7F1FF',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={styles.characterTextStyle}>
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={{flexDirection: 'column', marginStart: 15, padding: 5}}>
            <Text style={styles.nameTextStyle}>{name}</Text>
            <Text style={styles.emailIdTextStyle}>{suggestion.emailId}</Text>
          </View>
        </View>
        {suggestion.type === 'recent' ? (
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'center',
              padding: 5,
            }}>
            <Text style={styles.recentTextStyle}>{'Recent'}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  handleDelete = (index) => {
    //console.log('Deletion');
    let tagsSelected = this.state.tagsSelected;
    this.setState({
      tagsSelected: tagsSelected.filter((e) => e.id !== index.id),
    });

    // let addToSuggestions = [];
    // addToSuggestions.push(index);
    // addToSuggestions = addToSuggestions.concat(this.state.suggestions);
    // this.setState({suggestions: addToSuggestions});

    if (tagsSelected.length < 2) {
      this.autoTagsRef.current.setFocusOnInput();
      this.setState({isGroupViewShow: false});
    }
    const {contactData} = this.props;
    if (contactData) {
      let newContactData = contactData.filter((e) => e.id !== index.id);
      this.props.selectedContactList([...newContactData]);
    }
  };

  handleAddition = (contact) => {
    // console.log('Addition');
    //suggestion clicked, push it to our tags array
    const {suggestions} = this.state;

    this.setState({
      suggestions: suggestions.filter((e) => e.id !== contact.id),
    });
    this.setState({tagsSelected: this.state.tagsSelected.concat([contact])});
    const {contactData} = this.props;
    this.props.selectedContactList([...contactData, contact]);
  };

  onCustomTagCreated = (userInput) => {
    //user pressed enter, create a new tag from their input
    const contact = {
      email: userInput,
      fullName: null,
    };
    this.handleAddition(contact);
  };

  onArrowBtnClick = (isViewShow) => {
    //console.log('isGroupViewShow : ', isGroupViewShow);
    this.props.setTopicName('');
    this.setState({
      isGroupViewShow: isViewShow,
    });
  };
  callApi = (searchString) => {
    this.props.getContactList(searchString);
  };

  render() {
    var marginForArrow = isAndroid ? 25 : 0;
    let editGroupName = true;
    if (
      this.props.editGroupName !== undefined &&
      this.props.editGroupName !== null
    ) {
      editGroupName = this.props.editGroupName;
    }

    return (
      <>
        <View style={styles.container}>
          <FadeUp
            visible={this.props.visible}
            style={styles.autocompleteContainer}>
            <View style={{flexDirection: 'column'}}>
              {this.state.isGroupViewShow && (
                <View>
                  <View
                    style={{flexDirection: 'row', marginEnd: marginForArrow}}>
                    <View
                      style={{
                        height: 57,

                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                      }}>
                      <View
                        style={{
                          backgroundColor: '#F2F2F2',
                          borderRadius: 34 / 2,
                          width: 34,
                          height: 34,
                          marginLeft: 15,

                          borderWidth: 1,
                          borderColor: '#D9DBDE',
                          justifyContent: 'center',
                          alignContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Icon name={'Group'} size={15} color="#BDC1C6" />
                      </View>
                      {/* <Image
                        source={require('../../assets/profile.png')}
                        style={{width: 34, height: 34, marginLeft: 15}}
                      /> */}
                      <TextInput
                        placeholder="Group Name"
                        value={this.props.topicName}
                        onChangeText={this.props.setTopicName}
                        maxLength={30}
                        style={styles.textInputStyle}
                        autoFocus={true}
                      />
                      <TouchableOpacity
                        onPress={() => {
                          this.onArrowBtnClick(false);
                        }}
                        style={{
                          backgroundColor: '#F2F2F2',
                          borderRadius: 24 / 2,
                          width: 24,
                          height: 24,

                          justifyContent: 'center',
                          alignContent: 'center',
                          alignItems: 'center',
                        }}>
                        <Icon name={'UpArrow'} size={18} style={{}} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={{
                      borderBottomColor: '#E4E5E7',
                      borderBottomWidth: 1,
                    }}></View>
                </View>
              )}
              {/* <View style={{flexDirection: 'row', padding: 20}}>
                <View>
                  <View
                    style={{
                      minHeight: 30,
                      marginEnd: 10,
                      justifyContent: 'center',
                      alignContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={styles.textStyle}>
                      {this.showTo ? 'To' : '   '}
                    </Text>
                  </View>
                </View> */}
              <AutoTagsView
                //required\
                ref={this.autoTagsRef}
                leftContent={() => {
                  return (
                    <View>
                      {editGroupName &&
                      this.state.tagsSelected.length >= 2 &&
                      !this.state.isGroupViewShow ? (
                        <TouchableOpacity
                          onPress={() => {
                            this.onArrowBtnClick(true);
                          }}
                          style={{
                            backgroundColor: '#F2F2F2',
                            borderRadius: 24 / 2,
                            width: 24,
                            height: 24,
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            marginVertical: 6,
                            marginHorizontal: 10,
                          }}>
                          <Icon
                            name={'DownArrow'}
                            size={18}
                            style={{alignSelf: 'center'}}
                          />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  );
                }}
                callApi={this.callApi}
                suggestions={this.state.suggestions}
                tagsSelected={this.state.tagsSelected}
                handleAddition={this.handleAddition}
                handleDelete={this.handleDelete}
                recentSuggestions={this.state.recentSuggestions}
                //optional
                fontSize={normalize(16)}
                //autoFocus={true}
                placeholder="Add People"
                filterData={this.customFilterData}
                renderSuggestion={this.customRenderSuggestion}
                renderTags={this.customRenderTags}
                onCustomTagCreated={this.onCustomTagCreated}
                // onChangeText = {this.onTextChange}
                createTagOnSpace
              />
              {/* <View>
                {this.state.tagsSelected.length >= 2 &&
                !this.state.isGroupViewShow ? (
                  <TouchableOpacity
                    onPress={() => {
                      this.onArrowBtnClick(true);
                    }}
                    style={{
                      backgroundColor: '#F2F2F2',
                      borderRadius: 24 / 2,
                      width: 24,
                      height: 24,
                      paddingTop: 3,
                      justifyContent: 'center',
                      alignContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Icon name={'DownArrow'} size={18} style={{}} />
                  </TouchableOpacity>
                ) : null}
              </View> */}
              {/* </View> */}
            </View>
          </FadeUp>
        </View>
      </>
    );
  }
}
const mapStateToProps = (state) => {
  const {createMessage} = state;
  let obj1 = createMessage.contactData || emptyArray;
  let obj2 = createMessage.recentData || emptyArray;
  let obj3 = createMessage.contactlistData || emptyArray;
  let queryContactList = createMessage.contactlistData || emptyArray;
  return {
    // recentContactsData: [],
    contactlistData: [...obj1, ...obj2, ...obj3],
    contactData: createMessage.contactData,
    topicName: createMessage.topicName,
    queryContactList,
  };
};

export default connect(mapStateToProps, {
  getContactList,
  getRecentContactList,
  selectedContactList,
  setTopicName,
})(MyAutoTag);

export const styles = StyleSheet.create({
  main_container: {
    borderRadius: 0,
    paddingTop: 5,
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    borderColor: 'transparent',
    alignItems: 'stretch',
    backgroundColor: '#f2f1f1',
  },
  container: {
    flex: 0,
    flexGrow: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    paddingTop: 8,
  },
  autocompleteContainer: {
    flex: 1,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FFF',
    borderColor: '#ccc9c9',
    zIndex: 999,
  },
  customTagsContainer: {
    flex: 1,
    flexWrap: 'wrap',
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#FFFF',
    borderColor: 'grey',
    borderWidth: 0.1,
  },
  customTag: {
    justifyContent: 'center',
    marginLeft: 3,
    marginBottom: 3,
    marginTop: 3,
    marginRight: 5,
    padding: 5,
    height: 31,
    backgroundColor: '#E7F1FF',
    borderRadius: 3,
    borderColor: '#85B7FE',
    borderWidth: 1,
  },
  tagText: {
    padding: 0,
    margin: 0,
    color: '#07377F',
    fontSize: normalize(13),
    fontWeight: 'normal',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
  header: {
    backgroundColor: '#9d30a5',
    height: 80,
    alignSelf: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 15,
    marginBottom: 10,
  },
  label: {
    color: '#614b63',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageContainer: {
    marginTop: 160,
    height: 200,
    alignSelf: 'stretch',
    marginLeft: 20,
    marginRight: 20,
  },
  message: {
    backgroundColor: '#efeaea',
    height: 400,
    textAlignVertical: 'top',
  },
  characterTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#FFFFFF',
  },
  nameTextStyle: {
    color: '#202124',
    fontSize: normalize(17),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: '500',
  },
  emailIdTextStyle: {
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
    marginRight: 10,
    textAlignVertical: 'top',
    textAlign: 'center',
  },
  textInputStyle: {
    width: '75%',
    marginLeft: 15,
    fontWeight: '400',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    lineHeight: 19,
  },
  textStyle: {
    marginTop: 5,
    fontWeight: '400',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    color: '#202124',
  },
});
