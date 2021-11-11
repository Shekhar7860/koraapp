import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Text } from '../../../components/KoraText';
import { Icon } from '../../../components/Icon/Icon.js';
import { FlatList } from 'react-native';
import { format } from 'date-fns';
import moment from 'moment';
import ParentView from './ParentView';
//import ParsedText from 'react-native-parsed-text';
import { FormattedText } from 'react-native-formatted-text';


class ParsedTextView extends ParentView {
    template_type = '';
    constructor(props) {
        super(props);
        this.state = {
            payload: null,
        };
    }

    componentDidMount() {
        const payload = this.props.parsedTextPayload;
        this.template_type = this.props.template_type;


        this.setState({
            payload: payload,
        });
    }

    renderParsedText() {
        if (!this.state.payload?.text || this.state.payload?.text === '') {
            return null;
        }
        let text = this.state.payload.text + " ";
        text = text?.replace('.', '. ');
        const words = text?.split('%%');
        let index = 0;
        let textMatches = [];

        // textMatches[index++] = {
        //     text: 'Hello', style: { color: 'red' }
        // };

        let parsedText = '';
        words?.map((sentance) => {
            if (sentance && sentance.includes('{')) {
                let obj = JSON.parse(sentance);
                parsedText = parsedText + obj.title;
                textMatches[index++] = {
                    text: obj.title, style: {
                        color: 'blue', textDecorationLine: 'underline'
                    },
                    onPress: () => {
                        if (this.props.onListItemClick) {
                            this.props.onListItemClick(this.template_type, obj);
                        } else {
                            console.log("this.props.onListItemClick ----------------------->", this.props.onListItemClick);
                        }
                    }
                };


            } else {
                parsedText = parsedText + sentance;
                textMatches[index++] = {
                    text: sentance, style: { color: 'black' }
                };
            }

        });


        return (
            <FormattedText
                matches={textMatches}
                style={[{
                    flexWrap: 'wrap', flexDirection: 'row',
                    alignItems: 'flex-start',
                    padding: 10,
                    fontSize: 16,
                    backgroundColor: 'white', borderWidth: 0.3, borderColor: '#00485260', borderRadius: 8
                }]}>{parsedText}
            </FormattedText>
        );
    }


    render() {
        return (<View>{this.state.payload && (this.renderParsedText())}</View>);
    }
}

export default ParsedTextView;
