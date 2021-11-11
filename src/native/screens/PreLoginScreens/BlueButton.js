import React from 'react'
import { View, StyleSheet, TextInput, Text, TouchableOpacity } from 'react-native'
import { normalize } from '../../utils/helpers';



class BlueButton extends React.Component {



    navigateTo = () => {
        if (this.props.buttonOnPress) {
            this.props.buttonOnPress(this.props?.id)
        }
    }

    render() {
        return (
            <TouchableOpacity style={styles.buttonStyle} onPress={this.navigateTo}>
                <Text style={styles.textStyle}>{this.props.name}</Text>
            </TouchableOpacity>
        );

    }
}
const styles = StyleSheet.create({
    buttonStyle: { marginTop: 20, width: '100%', backgroundColor: "#0D6EFD", minHeight: normalize(44), borderRadius: 4, justifyContent: 'center' },
    textStyle: {
        fontWeight: '500',
        paddingHorizontal:20,
        fontStyle: 'normal', fontSize: normalize(16), color: "#FFFFFF", justifyContent: 'center', textAlign: 'center', textAlignVertical: 'center'
    },
});

export default BlueButton;