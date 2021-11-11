import React from 'react';
import {
  View,
  Alert,
  StyleSheet
} from 'react-native';
import { Text } from '../../../components/KoraText';
import ParentView from './ParentView';

import { normalize } from '../../../../native/utils/helpers';
import * as Constants from '../../../components/KoraText';
import BotText from '../views/BotText';


import { BORDER } from './TemplateType';



class TablesView extends ParentView {
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
    let flexArry = [];
    return (
      <View style={styles.mainContainer}>

        <BotText text={payload?.text} />


        <View style={styles.subContainer}>
          <View style={styles.subContainer2}>
            {payload.columns.map((coloum, i) => {
              // console.log("coloum.length ----> :", coloum.length.toString());
              flexArry[i] = coloum[0].length;
              return <Text style={[styles.titles, { flex: coloum[0].length, }]}>{coloum[0]}</Text>
            })}
          </View>
          <View style={styles.thick_line} ></View>
          <View style={{ flexDirection: 'column' }}>

            {this.getTableRowViews(payload.elements, flexArry)}

          </View>
        </View>

      </View>

    );
  }


  getTableRowViews = (elements, flexArry = []) => {

    let views = [];

    if (!elements || elements.length === 0) {
      return null;
    }

    for (let i = 0; i < elements.length; i++) {

      let view = (<View style={{ flexDirection: 'column' }}>
        <View style={{ flexDirection: 'row' }}>

          {elements[i].Values.map((value, index) => {
            return <Text style={[{ flex: flexArry[index] }, styles.row_text]}>{value}</Text>
          })}
        </View>
        {(i !== (elements.length - 1)) &&
          <View style={styles.line} ></View>
        }
      </View>);

      views[i] = view;
    }

    return views;



  }



  render() {
    return (
      this.renderTablesView()
    );
  }
}



const styles = StyleSheet.create({
  mainContainer: {
    flexDirection: 'column', backgroundColor: 'white'

  },

  subContainer: { marginTop: 10, flexDirection: 'column', borderRadius: BORDER.RADIUS, borderWidth: BORDER.WIDTH, borderColor: BORDER.COLOR, backgroundColor: 'white' },

  subContainer2: {
    flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center',
  },
  titles: {

    fontSize: BORDER.TEXT_SIZE, color: BORDER.TEXT_COLOR, fontWeight: '500', justifyContent: 'center',
    textAlign: 'center', padding: 10, fontWeight: 'bold', fontFamily: Constants.fontFamily,
  },
  thick_line: { height: 2, opacity: 1, backgroundColor: BORDER.COLOR },
  row_text: { textAlign: 'center', fontSize: BORDER.TEXT_SIZE, color: BORDER.TEXT_COLOR, fontWeight: '500', padding: 10, fontFamily: Constants.fontFamily, },
  line: { width: '100%', height: BORDER.WIDTH, opacity: 0.2, backgroundColor: BORDER.TEXT_COLOR },
});

export default TablesView;