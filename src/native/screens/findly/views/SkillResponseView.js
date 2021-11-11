import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../../../components/KoraText';
import ParentView from './ParentView';

import {normalize} from '../../../../native/utils/helpers';
import * as Constants from '../../../components/KoraText';
import {BORDER} from './TemplateType';

class SkillResponseView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.skillResponsePayload;
    this.template_type = this.props.template_type;

    this.setState({
      payload: payload,
    });
  }

  render() {
    return this.state.payload ? (
      <View style={styles.main_container}>
        <Text style={styles.text}>{this.state.payload.text}</Text>
      </View>
    ) : null;
  }
}
const styles = StyleSheet.create({
  text: {
    fontSize: BORDER.TEXT_SIZE,
    color: BORDER.TEXT_COLOR,
    fontFamily: Constants.fontFamily,
  },
  main_container: {
    padding: 10,
    marginTop: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },
});
export default SkillResponseView;
