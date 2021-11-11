import React from 'react';
import {
    View,
    Alert
} from 'react-native';
import { Text } from '../../../components/KoraText';
import ParentView from './ParentView';


class SessionExpiredView extends ParentView {
    template_type = '';
    constructor(props) {
        super(props);
        this.state = {
            payload: null,
        };
    }

    componentDidMount() {
        const payload = this.props.sessionPayload;
        this.template_type = this.props.template_type;

        this.setState({
            payload: payload,
        });
    }

    createTwoButtonAlert = () =>
        Alert.alert(
            "Session Expired",
            this.state.payload.text,
            // + '\nTo Continue, Please log in',
            [
                // {
                //     text: "Cancel",
                //     onPress: () => console.log("Cancel Pressed"),
                //     style: "cancel"
                // },
                {
                    text: "OK", onPress: () => {
                        if (this.props.onListItemClick) {
                            let item = {
                                payload: this.state.payload,
                                isOkPressed: true,
                            }
                            this.props.onListItemClick(this.template_type, item);
                        }
                    }
                }
            ],
            { cancelable: false }
        );

    render() {
        return (
            this.state.payload ?
                <View>
                    <Text style={{ alignSelf: 'center', }}>----------------------</Text>
                    <Text>{this.state.payload.text}</Text>
                    <Text style={{ alignSelf: 'center', }}>----------------------</Text>
                    {/* {this.createTwoButtonAlert()} */}
                </View>
                :
                null
        );
    }
}


export default SessionExpiredView;