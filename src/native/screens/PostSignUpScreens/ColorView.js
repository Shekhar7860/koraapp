import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { normalize } from '../../utils/helpers';
import * as Constants from '../../components/KoraText';
import { Icon } from '../../components/Icon/Icon.js';
class ColorView extends React.Component {

    render() {
        let color = this.props.selectedColor
        return (
            <View style={[styles.roundShapeDot, { borderStyle: 'dashed', borderColor: this.props.color, borderWidth: color === this.props.color ? 1.5 : 0, }]}>
                <View style={[styles.roundShape, { backgroundColor: this.props.color, margin: 2 }]}>
                    {color === this.props.color &&
                        <Icon color={'white'} name="kr-tick" size={36} />}
                </View>
            </View>
        )
    }


}

const styles = StyleSheet.create({
    roundShapeDot: {
        width: 70,
        height: 70,
        borderRadius: 35,
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',



    },
    roundShape: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "blue",
        alignItems: 'center',
        justifyContent: 'center'


    },

    viewAvatar: { width: '100%', alignItems: 'center', marginTop: 50 },

    avatarText: {
        color: "#FFFFFF", padding: 0, alignSelf: 'center', textAlign: 'center',
        fontWeight: '200',
        fontSize: normalize(60),
        fontStyle: 'normal',
        textAlignVertical: 'center',
        alignSelf: 'center',
        fontFamily: Constants.fontFamily,
    },
    root: { flex: 1, },
})
export default ColorView;