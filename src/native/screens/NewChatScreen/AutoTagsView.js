import React, { Component } from 'react';
import {
  StyleSheet,
  TouchableHighlight,
  View,
  ScrollView,
  Dimensions,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { normalize } from '../../utils/helpers';
import * as Constants from '../../components/KoraText';
import { isAndroid } from '../../utils/PlatformCheck';
import { Avatar } from '../../components/Icon/Avatar';
import { Icon } from '../../components/Icon/Icon';
import { emptyObject } from '../../../shared/redux/constants/common.constants';

const DEVICE_WIDTH = Dimensions.get('window').width;
const DEVICE_HEIGHT = Dimensions.get('window').height;

export const SelectedUserTag = ({
  user,
  fullName,
  _handleDelete,
  extraStyle = emptyObject,
}) => {
  return (
    <TouchableHighlight
      key={user.id}
      underlayColor="rgba(0,0,0,0.2)"
      style={[styles.customTag, extraStyle]}
      onPress={() => _handleDelete(user)}>
      <View style={styles.participantsView}>
        <Avatar
          profileIcon={user?.icon}
          color={user?.color}
          textSize={normalize(13)}
          userId={user?.id}
          name={fullName}
          type={'offline'}
          rad={normalize(26)}
        />
        <Text
          numberOfLines={1}
          style={{
            color: '#202124',
            flexShrink: 1,
            fontSize: normalize(16),
            paddingLeft: 8,
          }}>
          {fullName}
        </Text>
        <View style={{ width: 10 }} />
        <Icon name="cross" size={normalize(16)} color="#202124" />
      </View>
    </TouchableHighlight>
  );
};

class AutoTagsView extends Component {
  constructor(props) {
    super();

    // this backspace flag key will be used for clearing token of in selected contact from device backspace action 
    this.backspace = false;
    this.state = {
      inputFocus: false,
      selectedParticipants: [],
      searchText: '',
      filterList: [],
      suggestionsUpdate: false,
    };
    this.scrollView = React.createRef();
    this.input = React.createRef();
  }

  componentDidMount() {
    //https://stackoverflow.com/questions/46715378/react-native-textinput-does-not-get-focus
    //this.input?.current?.focus();
    setTimeout(() => this.input?.current?.focus(), 500);
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.suggestions !== this.props.suggestions) {
      this.setState({ suggestionsUpdate: true });
    }

    if (this.state.searchText.length == 0 && prevState.searchText.length == 0
      || this.state.searchText.length == 0 && prevState.searchText.length == 1) {

      if (this.backspace === false) {
        setTimeout(() => this.backspace = true, 0);
      }
    }

  }
  // state = {
  //   //query: '',
  // };

  // renderTags = () => {
  //   if (this.props.renderTags) {
  //     return this.props.renderTags(this.props.tagsSelected);
  //   }

  //   const tagMargins = this.props.tagsOrientedBelow
  //     ? {marginBottom: 5}
  //     : {marginTop: 5};

  //   return (
  //     <View style={styles.tags}>
  //       {this.props.tagsSelected.map((t, i) => {
  //         return (
  //           <TouchableHighlight
  //             key={generateRandomId()}
  //             style={[tagMargins, styles.tag]}
  //             onPress={() => this.props.handleDelete(i)}>
  //             <Text style={styles.nameTextStyle}>{t.name}</Text>
  //           </TouchableHighlight>
  //         );
  //       })}
  //     </View>
  //   );
  // };

  // validateEmailOrNot = (text) => {
  //   //console.log(text);
  //   var pattern = new RegExp(
  //     /^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i,
  //   );

  //   // let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  //   if (!pattern.test(text)) {
  //     console.log(text, 'is not a email');
  //     return false;
  //   } else {
  //     console.log(text, 'is  a email');
  //     return true;
  //   }
  // };

  // handleInput = (text) => {
  //   if (this.submitting) return;
  //   if (this.props.allowBackspace) {
  //     //TODO: on ios, delete last tag on backspace event && empty query
  //     //(impossible on android atm, no listeners for empty backspace)
  //   }
  //   //if (this.props.onChangeText) return this.props.onChangeText(text);
  //   // if (
  //   //   this.props.createTagOnSpace &&
  //   //   this.props.onCustomTagCreated &&
  //   //   text.length > 1 &&
  //   //   text.charAt(text.length - 1) === ' '
  //   // )
  //   const lastTyped = text.charAt(text.length - 1);
  //   const parseWhen = [',', ' ', ';', '\n'];
  //   if (parseWhen.indexOf(lastTyped) > -1) {
  //     if (this.validateEmailOrNot(text.substring(0, text.length - 1))) {
  //       this.setState({query: ''});
  //       this.setState({query: ''});
  //       return this.props.onCustomTagCreated(text.trim());
  //     } else if (
  //       this.props.createTagOnSpace &&
  //       !this.props.onCustomTagCreated
  //     ) {
  //       console.log(
  //         'When enabling createTagOnSpace, you must provide an onCustomTagCreated function',
  //       );
  //     }
  //   }

  //   if (text.charAt(text.length - 1) === '\n') {
  //     return; // prevent onSubmit bugs
  //   }

  //   this.setState({query: text});
  // };

  // filterData = (query) => {
  //   if (!query || query.trim() === '' || !this.props.suggestions) {
  //     return;
  //   }
  //   if (this.props.filterData) {
  //     return this.props.filterData(query);
  //   }
  //   let suggestions = this.props.suggestions;
  //   let results = [];
  //   query = query.toUpperCase();
  //   suggestions.forEach((i) => {
  //     if (i.name.toUpperCase().includes(query)) {
  //       results.push(i);
  //     }
  //   });
  //   return results;
  // };

  // onSubmitEditing = () => {
  //   //const {query} = this.state;
  //   this.submitting = false;

  //   //  this.handleInput(query.trim() + ' ');
  //   // if (!this.props.onCustomTagCreated || query.trim() === '') return;
  //   // this.setState({query: ''}, () => this.props.onCustomTagCreated(query));

  //   // // prevents an issue where handleInput() will overwrite
  //   // // the query clear in some circumstances
  //   // this.submitting = true;
  //   // setTimeout(() => {
  //   //   this.submitting = false;
  //   // }, 30);
  // };

  // addTag = (tag) => {
  //   console.log('tag added');
  //   this.props.handleAddition(tag);
  //   this.setState({query: ''});
  // };

  // // scrollViewRef = (scrollView) => {
  // //   //invariant(typeof scrollView === 'object', 'ScrollView ref is object');
  // //   this.state.scrollView = scrollView;
  // // };

  // // scrollToEnd = () => {
  // //   const scrollView = this.state.scrollView;
  // //   // invariant(
  // //   //   scrollView,
  // //   //   'this.scrollView ref should exist before scrollToEnd called',
  // //   // );
  // //   setTimeout(() => {
  // //     scrollView.scrollToEnd({animated: true});
  // //   }, 0);
  // // };
  // filterSuggestionList() {
  //   const {query} = this.state;
  //   var data = [];
  //   var filterData = this.filterData(query);
  //   if (filterData?.length > 0) {
  //     data = [...filterData];
  //   } else {
  //     data = [...this.props.recentSuggestions];
  //   }
  //   var filteredArray = data.filter(
  //     (item) => !this.props.tagsSelected.includes(item),
  //   );
  //   return filteredArray;
  // }

  isSearchText() {
    let { searchText } = this.state;

    if (
      searchText === '' ||
      searchText?.trim() === '' ||
      searchText == undefined
    ) {
      return false;
    }
    return true;
  }

  filter(list) {
    if (!Array.isArray(list)) {
      return [];
    }
    let { searchText } = this.state;
    if (this.state.filterList.length > 0) {
      list = list.filter((obj) => {
        const id = obj._id;
        return !this.state.filterList.find((o) => o._id === id);
      });
    }
    searchText = searchText.toLowerCase();
    if (
      searchText === '' ||
      searchText?.trim() === '' ||
      searchText == undefined
    ) {
      return;
    }
    return list.filter((obj) => {
      const { fN = '', lN = '', emailId = '' } = obj;
      let fullName = fN + ' ' + lN;
      fullName = fullName.toLowerCase();
      return fullName.includes(searchText) || emailId.includes(searchText);
    });
  }

  _handleDelete = (user) => {
    this.props.handleDelete(user);
  };

  renderSelectedParticipants() {
    let contactData = this.props.tagsSelected;
    return contactData?.map((user) => {
      const { fN, lN, color } = user;
      let fullName = fN + ' ' + lN;
      return (
        <SelectedUserTag
          user={user}
          fullName={fullName}
          _handleDelete={this._handleDelete}
        />

      );
    });
  }

  setFocusOnInput = () => {
    this.input.current.focus();
  };


  onKeyPress = ({ nativeEvent }) => {
    if (nativeEvent.key === 'Backspace') {
      if (this.state.searchText === '' || !this.state.searchText) {
        const tagsCount = this.props.tagsSelected.length;
        if (tagsCount > 0 && this.backspace) {
          this._handleDelete(this.props.tagsSelected[tagsCount - 1]);
        }
      }
    }
  };

  renderTextInput() {
    return (
      <View
        style={{
          flexDirection: 'row',
          maxHeight: 190,
          paddingVertical:10,
          borderBottomWidth: 0.7,
          borderBottomColor: '#BDC1C6',
          paddingLeft: 15,
          flex: 1,
        }}>

        <View
          style={{
            justifyContent: 'center',
           alignItems: 'center',
           
            
            height:35,
            width: 24,
          }}>
          <Icon size={normalize(20)} name={'People'} />
        </View>
        <View
          style={{
            flexDirection: 'column',
            flex: 1,

            marginLeft: 15,
          }}>
          <ScrollView
            persistentScrollbar={true}
            inverted={true}
            ref={(ref) => {
              this.scrollView = ref;
            }}
            onContentSizeChange={() =>
              this.scrollView.scrollToEnd({ animated: true })
            }>
            <TouchableOpacity
              onPress={() => {
                this.setFocusOnInput();
              }}
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
              
              }}>
              {this.renderSelectedParticipants()}
              <TextInput
                ref={this.input}
                autoFocus={true}
                onKeyPress={this.onKeyPress}
                multiline={false}
                onFocus={() => this.onToggleFocus(true)}
                onBlur={() => this.onToggleFocus(false)}
                style={styles.searchTextStyle}
                value={this.state.searchText}
                onChangeText={this.onComposebarTextChange}
                placeholderTextColor="#9AA0A6"
                placeholder={
                  this.props.tagsSelected?.length <= 0 ? 'Add People' : ''
                }
              />
            </TouchableOpacity>
          </ScrollView>
        </View>
        {this.props.leftContent()}
      </View>
    );
  }
  onComposebarTextChange = (searchText) => {

    this.backspace = false;
    this.setState({ searchText: searchText, suggestionsUpdate: false });

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
      this.props.callApi(searchText);
      //  }
    }
  };
  hasBeenSelected(user) {
    let contactData = this.props.tagsSelected;
    return contactData.findIndex((o) => o.id === user.id) !== -1;
  }

  onToggleFocus(val = undefined) {
    if (val === undefined) {
      val = !this.state.inputFocus;
    }
    this.setState({ inputFocus: val });
  }

  renderSuggestionListItem(item) {
    const name = (item.fN + ' ' + item.lN).trim();
    const col = item.color;
    return (
      <TouchableHighlight
        underlayColor="rgba(0,0,0,0.2)"
        onPress={() => {
          this.input?.current?.focus();
          this.props.handleAddition(item);
          this.setState({ searchText: '' });
        }}
        style={{
          borderRadius: 5,
          paddingHorizontal: 10,
          flexDirection: 'row',
          flex: 1,
          alignItems: 'flex-start',
          alignContent: 'center',
          justifyContent: 'flex-start',
          paddingVertical: 5,
        }}>
        <>
          <View
            style={{
              // paddingBottom: 20,
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              alignContent: 'center',
            }}>
            <Avatar
              name={name}
              color={col}
              rad={normalize(32)}
              textSize={normalize(16)}
              profileIcon={item?.icon}
              userId={item?.id}
            />
            <View style={{ flexDirection: 'column', marginStart: 5, padding: 5 }}>
              <Text style={styles.nameTextStyle}>{name}</Text>
              <Text style={styles.emailTextStyle}>{item.emailId}</Text>
            </View>
          </View>
          {/* {item.type === 'recent' ? (
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'flex-end',
                paddingTop: 5,
              }}>
              <Text style={styles.recentTextStyle}>{'Recent'}</Text>
            </View>
          ) : null} */}
        </>
      </TouchableHighlight>
    );
  }

  renderSuggestionList() {
    // const filteredList = this.filteredList;
    const data = this.filter(this.props.suggestions);
    return (
      <View>
        <FlatList
          contentContainerStyle={{
            padding: this.isSearchText() ? 10 : 0,
            marginHorizontal: this.isSearchText() ? 5 : 0,
           
          }}
         
          keyboardShouldPersistTaps={'always'}
          style={{ maxHeight: 300,}}
          bounces={false}
          keyExtractor={(obj) => obj.id}
          data={data}
          // ItemSeparatorComponent={() => (
          //   <View style={{height: 1, backgroundColor: '#EFF0F1'}} />
          // )}
          ListEmptyComponent={() => {
            if (!this.isSearchText() || !this.state.suggestionsUpdate) {
              return null;
            }
            return (
              <View>
                <Text>No match found</Text>
              </View>
            );
          }}
          renderItem={({ item }) => {
            if (this.hasBeenSelected(item)) {
              return null;
            }
            return this.renderSuggestionListItem(item);
          }}
        />
        <View
          style={{
            borderBottomColor: '#E4E5E7',
            borderBottomWidth: 0.5,

          }}></View>
      </View>
    );
  }

  render() {
    // const {query} = this.state;
    // const data = this.filterSuggestionList();
    // // this.filterData(query);
    const data = this.filter(this.props.suggestions);
    return (
      <>
        <View>{this.renderTextInput()}</View>
        {/* <View
          style={{
            borderColor: '#f5f5f5',
            borderWidth: 3,
            shadowColor: 'grey',
          }}
        /> */}
        {this.state.searchText && this.state.suggestionsUpdate ? (
          <View
            style={{
              backgroundColor: '#fff',
              margin: 10,
              marginTop: 0,

              shadowColor: 'grey',
              shadowOpacity: 0.3,
              shadowOffset: { height: 5 },
              //backgroundColor: 'red',
            }}>
            {this.renderSuggestionList()}
          </View>
        ) : null}
      </>
      // <View style={{flex: 1}}>
      //   <View style={styles.tagInputContainer}>
      //     <View style={styles.renderTagsContainer}>
      //       <ScrollView
      //       // ref={this.scrollViewRef}
      //       // style={{flexGrow: 0}}
      //       // onContentSizeChange={this.scrollToEnd}
      //       >
      //         {!this.props.tagsOrientedBelow &&
      //           this.props.tagsSelected &&
      //           this.renderTags()}
      //       </ScrollView>
      //     </View>
      //   </View>
      //   <Autocomplete
      //     data={data}
      //     controlled={true}
      //     placeholder={this.props.placeholder}
      //     defaultValue={query}
      //     value={query}
      //     onChangeText={(text) => this.handleInput(text)}
      //     onSubmitEditing={this.onSubmitEditing}
      //     multiline={true}
      //     listStyle={styles.listStyle}
      //     autoFocus={this.props.autoFocus === false ? false : true}
      //     renderItem={({item, i}) => (
      //       <TouchableOpacity onPress={(e) => this.addTag(item)}>
      //         {this.props.renderSuggestion ? (
      //           this.props.renderSuggestion(item)
      //         ) : (
      //           <Text style={styles.nameTextStyle}>{item.name}</Text>
      //         )}
      //       </TouchableOpacity>
      //     )}
      //     inputContainerStyle={
      //       this.props.inputContainerStyle || styles.inputContainerStyle
      //     }
      //     // containerStyle={this.props.containerStyle || styles.containerStyle}
      //     // underlineColorAndroid="transparent"
      //     style={styles.addContactsContainer}
      //     listContainerStyle={{
      //       backgroundColor: this.props.tagsOrientedBelow
      //         ? '#efeaea'
      //         : 'transparent',
      //     }}
      //     {...this.props}
      //   />
      //   {/* {this.props.tagsOrientedBelow &&
      //     this.props.tagsSelected &&
      //     this.renderTags()} */}
      // </View>
    );
  }
}

