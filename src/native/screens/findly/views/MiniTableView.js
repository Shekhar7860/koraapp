import React from 'react';
import {View, StyleSheet} from 'react-native';
import {Text} from '../../../components/KoraText';
import ParentView from './ParentView';
import * as Constants from '../../../components/KoraText';
import {BORDER} from './TemplateType';

class MiniTablesView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.tablesPayload;
    this.template_type = this.props.template_type;

    this.setState({
      payload: payload,
    });
  }

  renderTablesView = () => {
    const payload = this.state.payload;
    if (!payload) {
      return null;
    }
    const element = payload?.elements[0];
    if (!element) {
      return null;
    }

    return (
      <View style={styles.container}>
        <View style={styles.sub_container}>
          <Text style={styles.primary}>{element?.primary[0]}</Text>
        </View>
        {element.additional?.map((item) => {
          return (
            <View style={styles.aditional_view}>
              <Text style={styles.aditional_text}>{item[0]}</Text>
              <Text style={styles.item_text}>{item[1]}</Text>
            </View>
          );
        })}
      </View>
    );
  };

  render() {
    return this.renderTablesView();
  }
}

const styles = StyleSheet.create({
  item_text: {
    flex: 1,
    fontSize: BORDER.TEXT_SIZE,
    color: BORDER.TEXT_COLOR,
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
  },
  aditional_text: {
    flex: 1,
    fontSize: BORDER.TEXT_SIZE,
    color: BORDER.TEXT_COLOR,
    fontWeight: '400',
    fontFamily: Constants.fontFamily,
  },
  aditional_view: {flexDirection: 'row', marginBottom: 8},
  primary: {
    fontSize: BORDER.TEXT_SIZE,
    color: BORDER.TEXT_COLOR,
    fontWeight: 'bold',
    fontFamily: Constants.fontFamily,
  },
  container: {
    flexDirection: 'column',
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
    padding: 10,
  },
  sub_container: {
    alignSelf: 'baseline',
    paddingTop: 5,
    paddingBottom: 10,
    backgroundColor: 'white',
    borderRadius: 8,
  },
});

export default MiniTablesView;
