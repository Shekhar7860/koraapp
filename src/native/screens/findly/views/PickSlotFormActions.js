import React from 'react';
import { View, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Text } from '../../../components/KoraText';
import { FlatList } from 'react-native';
import { format } from 'date-fns';
import moment from 'moment';
import ParentView from './ParentView';
import { TemplateType } from './TemplateType';
import { Icon } from '../../../components/Icon/Icon.js';
import { ScrollView } from 'react-native-gesture-handler';
import { SafeAreaView } from 'react-native-safe-area-context';

class KoraFormActions extends ParentView {
  template_type = '';
  onListItemClick = null;
  callGoBack = null;
  constructor(props) {
    super(props);
    this.state = {
      slots: [],
      payload: null,
    };
  }

  componentDidMount() {
    this.readPayload();
  }

  // componentDidUpdate() {

  //     if (!this.state.payload) {

  //         this.readPayload();

  //     }
  // }

  readPayload = () => {
    const { route } = this.props;
    const payload = route.params.formPayload;

    this.template_type = route.params.template_type;
    this.onListItemClick = route.params.onListItemClick;
    this.callGoBack = route.params.callGoBack;

    if (payload?.form_actions.length > 0) {
      let formActions = payload.form_actions[0];
      let allSlots = formActions?.customData?.all_slots;
      if (allSlots?.length > 0) {
        let slots = allSlots[0].slots;
        this.setState({
          slots: slots,
          payload: payload,
        });
      }
    }
  };

  dateToFromNowDaily = (myDate) => {
    // var fromNow = moment(myDate).fromNow();

    return moment(myDate).calendar(null, {
      lastWeek: '[Last] dddd',
      lastDay: '[Yesterday]',
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      sameElse: function () {
        return Date.parse(format(new Date(myDate), 'dd/MM/yyyy')); //new Date(myDate).toLocaleDateString();
      },
    });
  };

  getDisplayDateTime = (startdate, enddate) => {
    const startStr = this.dateToFromNowDaily(startdate);
    const endStr = this.dateToFromNowDaily(enddate);
    if (startStr === endStr) {
      return (
        startStr +
        ', ' +
        format(startdate, 'hh:mm a') +
        ' to ' +
        format(enddate, 'hh:mm a')
      );
    } else {
      return (
        startStr +
        ', ' +
        format(startdate, 'hh:mm a') +
        ' to ' +
        endStr +
        ', ' +
        format(enddate, 'hh:mm a')
      );
    }
  };

  getSingleSlotViewForFlatList = (item) => {
    return this.getSlotView(item.item, false);
    //return this.getSingleSlotView(item.item);
  };

