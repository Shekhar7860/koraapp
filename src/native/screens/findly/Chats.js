import React, {useState, useEffect, useRef} from 'react';
import {KoraChat} from '../../../bot-sdk/chat/KoraChat';
import koraBotclient from '../../utils/kora.botclient';
import {
  renderInputToolbar,
  // renderActions,
  renderComposer,
  renderSend,
  renderSuggestionsView,
  renderBubble,
} from './InputToolbar';
import {RTM_EVENT} from '../../../bot-sdk/rtm/BotClient';
import {
  Image,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Linking,
  Animated,
} from 'react-native';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
import {TemplateType, EMITTER_TYPES} from './views/TemplateType';
import {TypingAnimation} from 'react-native-typing-animation';
import {Icon} from '../../components/Icon/Icon.js';
import {CONTACT_TYPES} from './views/ContactLookupView';
import {LIST_TYPES} from './views/ListTemplate';

import Actions from '../../../bot-sdk/chat/Actions';

import FindlySpeechToText from './FindlySpeechToText';

import TouchableRipple from '../../components/Library/react-native-touch-ripple';

const Chats = (props = {}) => {
  let isHistoryDataReceived = false;
 // let isHistoryCalled = false;
  const sttRef = useRef(null);
  const rippleRef = useRef(null);
  const [text, setText] = useState('');

  const [isHistoryCalled, setHistoryCalled] = useState(false);
  const [isNewSession, setNewSession] = useState(false);
  const [messages, setMessages] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [isTypingIndicator, setTypingIndicator] = useState(false);
  // const [isHistoryCalled, setHistoryCalled] = useState(false);
  // const [isHistoryDataReceived, setHistoryDataReceived] = useState(false);

  useEffect(() => {
    setMessages([]);

    // console.log('From Chats_00000000 ---------->> :', props.speechToText);

    if (props.emitter) {
      props.emitter.addListener(EMITTER_TYPES.HELP_UTTRENCES, (uttrences) => {
        setText(uttrences);
      });
      props.emitter.addListener(
        EMITTER_TYPES.TASK_FULL_PREVIEW_EMITOR,
        (payload, template_type) => {
          onListItemClick(template_type, payload);
        },
      );

      props.emitter.addListener(EMITTER_TYPES.SPEECH_TO_TEXT, (uttrences) => {
        setText(uttrences);
      });
    }

    // observers
    koraBotclient.botClient.on(RTM_EVENT.CONNECTING, () => {});
    koraBotclient.botClient.on(RTM_EVENT.ON_OPEN, () => {});
    koraBotclient.botClient.on(RTM_EVENT.ON_MESSAGE, (data) => {
      onMessage(data);
    });

    koraBotclient.botClient.on(RTM_EVENT.GET_HISTORY, (response, botInfo) => {
      if (!isHistoryDataReceived) {
        console.log('RTM_EVENT.GET_HISTORY called ---------------->>');
        //setHistoryDataReceived(true);
        isHistoryDataReceived = true;
        let messages = getHistoryMessagesList(response, botInfo);
        if (messages) {
          setMessages((prevMessages) =>
            KoraChat.append(prevMessages, messages),
          );
        }
      }
    });

    if (!isHistoryCalled) {
      // setHistoryCalled(true);
      //isHistoryCalled = true;
      setHistoryCalled(true);
      koraBotclient.getBotHistory();
    }

    if (props.speechToText) {
      //  setTimeout(() => {
      console.log('From Chats_1 ---------->> :', props.speechToText);
      onInputTextChanged(props.speechToText);
      // }, 2000);
    }

    return () => {
      koraBotclient.botClient.off(RTM_EVENT.CONNECTING, () => {});
      koraBotclient.botClient.off(RTM_EVENT.ON_OPEN, () => {});
      koraBotclient.botClient.off(RTM_EVENT.ON_MESSAGE, () => {});
      koraBotclient.botClient.off(RTM_EVENT.GET_HISTORY, () => {});
    };
  }, []);

  const getHistoryMessagesList = (response, botInfo) => {
    let msgs = [];
    let index = 0;
    // response.data.messages.map((msg) => {
    for (let i = response.data.messages.length - 1; i >= 0; i--) {
      let msg = response.data.messages[i];
      if (msg && msg.type && msg.type === 'outgoing') {
        let components = msg.components;

        let dataStr = components[0].data.text;
        // console.log("dataStr------------> ", dataStr);
        try {
          if (dataStr) {
            let outer = JSON.parse(dataStr);
            if (
              !(
                outer.payload &&
                outer.payload.template_type &&
                (outer.payload.template_type === 'kora_summary_help' ||
                  outer.payload.template_type === 'hidden_dialog')
              )
            ) {
              let response_type = 'bot_response';
              let from = 'bot';
              let botMsg = buildBotMessage(
                outer,
                msg.botId,
                botInfo.name,
                msg.createdOn,
                msg._id,
                botInfo,
                'template',
                response_type,
                from,
              );

              if (botMsg) msgs[index++] = botMsg;
              //onMessage(botMsg, true);
            }
          }
        } catch (e) {
          let response_type = 'bot_response';
          let from = 'bot';
          let botMsg = buildBotMessage(
            {text: dataStr},
            msg.botId,
            botInfo.name,
            msg.createdOn,
            msg._id,
            botInfo,
            null,
            response_type,
            from,
          );

          if (botMsg) msgs[index++] = botMsg;
          // onMessage(botMsg, true);
        }
      } else {
        let components = msg.components;
        let dataStr = components[0].data.text;
        let botMsg = getUserBotResponse(dataStr); //buildBotMessage(dataStr, msg.botId, botInfo.name, msg.createdOn, msg._id, botInfo, null, response_type, from);

        if (botMsg) msgs[index++] = botMsg;
        //onMessage(botMsg, true);
      }
    }

    return msgs;
  };
  const getUserBotResponse = (message) => {
    // console.warn('response_type --------------> user_message');
    let id = getItemId();
    return {
      type: 'user_message',
      itemId: id,
      message: [
        {
          type: 'text',
          component: {
            type: 'text',
            payload: {
              text: message,
            },
          },
          cInfo: {
            body: message,
          },
          clientMessageId: id,
        },
      ],
    };
  };

  const buildBotMessage = (
    pOuter,
    streamId,
    botName,
    createdOn,
    msgId,
    botInfo,
    type = 'template',
    response_type,
    from,
  ) => {
    if (from === 'self') {
      return getUserBotResponse(pOuter);
    }
    // console.warn('response_type --------------> ', response_type);
    let botResponse = {
      type: response_type,
      from: from,
      createdOn: createdOn,
      botInfo: botInfo,
    };

    if (msgId != null) {
      botResponse = {
        ...botResponse,
        messageId: msgId,
      };

      let cModel = {
        type: type,
        payload: pOuter,
      };

      let botResponseMessage = {
        type: 'text',
        component: cModel,
      };
      let message = [];
      message[0] = botResponseMessage;
      let itemId = getItemId();
      botResponse = {
        ...botResponse,
        message: message,
        type: response_type,
        from: from,
        itemId: itemId,
      };
      // console.warn("start------------> ");
      // console.warn("botResponse ------------> ", JSON.stringify(botResponse));
      // console.warn("end -----------------------------> ");
      return botResponse;
    }
  };

  const onSend = (message = []) => {
    //koraBotclient.getBotHistory();
    stopSTT();
    setTypingIndicator(true);
    var messageData = koraBotclient.sendMessage(message);
    processMessage(messageData);
  };

  const onInputTextChanged = (data) => {
    setText(data);
    stopSTT();
  };

  const stopSTT = () =>{
    if(sttRef?.current){
      sttRef?.current?.hideModal();
    }
  }

  const onMessage = (messageData, isJsonObj = false) => {
    if (!messageData) {
      return;
    }
    var data = null;

    if (!isJsonObj) {
      data = JSON.parse(messageData);
    } else {
      data = messageData;
    }

    switch (data.type) {
      case 'bot_response': {
        if (data.from === 'bot') {
          setTypingIndicator(false);
          processMessage(data);
          setQuickReplies([]);
          const quickReplies = isQuickReplies(data);
          if (quickReplies) {
            setQuickReplies(quickReplies);
          }
          // } else {
          //   if (isHiddeDialog(data)) {
          //     if (props.onHiddenDialog) {
          //       props.onHiddenDialog();
          //     }
          //   }
          // }
        }
        break;
      }
      case 'user_message': {
        if (data.from === 'self') {
          setQuickReplies([]);
          var message = data.message;
          if (message) {
            var messageData = {
              type: 'user_message',
              message: [
                {
                  type: 'text',
                  component: {
                    type: 'text',
                    payload: {
                      text: message.body,
                    },
                  },
                  cInfo: {
                    body: message.body,
                  },
                  clientMessageId: data.id,
                },
              ],
            };
            processMessage(messageData);
          }
        }
        break;
      }
      case 'ack': {
        break;
      }
      case 'pong': {
        break;
      }
      default: {
        break;
      }
    }
  };

  const getItemId = (pattern) => {
    var _pattern = pattern || 'xyxxyxxy';
    _pattern = _pattern.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
    return _pattern;
  };

  const isQuickReplies = (data) => {
    if (
      data &&
      data.message &&
      data.message[0] &&
      data.message[0].component &&
      data.message[0].component.type === 'template' &&
      data.message[0].component.payload &&
      data.message[0].component.payload.payload &&
      data.message[0].component.payload.payload.template_type &&
      data.message[0].component.payload.payload.template_type ===
        TemplateType.QUICK_REPLIES
    ) {
      return data.message[0].component.payload.payload.quick_replies;
    }
    return null;
  };
  const isHiddeDialog = (data) => {
    if (
      data &&
      data.message &&
      data.message[0] &&
      data.message[0].component &&
      data.message[0].component.type === 'template' &&
      data.message[0].component.payload &&
      data.message[0].component.payload.payload &&
      data.message[0].component.payload.payload.template_type &&
      data.message[0].component.payload.payload.template_type ===
        TemplateType.HIDDEN_DIALOG
    ) {
      return true;
    }
    return false;
  };

  const processMessage = (newMessages) => {
    let modifiedMessages = null;
    const itemId = getItemId();
    modifiedMessages = {
      ...newMessages,
      itemId: itemId,
    };
    if (isNewSession) {
      setMessages([]);
      setNewSession(false);
    }
    setMessages((prevMessages) =>
      KoraChat.append(prevMessages, modifiedMessages),
    );
  };

  return (
    <KoraChat
      {...props}
      messages={messages}
      text={text}
      onInputTextChanged={onInputTextChanged}
      onSend={onSend}
      alignTop
      alwaysShowSend
      scrollToBottom
      bottomOffset={5}
      renderInputToolbar={renderInputToolbar}
      renderActions={renderActionsNew}
      renderComposer={renderComposer}
      renderSend={renderSend}
      //Suggestions={getSuggestions(props)}
      renderSuggestionsView={renderSuggestionsView}
      renderBubble={renderBubble}
      renderQuickRepliesView={renderQuickRepliesView}
      renderSpeechToText={renderSpeechToText}
      clickSpeechToText={clickSpeechToText}
      quickReplies={quickReplies}
      //isTypingIndicator={isTypingIndicator}
      onViewMoreClick={onViewMoreClick}
      onListItemClick={onListItemClick}
      onFormAction={onFormAction}
      onHiddenDialog={onHiddenDialog}
      //renderTypingIndicator={renderTypingIndicator}
      // minComposerHeight={0}
      //renderChatFooter={renderChatFooter}

      parsePatterns={(linkStyle) => [
        {
          pattern: /#(\w+)/,
          style: linkStyle,
          onPress: (tag) => console.log(`Pressed on hashtag: ${tag}`),
        },
      ]}
    />
  );

  // template events
  function onHiddenDialog(template_type, payload) {
    // if (!isNewSession) {
    setNewSession(true);
    // if (props.onHiddenDialog) {
    //   props.onHiddenDialog();
    // }
    //}
  }

  function onFormAction(template_type, payload) {
    // switch (template_type) {
    //   case TemplateType.FORM_ACTIONS:
    //     props.navigation.navigate(ROUTE_NAMES.KORA_FORM_ACTIONS, {
    //       formPayload: payload,
    //       template_type: template_type,
    //       onListItemClick: onListItemClick,
    //       callGoBack: callGoBack,
    //     });
    //     break;
    //   default:
    //     break;
    // }
  }
  function onListItemClick(template_type, item) {
    console.log('onListItemClick TemplateType ----------->: ', template_type);
    switch (template_type) {
      case TemplateType.CALENDAR_EVENTS:
        if (item && item.htmlLink) {
          Linking.openURL(item.htmlLink);
        }
        break;
      case TemplateType.CANCEL_CALENDAR_EVENTS:
        let _params = {
          meetingId: item.default_action.payload,
        };
        // onSend(item.default_action.payload);
        setTypingIndicator(true);
        var messageData = koraBotclient.sendMessage(
          item.chosenDate,
          _params,
          'cancel_meeting',
        );
        processMessage(messageData);
        break;
      case TemplateType.PICK_SLOT_TEMPLATE:
        switch (item.selectionType) {
          case 'slot':
            if (item.selectedSlot) {
              onSend(item.selectedSlot);
            }
            break;
          case 'other_options':
            onSend('Other options');
            break;
          case 'propose_times':
            if (item.payload) {
              onSend(item.payload);
            }
            break;
        }

        break;
      case TemplateType.TASK_LIST_FULL_PREVIEW:
        // {"button": {"action": "TASK_COMPLETE", "payload": "Close all selected tasks", "title": "Complete", "type": "USERINTENT"}, "taskIds": ["kt-146ef9df-4472-546d-891a-a699b7426e9e-0"], "template_type": "task_list_full_preview"}

        let action = item.button.action;
        let taskList = item.taskList;
        let tids = item.tids;
        let msg = null;

        const parmaMessage = {
          ids: tids,
        };

        if (action === 'TASK_COMPLETE') {
          if (taskList.length === 1) {
            msg = 'Complete task - ' + taskList[0].title;
          } else {
            msg = 'Complete selected tasks';
          }
        } else if (action === 'TASK_CHANGE_DUE_DATE') {
          if (taskList.length === 1) {
            msg = 'Change due date of task - ' + taskList[0].title;
          } else {
            msg = 'Change due date of the selected tasks';
          }
        } else if (action === 'TASK_CHANGE_ASSIGNEE') {
          msg = item.button.payload;
        }

        if (msg !== null) {
          setTypingIndicator(true);
          var messageData = koraBotclient.sendMessage(
            msg,
            parmaMessage,
            'task_updation',
          );
          processMessage(messageData);
        }

        break;
      case TemplateType.FORM_ACTIONS:
        switch (item.selectionType) {
          case 'slot':
            if (item.selectedSlot) {
              onSend(item.selectedSlot);
            }
            break;
        }

        break;

      case TemplateType.BUTTON:
        onSend(item.payload);
        break;
      case TemplateType.QUICK_REPLIES:
        onSend(item.postback);
        break;
      case TemplateType.KORA_CONTACT_LOOKUP:
        switch (item.content_type) {
          case CONTACT_TYPES.phone:
            Linking.openURL('tel:${' + item.value + '}');
            break;
          case CONTACT_TYPES.email:
            Linking.openURL('mailto:' + item.value);
            break;
          case CONTACT_TYPES.address:
            Linking.openURL(
              'https://www.google.com/maps/search/?api=1&query=' + item.value,
            );
            break;
        }

        break;
      case TemplateType.KORA_SEARCH_CAROUSEL:
        if (item.buttons && item.buttons.length > 0) {
          let button = item.buttons[0];
          if (button && button.action && button.action === 'EMAIL_REDIRECT') {
            let url = button?.customData?.redirectUrl?.mob;
            if (url) {
              Linking.openURL(url);
            }
          }
        }
        break;
      case TemplateType.FILES_SEARCH_CAROUSEL:
        if (
          item &&
          item.buttons &&
          item.buttons[0]?.customData?.redirectUrl?.mob
        ) {
          let url = item.buttons[0]?.customData?.redirectUrl?.mob;
          Linking.canOpenURL(url).then((supported) => {
            if (!supported) {
              console.log('No handler for URL:', url);
            } else {
              Linking.openURL(url);
            }
          });
        }
        break;
      case TemplateType.SESSION_EXPIRED:
        break;
      case TemplateType.SUMMARY_HELP:
        break;
      case TemplateType.KORA_WELCOME_SUMMARY:
        if (item?.payload) {
          if (item?.payload === 'open_bell_notifications') {
            props.navigation.navigate(ROUTE_NAMES.KORA_NOTIFICATIONS, {
              callGoBack: () => {
                props.navigation.goBack();
              },
            });
          } else {
            onSend(item?.payload);
          }
        }
        break;
      case TemplateType.LIST:
        switch (item.default_action.type) {
          case LIST_TYPES.web_url:
            let url = item.default_action.url;
            // console.log('Url --------->:', url);
            if (url) {
              Linking.openURL(item.default_action.url);
            }
            break;
        }

        break;
      case TemplateType.CAROUSEL:
        console.log('TemplateType.CAROUSEL Item --------->:', item);

        break;
      default:
        break;
    }
  }

  function onViewMoreClick(template_type, payload) {
    switch (template_type) {
      case TemplateType.CALENDAR_EVENTS:
      case TemplateType.CANCEL_CALENDAR_EVENTS:
        props.navigation.navigate(ROUTE_NAMES.KORA_VIEW_MORE, {
          listPayload: payload,
          template_type: template_type,
          onListItemClick: onListItemClick,
          callGoBack: callGoBack,
        });
        break;
      case TemplateType.PICK_SLOT_TEMPLATE:
        props.navigation.navigate(ROUTE_NAMES.KORA_FORM_ACTIONS, {
          listPayload: payload,
          template_type: template_type,
          onListItemClick: onListItemClick,
          callGoBack: callGoBack,
        });
        break;
      case TemplateType.TASK_LIST_FULL_PREVIEW:
        if (props.headerMode) {
          props.headerMode(0);
        }
        props.navigation.navigate(ROUTE_NAMES.KORA_TASKS_VIEW_MORE, {
          tasksPayload: payload,
          template_type: template_type,
          onListItemClick: onListItemClick,
          callGoBack: callGoBack,
        });
        break;

      case TemplateType.KORA_SEARCH_CAROUSEL:
        props.navigation.navigate(ROUTE_NAMES.KORA_EMAILS_VIEW_MORE, {
          emailsPayload: payload,
          template_type: template_type,
          onListItemClick: onListItemClick,
          callGoBack: callGoBack,
        });
        break;

      case TemplateType.FILES_SEARCH_CAROUSEL:
        props.navigation.navigate(ROUTE_NAMES.FILES_SEARCH_VIEW_MORE, {
          filesPayload: payload,
          template_type: template_type,
          onListItemClick: onListItemClick,
          callGoBack: callGoBack,
        });
        break;

      case TemplateType.ARTICLES_KORA_CAROUSEL:
        props.navigation.navigate(ROUTE_NAMES.ARTICLES_VIEWMORE, {
          aticlesPayload: payload,
          template_type: template_type,
          onListItemClick: onListItemClick,
          callGoBack: callGoBack,
        });
        break;
      case TemplateType.ANNOUNCEMENT_CAROUSEL:
        props.navigation.navigate(ROUTE_NAMES.ANNOUNCEMENT_VIEWMORE, {
          announcementsPayload: payload,
          template_type: template_type,
          onListItemClick: onListItemClick,
          callGoBack: callGoBack,
        });
        break;
      case TemplateType.LIST:
        console.log('TemplateType clicked on ----------->: ', template_type);
        props.navigation.navigate(ROUTE_NAMES.LIST_VIEW_MORE, {
          listPayload: payload,
          template_type: template_type,
          callGoBack: callGoBack,
          onListItemClick: onListItemClick,
        });
        break;

      default:
        console.log('TemplateType ----------->: ', template_type);
        break;
    }
  }

  function callGoBack() {
    props.navigation.goBack();
  }

  function renderTypingIndicator(props) {
    // return <View style={{ backgroundColor: 'red' }} ><Text>Typing...</Text></View>

    if (!props || !props.isTypingIndicator) {
      return null;
    }

    // if (props.isTypingIndicator) {
    return (
      <View style={{marginStart: 15, flexDirection: 'row'}}>
        <View>
          <Icon name={'findly'} size={20} color="black" />
        </View>
        <TypingAnimation
          // style={{ height: 10, width: 50, marginBottom: 2, backgroundColor: 'red' }} //transparent
          dotStyles={{backgroundColor: 'black'}}
          dotColor="black"
          dotMargin={5}
          dotAmplitude={2}
          dotSpeed={0.4}
          dotRadius={2}
          //dotX={24}
          // dotY={60}
        />
      </View>
    );
    // }
    // return null;
  }

  function clickSpeechToText(props) {
    if (sttRef?.current) {
     // console.log('=========>> clickSpeechToText <<============== :', sttRef);
      sttRef?.current?.hideModal();
    }
  }

  function renderActionsNew(props) {

    return(

      <TouchableOpacity
      
      onPress = {()=>{
        if (sttRef?.current) {
          // console.log('=========>> clickSpeechToText <<============== :', sttRef);
           sttRef?.current?.onClick();
         }
      }}
      >

     
      <View
       style={{flex: 1, justifyContent: 'center',width: 44,
      height: 44,
      alignItems: 'center',}} >
      
        
      <TouchableRipple
          ref={rippleRef}
          rippleSequential={false}
          rippleCentered={true}
          rippleSize={50}
          rippleDuration={3000}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            position: 'absolute',
            //backgroundColor:'green'
          }}
          // rippleColor="#E7F1FF"
          rippleColor= "#0D6EFD"//"#C9DBF5" //"#DAE9FF"//"#E7F1FF"
          rippleOpacity={1}
          rippleContainerBorderRadius={100}
          //onPressOut={this._startRecognizing}
          // onPress={() => {
          //   this.setState({isHidden: true});
          // }}
        ></TouchableRipple>
 
        <Image
          style={{width: getImageHeight(), height: getImageHeight()}}
          source={require('../../assets/tabs/findly.png')}
        />

      </View>
   
      </TouchableOpacity>
    );
  }

  function getImageHeight(){
    if(sttRef?.current && sttRef?.current?.isRunning()){
      return 22;
    }

    return 28;
  }

  function renderActionsNew_old(props) {
    return (
      <Actions
        {...props}
        containerStyle={{
          width: 50,
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: 4,
          marginRight: 0,
          marginBottom: 0,
          //backgroundColor:'green'
        }}
        onLongPressActionButton={() => {
          if (props.clickSpeechToText) {
            props.clickSpeechToText();
          }
          // console.log('****** >> Now Long pressclicked findly icon << ********');
        }}
        onPressActionButton={() => {
          if (props.clickSpeechToText) {
            props.clickSpeechToText();
          }
          //console.log('----> Now clicked findly icon <-------');
        }}
        icon={() => (
 
          <View style={{flex: 1, justifyContent: 'center',width: 44,
          height: 44,
          alignItems: 'center',}} >
          
            
          <TouchableRipple
              ref={rippleRef}
              rippleSequential={false}
              rippleCentered={true}
              rippleSize={50}
              rippleDuration={3000}
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                height: '100%',
                position: 'absolute',
                //backgroundColor:'green'
              }}
              // rippleColor="#E7F1FF"
              rippleColor= "#0D6EFD"//"#C9DBF5" //"#DAE9FF"//"#E7F1FF"
              rippleOpacity={1}
              rippleContainerBorderRadius={100}
              //onPressOut={this._startRecognizing}
              // onPress={() => {
              //   this.setState({isHidden: true});
              // }}
            ></TouchableRipple>
     
            <Image
              style={{width: 28, height: 28}}
              source={require('../../assets/tabs/findly.png')}
            />
   
          </View>
       
       
       )}
      />
    );
  }

  function renderSpeechToText(props) {
    if (props) {
      return (
        <FindlySpeechToText
          ref={sttRef}
          isFromFindly={true}
          rippleClick={(value) => {
            
            setTimeout(()=>{
              if(rippleRef?.current){
                rippleRef?.current?.onPress();
                console.log('value --->', value);
              }
            },500);
            
          }}
          callback={(result) => {
            speechToText = result[0];
            console.log('From Findly Chats ---------->> :', speechToText);
            setText(speechToText);
            // dispatch(
            //   setSpeachToText({
            //     speechToText: speechToText,
            //   }),
            // );
            // navigation.navigate(ROUTE_NAMES.FINDLY, {
            //   speechToText: speechToText,
            // });
          }}
        />
      );
    }
    return null;
  }

  function renderQuickRepliesView(props) {
    if (!props || !props.quickReplies) {
      return null;
    }

    const views = props.quickReplies.map((item) => {
      return (
        <TouchableOpacity
          style={{
            marginLeft: 12,
            marginBottom: 3,
            marginTop: 3,
            justifyContent: 'flex-start',
            flexDirection: 'row',
          }}
          onPress={() => {
            setTypingIndicator(true);
            var messageData = koraBotclient.sendMessage(item.payload);
            processMessage(messageData);
            setQuickReplies([]);
          }}>
          <Text
            style={{
              fontStyle: 'normal',
              fontWeight: '300',
              fontSize: 14,

              backgroundColor: '#E4E5E7',
              marginBottom: 3,
              marginTop: 5,
              flexWrap: 'wrap',
              marginLeft: 0,
              padding: 7,
              borderRadius: 5,
              color: '#343335',
              fontFamily: 'Inter',
            }}>
            {item.title}
          </Text>
        </TouchableOpacity>
      );
    });
    return (
      <View
        keyboardShouldPersistTaps="always"
        style={{
          backgroundColor: '#00000000',
          flexDirection: 'column',
          flex: 1,
          alignItems: 'flex-end',
        }}>
        <ScrollView
          style={{backgroundColor: '#00000000'}}
          keyboardShouldPersistTaps="always"
          horizontal={true}>
          <View style={{flexDirection: 'row'}}>{views}</View>
        </ScrollView>
      </View>
    );
  }
};

function getSuggestions(props) {
  let Suggestions = [];
  if (!props || !props.thunderBoltResp) {
    return Suggestions;
  }
  let thunderBoltResp = props.thunderBoltResp;

  if (
    thunderBoltResp &&
    thunderBoltResp.thunderboltRecents &&
    thunderBoltResp.thunderboltRecents.utterances.length
  ) {
    Suggestions = thunderBoltResp.thunderboltRecents.utterances;
  }
  return Suggestions;
}

export default Chats;