const styles = StyleSheet.create({
  characterTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#FFFFFF',
  },
  recentTextStyle: {
    color: '#9AA0A6',
    fontSize: normalize(12),
    fontWeight: '500',
  },
  suggestionListContainer: {
    backgroundColor: 'white',
    shadowColor: 'grey',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  customTag: {
    justifyContent: 'center',
    height: 31,
    marginVertical: 4,
    paddingEnd: 5,
    backgroundColor: '#E7F1FF',
    borderRadius: 100,



    flexShrink: 1,

    //borderColor: '#85B7FE',
    //borderWidth: 1,
  },
  participantsView: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    maxWidth: 240,
  },
  item: {
    backgroundColor: 'white',
    padding: 10,
    shadowColor: 'grey',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E5E7',
  },
  searchTextStyle: {
    textAlignVertical: 'center',
    fontWeight: '400',
    fontSize: normalize(15),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    //lineHeight: 16,
    // marginVertical: 5,
    // paddingBottom: 8,
    alignSelf: 'center',
    maxHeight: 40,
    minHeight:35,
    padding: 0,
    marginStart:4,
    
    //minWidth: 100,
    //backgroundColor: 'red',
    //flex: 1,
    // width: '100%',
  },
  textStyle: {
    marginTop: 5,
    fontWeight: '400',
    fontSize: normalize(15),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    color: '#202124',
  },
  // listStyle: {
  //   maxHeight: 370,
  //   top: 25,
  //   marginLeft: -50,
  //   // width:412.5,
  //   paddingLeft: 20,
  //   paddingTop: 10,
  //   // borderRadius: 5,
  //   width: DEVICE_WIDTH,
  //   borderWidth: 1,
  //   borderRadius: 2,
  //   borderColor: '#ddd',
  //   borderBottomWidth: 0,
  //   shadowColor: 'black',
  //   shadowOffset: {width: 5, height: 10},
  //   shadowOpacity: 12,
  //   shadowRadius: 10,
  // },
  // AutoTags: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   alignItems: 'flex-start',
  // },
  // tags: {
  //   flex: 1,
  //   flexDirection: 'row',
  //   flexWrap: 'wrap',
  //   padding: 4,
  //   backgroundColor: '#FFFF',
  //   borderRadius: 3,
  //   borderColor: '#85B7FE',
  //   borderWidth: 0.6,
  // },
  // tag: {
  //   backgroundColor: 'rgb(244, 244, 244)',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   height: 30,
  //   marginLeft: 5,
  //   borderRadius: 30,
  //   padding: 8,
  // },
  // //This is Add contact style
  // inputContainerStyle: {
  //   flex: 1,
  //   width: '100%',
  //   flexDirection: 'column',
  //   flexWrap: 'nowrap',
  //   paddingLeft: 4,
  //   paddingRight: 4,
  //   backgroundColor: '#FFFF',
  //   // borderRadius: 2,
  //   borderColor: 'transparent',
  //   // borderWidth: 2,
  //   borderTopLeftRadius: 0,
  //   borderTopRightRadius: 0,
  //   borderBottomLeftRadius: 3,
  //   borderBottomRightRadius: 3,

  //   borderBottomWidth: 1,
  //   borderTopWidth: 0,
  //   borderLeftWidth: 1,
  //   borderRightWidth: 1,
  // },
  // containerStyle: {
  //   minWidth: 200,
  //   maxWidth: 300,
  // },
  // //This is main container style
  tagInputContainer: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    backgroundColor: '#FFFF',
  },
  // //This is render tags style
  renderTagsContainer: {
    flex: 1,
    flexDirection: 'column',
    flexWrap: 'nowrap',
    paddingLeft: 4,
    paddingRight: 4,
    backgroundColor: '#FFFF',

    // borderTopLeftRadius: 5,
    // borderTopRightRadius: 5,
    // borderBottomLeftRadius: 0,
    // borderBottomRightRadius: 0,
    //borderColor: '#85B7FE',
    //borderWidth: 0.8,
    maxHeight: 110,
  },
  // //This is add contact style
  // addContactsContainer: {
  //   flex: 1,
  //   width: '100%',
  //   flexDirection: 'column',
  //   flexWrap: 'nowrap',
  //   padding: 4,
  //   // backgroundColor: '#FFFF',
  //   // borderRadius: 2,
  //   /*    borderColor: '#FFFF',
  //   // borderWidth: 2,

  //   borderTopLeftRadius: 0,
  //   borderTopRightRadius: 0,
  //   borderBottomLeftRadius: 3,
  //   borderBottomRightRadius: 3,

  //   borderBottomWidth: 1,
  //   borderTopWidth: 0,
  //   borderLeftWidth: 1,
  //   borderRightWidth: 1, */
  // },
  emailTextStyle: {
    color: '#9AA0A6',
    fontWeight: '400',
    fontSize: normalize(14),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    top: 2,
  },
  nameTextStyle: {
    fontWeight: '400',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
  },
});

export default AutoTagsView;
