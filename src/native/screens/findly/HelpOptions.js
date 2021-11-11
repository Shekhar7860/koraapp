import React from 'react';
import {
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  StyleSheet,
} from 'react-native';
import {FlatList} from 'react-native';
import * as Constants from '../../components/KoraText';
import {Icon} from '../../components/Icon/Icon.js';
import {BottomUpModal} from '../../components/BottomUpModal';
import {normalize} from '../../utils/helpers';
class HelpOptions extends React.Component {
  state = {
    helpObj: null,
    helpResourceObj: null,
  };

  componentDidUpdate() {
    this.helpObj = this.props.helpObj;
  }

  openHelp() {
    if (this.refs.helpOptions) {
      this.refs.helpOptions.openBottomDrawer();
    }
  }

  renderHelpOptions() {
    if (this.helpObj && this.helpObj.resources) {
      this.helpObj.resources = this.helpObj.resources.map((item) => {
        let flag =
          this.state.helpResourceObj &&
          this.state.helpResourceObj.id === item.id
            ? true
            : false;
        return {
          ...item,
          isSelected: flag,
        };
      });
    }
    return (
      <BottomUpModal ref="helpOptions" height={500}>
        <View
          style={{
            padding: 6,
          }}></View>
        <View
          style={{
            padding: 6,
          }}>
          <Text style={styles.titleTextStyle}>
            {this.helpObj ? this.helpObj.title : ''}
          </Text>
        </View>
        {this.helpObj && this.HeaderView(this.helpObj.resources)}
      </BottomUpModal>
    );
  }

  HeaderView = (resources) => {
    if (!this.state.helpResourceObj && resources && resources.length > 0) {
      this.setState({
        helpResourceObj: resources[0],
      });
    }

    const views = resources.map((item) => {
      return (
        <TouchableOpacity
          key={item.id}
          style={{
            marginLeft: 12,
            marginBottom: 3,
            marginTop: 3,
            justifyContent: 'flex-start',
            flexDirection: 'row',
          }}
          onPress={() => {
            this.setState({
              helpResourceObj: item,
            });
          }}>
          <View
            style={{
              backgroundColor: item.isSelected ? '#0D6EFD' : '#EFF0F1',
              borderRadius: 5,
              height: 36,
              flexDirection: 'row',
              flex: 1,
              alignItems: 'center',
              marginEnd: 2,
              padding: 10,
            }}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                height: 24,
                width: 24,
                margin: 0,
              }}>
              <Icon
                size={16}
                name={this.getIconName(item.id)}
                color={item.isSelected ? 'white' : 'black'}
              />
            </View>
            {/* <Image source={{ uri: item.icon }} style={{ flex: 1, justifyContent: 'center', height: 24, width: 24, resizeMode: 'stretch', margin: 3 }} /> */}
            {/* 'https://colorlib.com/wp/wp-content/uploads/sites/2/wordpress-live-chat-plugins.png' */}
            {item.isSelected && (
              <Text style={styles.itemIdTextStyle}>{item.id}</Text>
            )}
          </View>
        </TouchableOpacity>
      );
    });

    return (
      <View style={{flexDirection: 'column'}}>
        <ScrollView horizontal={true}>
          <View style={{flexDirection: 'row', marginBottom: 8}}>{views}</View>
        </ScrollView>
        <ScrollView>
          <View style={{flexDirection: 'column'}}>
            {this.helpResourceView()}
          </View>
        </ScrollView>
      </View>
    );
  };

  getIconName = (header) => {
    switch (header) {
      case 'recents':
        return 'help_recent';
      case 'meetings':
        return 'help_meetings';
      case 'tasks':
        return 'help_tasks';
      case 'knowledge':
        return 'help-knowledge';
      case 'search':
        return 'help-search';
      default:
        return 'Menu';
    }
  };

  helpResourceView = () => {
    if (this.state.helpResourceObj && this.state.helpResourceObj.filters) {
      return (
        <View style={{flexDirection: 'column', marginBottom: 60}}>
          <FlatList
            data={this.state.helpResourceObj.filters}
            renderItem={this.renderSubTitleViews}
            keyExtractor={(item) => item.id + ''}
          />
          <View style={{width: 80, backgroundColor: 'red'}}></View>
        </View>
      );
    } else {
      return this.state.helpResourceObj && this.state.helpResourceObj.utterances
        ? this.resourceUtterencesViews(
            this.state.helpResourceObj.utterances,
            this.state.helpResourceObj.placeholder,
            true,
          )
        : null;
    }
  };

  renderSubTitleViews = (item) => {
    return (
      <View style={{flexDirection: 'column'}}>
        <Text
          style={styles.itemTitleTextStyle}>
          {item.item.title}
        </Text>
        {this.resourceUtterencesViews(item.item.utterances)}
      </View>
    );
  };

  resourceUtterencesViews = (
    uttrences,
    placeholder = '',
    isOnlyUttrences = false,
  ) => {
    return (
      <View
        style={{
          flexDirection: 'column',
          marginBottom: isOnlyUttrences ? 30 : 0,
        }}>
        {uttrences && uttrences.length > 0 ? (
          <FlatList
            data={uttrences}
            renderItem={this.renderUtterance}
            keyExtractor={(item) => item + ''}
          />
        ) : (
          <Text
            style={styles.placeholderTextStyle}>
            {placeholder}
          </Text>
        )}
      </View>
    );
  };

  renderUtterance = (item) => {
    return (
      <TouchableOpacity
        style={{
          marginLeft: 12,
          marginBottom: 3,
          marginTop: 3,
          justifyContent: 'flex-start',
          flexDirection: 'row',
          marginRight: 12,
        }}
        onPress={() => {
          this.refs.helpOptions.closeBottomDrawer();

          if (this.props.helpUtterencesSet) {
            this.props.helpUtterencesSet(item.item);
          }
        }}>
        <Text
          style={styles.itemTextStyle}>
          "{item.item}"
        </Text>
      </TouchableOpacity>
    );
  };

  render() {
    return <View>{this.renderHelpOptions()}</View>;
  }
}

