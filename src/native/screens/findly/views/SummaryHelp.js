import React from 'react';
import {
    View,
} from 'react-native';
import { Text } from '../../../components/KoraText';
import { FlatList } from "react-native";
import { TouchableOpacity } from 'react-native';
import ParentView from './ParentView';


class SummaryHelp extends ParentView {
    template_type = '';
    // items = ['Schedule a meeting', 'Set a reminder', 'Create task'];
    constructor(props) {
        super(props);
        this.state = {
            items: [],
        };
    }

    componentDidMount() {
        const items = this.props.items;
        this.template_type = this.props.template_type;

        this.setState({
            items: items,
        });
    }

    getSingleitem = (item, index) => {
        return (

            <TouchableOpacity
                onPress={() => {
                    if (this.props.onListItemClick) {
                        let itemObj = {
                            item: item,
                            index: index,
                        }
                        this.props.onListItemClick(this.template_type, itemObj);
                    }
                }}
            >
                <View style={{ alignSelf: 'baseline', marginTop: 10, padding: 10, backgroundColor: '#EEEEEF', borderRadius: 8, }} >
                    <Text style={{ fontSize: 14, color: '#4841FF', fontWeight: '500' }}>{item}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    getSingleitemForFlatList = (item) => {

        return this.getSingleitem(item.item, item.index);
    }


    renderItems = () => {
        return (
            <FlatList
                data={this.state.items}
                renderItem={this.getSingleitemForFlatList}
                keyExtractor={item => item.index}
            />
        );
    }


    render() {
        return (
            this.state.items ?
                <View style={{ padding: 10 }}>
                    <Text style={{ fontSize: 18, fontWeight: '500' }}>How can i help you?</Text>
                    {this.renderItems()}
                </View> : null
        );
    }
}


export default SummaryHelp;