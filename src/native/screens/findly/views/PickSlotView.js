import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from '../../../components/KoraText';
import { FlatList } from 'react-native';
import { format } from 'date-fns';
import moment from 'moment';
import ParentView from './ParentView';
import BotText from '../views/BotText';
import { normalize } from '../../../utils/helpers';
import { BORDER } from './TemplateType';




class PickSlotView extends ParentView {
    template_type = '';
    constructor(props) {
        super(props);
        this.state = {
            slots: [],
            isShowOtherOptions: false,
            payload: null,
        };
    }

    componentDidMount() {
        const payload = this.props.pickSlotPayload;
        this.template_type = this.props.template_type;


        let slots = payload.elements[0].quick_slots;

        let isShowOtherOptions = payload.elements[0] && payload.elements[0].working_hours && payload.elements[0].working_hours.length > 0;

        this.setState({
            isShowOtherOptions: isShowOtherOptions,
            slots: slots,
            payload: payload,
        });
    }



    dateToFromNowDaily = (myDate) => {
        if (!myDate) {
            return '';
        }
        // var fromNow = moment(myDate).fromNow();

        return moment(myDate).calendar(null, {
            lastWeek: '[Last] dddd',
            lastDay: '[Yesterday]',
            sameDay: '[Today]',
            nextDay: '[Tomorrow]',
            nextWeek: 'dddd',
            sameElse: function () {
                return format(new Date(myDate), 'dd/MM/yyyy');//new Date(myDate).toLocaleDateString();
            },
        });
    };

    getDisplayDateTime = (startdate, enddate) => {
        const startStr = this.dateToFromNowDaily(startdate);
        const endStr = this.dateToFromNowDaily(enddate);
        if (startStr === endStr) {
            return (
                startStr + ', ' + format(startdate, 'hh:mm a') +
                ' to ' +
                format(enddate, 'hh:mm a')
            );

        } else {
            return (
                startStr + ', ' + format(startdate, 'hh:mm a') +
                ' to ' +
                endStr + ', ' + format(enddate, 'hh:mm a')
            );

        }

    };

    getSingleSlotViewForFlatList = (item) => {
        return this.getSingleSlotView(item.item);
    };

    getSingleSlotView = (item) => {
        const time = this.getDisplayDateTime(item.start, item.end);
        return (
            <TouchableOpacity
                disabled={this.isViewDisabled()}
                onPress={() => {
                    if (this.props.onListItemClick) {
                        item = {
                            ...item,
                            selectedSlot: time,
                            selectionType: 'slot',
                        }
                        this.props.onListItemClick(this.template_type, item);
                    }
                }}
            >
                <View style={styles.item_view}>
                    <Text style={styles.item_text}>{time}</Text>
                </View>
            </TouchableOpacity>
        );

    };

    renderSlotsView = (list) => {
        // console.log("list-----------=============------------->>> :", list);
        return (
            <View style={styles.subContainer}>
                <FlatList
                    data={list}
                    renderItem={this.getSingleSlotViewForFlatList}
                    keyExtractor={item => item.index}
                />
                <View style={styles.bottom_btns} >

                    <TouchableOpacity
                        disabled={this.isViewDisabled()}
                        style={{ flex: 1, }}
                        onPress={() => {

                            if (this.props.onListItemClick) {
                                let item = {
                                    selectionType: 'propose_times',
                                    payload: 'Propose times',
                                }
                                this.props.onListItemClick(this.template_type, item);
                            }

                        }}
                    >
                        <View style={styles.btn_view}>
                            <Text style={styles.btn_text}>Propose times</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={this.isViewDisabled()}
                        style={{ flex: 1 }}
                        onPress={() => {
                            // if (this.props.onListItemClick) {
                            //     let item = {
                            //         selectionType: 'other_options',
                            //     }
                            //     this.props.onListItemClick(this.template_type, item);
                            // }

                            if (this.props.onViewMoreClick) {
                                this.props.onViewMoreClick(
                                    this.template_type,
                                    this.state.payload,
                                );
                            }

                        }}
                    >
                        <View style={styles.btn_view}>
                            <Text style={styles.btn_text}>Other options</Text>
                        </View>
                    </TouchableOpacity>

                </View>

            </View>
        );
    };


    render() {
        return (

            <View>
                {this.state.payload &&
                    <View style={styles.mainContainer}>
                        <View style={{}} >
                            <BotText text={this.state?.payload?.text} />
                        </View>

                        {this.renderSlotsView(this.state?.slots)}
                    </View>}
            </View>

        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        backgroundColor: 'white',
        flexDirection: 'column',
    },

    subContainer: { marginTop: 15, padding: 10, backgroundColor: 'white', borderWidth: BORDER.WIDTH, borderColor: BORDER.COLOR, borderRadius: BORDER.RADIUS },
    bottom_btns: { flexDirection: 'row', marginTop: 0, },
    btn_view: { margin: 8, alignItems: 'center', padding: 8, marginBottom: 10, backgroundColor: 'white', borderWidth: BORDER.WIDTH, borderColor: BORDER.COLOR, borderRadius: BORDER.RADIUS },
    btn_text: { alignItems: 'center', color: 'blue', fontSize: normalize(15), },
    item_view: { marginEnd: 5, marginStart: 5, alignItems: 'center', padding: 8, marginBottom: 12, backgroundColor: 'blue', borderWidth: 0.6, borderColor: '#00485260', borderRadius: 8 },
    item_text: { alignItems: 'center', color: 'white', fontSize: normalize(15), },

});

export default PickSlotView;