const styles = StyleSheet.create({
  titleTextStyle: {
    backgroundColor: 'white',
    marginTop: 5,
    flexWrap: 'wrap',
    paddingStart: 7,
    paddingBottom: 3,
    borderRadius: 3,
    color: 'black',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: normalize(16),
    fontFamily: Constants.fontFamily,
  },
  itemIdTextStyle: {
    backgroundColor: '#ffffff00',
    padding: 0,
    flexWrap: 'wrap',
    marginLeft: 5,
    textTransform: 'capitalize',
    color: 'white',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: normalize(14),
    fontFamily: Constants.fontFamily,
  },
  itemTitleTextStyle: {
    fontStyle: 'normal',
    fontWeight: '300',
    fontSize: normalize(14),
    fontFamily: Constants.fontFamily,
    backgroundColor: 'white',
    flexWrap: 'wrap',
    marginLeft: 10,
    padding: 7,
    borderRadius: 3,
    color: 'black',
    textTransform: 'uppercase',
  },
  placeholderTextStyle: {
    fontStyle: 'normal',
    fontWeight: '300',
    fontSize: normalize(14),
    fontFamily: Constants.fontFamily,
    backgroundColor: 'white',
    marginBottom: 10,
    marginLeft: 10,
    padding: 7,
    flexWrap: 'wrap',
    borderRadius: 3,
    color: '#343335',
  },
  itemTextStyle: {
    fontStyle: 'normal',
    fontWeight: '300',
    fontSize: normalize(14),
    fontFamily: Constants.fontFamily,
    backgroundColor: '#EFF0F1',
    marginBottom: 10,
    marginLeft: 0,
    padding: 12,
    flexWrap: 'wrap',
    borderRadius: 10,
    color: 'black',
  },
});

export default HelpOptions;