  getSingleSlotView = (item) => {
    const time = this.getDisplayDateTime(item.start, item.end);
    return (
      <TouchableOpacity
        disabled={this.isViewDisabled()}
        onPress={() => {
          if (this.onListItemClick) {
            item = {
              ...item,
              selectedSlot: time,
              selectionType: 'slot',
            };
            this.onListItemClick(this.template_type, item);
            // if (this.template_type && this.template_type === TemplateType.FORM_ACTIONS) {
            if (this.callGoBack) {
              this.callGoBack();
            }
            //}
          } else {
            // console.log('this.props.onListItemClick =====> ', this.props.onListItemClick);
          }
        }}>
        <View
          style={{
            alignItems: 'center',
            padding: 10,
            marginBottom: 10,
            backgroundColor: 'blue',
            borderWidth: 0.6,
            borderColor: '#00485260',
            borderRadius: 8,
          }}>
          <Text style={{ alignItems: 'center', color: 'white', fontSize: 16 }}>
            {time}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  renderSlotsView = (list) => {
    // console.log("list-----------=============------------->>> :", list);
    return (
      // <View style={{ padding: 10, margin: 10, backgroundColor: 'white', borderWidth: 0.6, borderColor: '#00485260', borderRadius: 8 }}>
      <FlatList
        data={list}
        renderItem={this.getSingleSlotViewForFlatList}
        keyExtractor={(item) => item.index}
      />
      // </View>
    );
  };

  render() {
    let flag = true;
    return (
      <ScrollView>
        <SafeAreaView>
          <View style={styles.containerMain}>
            {flag && (
              <View style={{ padding: 10, flexDirection: 'column' }}>
                <Text
                  style={{
                    color: '#485260',
                    fontSize: 19,
                    marginStart: 15,
                    fontWeight: 'bold',
                    marginEnd: 20,
                  }}>
                  Hey there, Keith wants to set up a meeting with you. Deselect
                  the time slots that you cannot make it to.
                </Text>

                <View
                  style={{
                    flexDirection: 'column',
                    margin: 10,
                    backgroundColor: 'white',
                    borderWidth: 0.6,
                    borderColor: '#00485260',
                    borderRadius: 8,
                  }}>
                  <Text
                    style={{
                      color: '#485260',
                      fontSize: 16,
                      marginStart: 10,
                      marginTop: 15,
                      fontWeight: 'bold',
                    }}>
                    Starting a Fire
                  </Text>

                  <View style={{ marginStart: 8 }}>
                    <View style={{ padding: 5, flexDirection: 'row' }}>
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Icon size={18} name="help_recent" color="#a7b0be" />
                      </View>
                      <Text
                        style={{
                          color: '#485260',
                          fontSize: 13,
                          marginStart: 10,
                          fontWeight: 'bold',
                        }}>
                        {this.getDisplayDateTime(1605623400000, 1605625200000)}
                      </Text>
                    </View>
                    <View style={{ padding: 5, flexDirection: 'row' }}>
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Icon size={18} name="Location" color="#a7b0be" />
                      </View>
                      <Text
                        style={{
                          color: '#485260',
                          fontSize: 13,
                          marginStart: 10,
                          fontWeight: 'bold',
                        }}>
                        Common Room
                      </Text>
                    </View>
                    <View style={{ padding: 5, flexDirection: 'row' }}>
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Icon size={18} name="People" color="#a7b0be" />
                      </View>
                      <Text
                        style={{
                          color: '#485260',
                          fontSize: 13,
                          marginStart: 10,
                          fontWeight: 'bold',
                        }}>
                        Brian, Joyce and Annie
                      </Text>
                    </View>

                    <View style={{ padding: 5, flexDirection: 'row' }}>
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Icon size={18} name="DR_Starred" color="#FFA629" />
                      </View>
                      <Text
                        style={{
                          color: '#FFA629',
                          fontSize: 16,
                          marginStart: 10,
                          fontWeight: '600',
                        }}>
                        Most Popular Slot
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'column',
                      marginBottom: 5,
                      marginTop: 5,
                      padding: 5,
                      backgroundColor: '#EDF1FE',
                      borderWidth: 0.1,
                      borderColor: '#00485260',
                      borderRadius: 2,
                    }}>
                    <View style={{ padding: 8, flexDirection: 'row' }}>
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        {this.RadioButton({ style: { borderColor: 'blue' } }, true)}
                      </View>
                      <Text
                        style={{
                          color: '#485260',
                          fontSize: 13,
                          marginStart: 10,
                          fontWeight: 'bold',
                        }}>
                        {this.getDisplayDateTime(1605623400000, 1605625200000)}
                      </Text>
                    </View>
                  </View>

                  {this.state.payload && (
                    <View style={{ flexDirection: 'column' }}>
                      <Text
                        style={{
                          color: '#485260',
                          fontSize: 13,
                          marginStart: 10,
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}>
                        {this.state.payload.form_actions[0].title}
                      </Text>
                      {this.renderSlotsView(this.state.slots)}
                    </View>
                  )}
                </View>
              </View>
            )}
            <View style={styles.bottomView}>
              <View style={{ flexDirection: 'row', marginTop: 0 }}>
                <TouchableOpacity
                  disabled={this.isViewDisabled()}
                  style={{ flex: 1 }}
                  onPress={() => { }}>
                  <View
                    style={{
                      margin: 5,
                      alignItems: 'center',
                      padding: 10,
                      marginBottom: 10,
                      backgroundColor: 'blue',
                      borderWidth: 0.6,
                      borderColor: '#00485260',
                      borderRadius: 8,
                    }}>
                    <Text
                      style={{
                        alignItems: 'center',
                        color: 'white',
                        fontSize: 16,
                      }}>
                      Confirm
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={{ flex: 1 }} onPress={() => { }}>
                  <View
                    style={{
                      margin: 5,
                      alignItems: 'center',
                      padding: 10,
                      marginBottom: 10,
                      backgroundColor: 'white',
                      borderWidth: 1,
                      borderColor: 'blue',
                      borderRadius: 8,
                    }}>
                    <Text
                      style={{
                        alignItems: 'center',
                        color: 'blue',
                        fontSize: 16,
                      }}>
                      Decline
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    );
  }

  getSlotView = (item, isSelected) => {
    const time = this.getDisplayDateTime(item.start, item.end);
    return (
      <TouchableOpacity
        onPress={() => {
          if (this.onListItemClick) {
            item = {
              ...item,
              selectedSlot: time,
              selectionType: 'slot',
            };
            this.onListItemClick(this.template_type, item);
            // if (this.template_type && this.template_type === TemplateType.FORM_ACTIONS) {
            if (this.callGoBack) {
              this.callGoBack();
            }
            //}
          } else {
            console.log(
              'this.props.onListItemClick =====> ',
              this.props.onListItemClick,
            );
          }
        }}>
        <View
          style={{
            flexDirection: 'column',
            marginBottom: 5,
            marginTop: 5,
            padding: 5,
            backgroundColor: isSelected ? '#EDF1FE' : 'white',
            borderWidth: 0.01,
            borderColor: '#00485260',
            borderRadius: 2,
          }}>
          <View style={{ padding: 8, flexDirection: 'row' }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              {this.RadioButton({ style: { borderColor: 'blue' } }, isSelected)}
            </View>
            <Text
              style={{
                color: '#485260',
                fontSize: 13,
                marginStart: 10,
                fontWeight: 'bold',
              }}>
              {time}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  RadioButton = (props = {}, isSelected = false) => {
    return (
      <View
        style={[
          {
            height: 18,
            width: 18,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isSelected ? 'blue' : '#000',
            alignItems: 'center',
            justifyContent: 'center',
          },
          props.style,
        ]}>
        {isSelected ? (
          <View
            style={{
              height: 8,
              width: 8,
              borderRadius: 6,
              backgroundColor: 'blue',
            }}
          />
        ) : null}
      </View>
    );
  };
}

const styles = StyleSheet.create({
  containerMain: {
    // flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
  },
  bottomView: {
    // width: '100%',
    // height: 20,
    // // backgroundColor: '#EE5407',
    // // justifyContent: 'center',
    // // alignItems: 'center',
    // position: 'absolute', //Here is the trick
    // bottom: 0, //Here is the trick
  },
});

export default KoraFormActions;
