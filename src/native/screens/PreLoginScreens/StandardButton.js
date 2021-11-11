import React from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native'
import { normalize } from '../../utils/helpers';

import * as Constants from '../../components/KoraText';
class StandardButton extends React.Component {

    onPress = () => {
        if (this.props.buttonOnPress) {
            this.props.buttonOnPress(this.props?.id)
        }
    }
    render() {
        return (
            <TouchableOpacity
                style={this.props.style}
                onPress={this.onPress}
            >
                <View style={styles.root}>
                    <Image
                        style={styles.imageStyle}
                        source={this.props.imagePath}
                        resizeMode='contain'
                    />
                    <Text style={styles.button_text}>{this.props.buttonName}</Text>
                </View>
            </TouchableOpacity>

        );
    }

}
const styles = StyleSheet.create({
    root: { minHeight: 44, alignItems: 'center', backgroundColor: "#FFFFFF", flexDirection: 'row', padding: 10, borderWidth: 1, borderRadius: 4, borderColor: '#BDC1C6' },
    imageStyle: { width: 20, height: 20, marginStart: 2 },
    button_text: {
        marginStart: 12,
        fontSize: normalize(16),
        color: '#202124',
        fontWeight: '400',
        padding: 0,
        fontStyle: 'normal',
        textAlignVertical: 'center',
        fontFamily: Constants.fontFamily,
    }

});
export default StandardButton;