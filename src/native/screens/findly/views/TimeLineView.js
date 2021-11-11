import React from 'react';
import {View, Alert, StyleSheet} from 'react-native';
import {Text} from '../../../components/KoraText';
import ParentView from './ParentView';
import * as Constants from '../../../components/KoraText';
import {BORDER} from './TemplateType';

class TimeLineView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.switchPayload;
    this.template_type = this.props.template_type;

    this.setState({
      payload: payload,
    });
  }

  render() {
    return this.state.payload ? (
      <View style={styles.container}>
        <View numberOfLines={1} style={styles.line}></View>
        <Text style={styles.text}> {this.state.payload.text} </Text>
        <View numberOfLines={1} style={styles.line}></View>
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  text: {
    alignSelf: 'center',
    fontSize: BORDER.TEXT_SIZE,
    color: BORDER.TEXT_COLOR,
    fontFamily: Constants.fontFamily,
    textAlign: 'center',
    marginStart: 5,
    marginEnd: 5,
  },
  container: {
    marginBottom: 10,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    height: 1,
    flex: 1,
    alignSelf: 'center',
    backgroundColor: BORDER.COLOR,
    width: '100%',
  },
});

export default TimeLineView;
