import React from 'react';
import {Text} from 'react-native';
import {View} from 'react-native';
import {BottomUpModal} from './../BottomUpModal';
import {KoraButton} from './../../screens/workspaces/ManageWorkspaces/Invite';
import {FlatList} from 'react-native';
import {StyleSheet} from 'react-native';
import {fontFamily} from '../KoraText';
import {normalize} from '../../utils/helpers';
export let confirmationModalRef = React.createRef();

export const KoraConfirm = {
  confirm: ({
    headerText = 'Are you Sure? Do you really want to delete?',
    subTitle = '',
    options = [
      {text: 'Delete', color: '#DD3646', id: 'delete', textColor: '#FFFFFF'},
      {text: 'Cancel', id: 'cancel', borderColor: '#FFFFFF'},
    ],
    onOptionClick = (optionId) => {},
  }) => {
    confirmationModalRef.current.setState({headerText, options, subTitle});
    confirmationModalRef.current.open({onOptionClick});
  },
};

export class ConfirmationModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      headerText: '',
      subTitle: '',
      options: [],
    };
    this.ref = React.createRef(null);
  }

  onOptionClick = () => {};

  open({onOptionClick}) {
    this.onOptionClick = onOptionClick;
    this.ref.current.open();
  }

  FlatListItemSeparator = ()=> {
    return(
      <View style={styles.seperatorStyle} />
    );
  }
  render() {
    return (
      <BottomUpModal ref={this.ref} height={220}>
        <View style={styles.bottomUpModal1}>
          <Text style={styles.headerText}>{this.state.headerText}</Text>
          {/* <Text>{this.state.subTitle}</Text> */}
          <View style={styles.bottomUpModal2} />
          <FlatList
            bounces={false}
            data={this.state.options}
            renderItem={({item}) => {
              return (
                <KoraButton
                  key={item.id}
                  id={item.id}
                  text={item.text}
                  extraTextStyle={styles.buttonStyle}
                  textColor={item.textColor}
                  backgroundColor={item.color}
                  borderColor={item.borderColor || item.color}
                  onPress={() => {
                    this.ref.current.close();
                    this.onOptionClick(item);
                  }}
                />
              );
            }}
            ItemSeparatorComponent={this.FlatListItemSeparator}
          />
        </View>
      </BottomUpModal>
    );
  }
}

const styles = StyleSheet.create({
  headerText: {
    fontFamily: fontFamily,
    lineHeight: normalize(26),
    fontSize: normalize(16),
    fontWeight: '400',
  },
  bottomUpModal1:{paddingVertical: 28, paddingHorizontal: 16},
  bottomUpModal2:{height: 24},
  buttonStyle:{
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  seperatorStyle:{height: 8},
});
