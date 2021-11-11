import React from 'react';
import {View, TouchableOpacity, StyleSheet, processColor} from 'react-native';
import {Text} from '../../../components/KoraText';
import {FlatList} from 'react-native';
import {format} from 'date-fns';
import moment from 'moment';
import ParentView from './ParentView';

import {normalize} from '../../../utils/helpers';
import * as Constants from '../../../components/KoraText';
import {LineChart} from 'react-native-charts-wrapper';
import ParsedTextView from './ParsedTextView';

import {BORDER} from './TemplateType';
import BotText from '../views/BotText';

class LineChartView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);

    this.state = {
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.lineChartPayload;
    this.template_type = this.props.template_type;
    this.setState({
      payload: payload,
    });
  }

  renderLineChart(payload) {
    let data = {
      dataSets: payload?.elements?.map((element, i) => {
        return {
          values: element.values.map((value, index) => {
            return {x: index, y: value};
          }),
          label: element.title,
        };
      }),
    };

    let marker = {
      enabled: true,
      digits: 4,
      backgroundTint: processColor('teal'),
      markerColor: processColor('#F0C0FF8C'),
      textColor: processColor('white'),
    };
    let xAxis = {
      granularityEnabled: true,
      granularity: 1,
    };

    return (
      <View style={styles.container}>
        <LineChart
          style={styles.chart}
          data={data}
          chartDescription={{text: ''}}
          // legend={this.state.legend}
          marker={marker}
          xAxis={xAxis}
          drawGridBackground={false}
          borderColor={processColor('teal')}
          borderWidth={1}
          drawBorders={true}
          autoScaleMinMaxEnabled={false}
          touchEnabled={true}
          dragEnabled={true}
          scaleEnabled={true}
          scaleXEnabled={true}
          scaleYEnabled={true}
          pinchZoom={true}
          doubleTapToZoomEnabled={true}
          highlightPerTapEnabled={true}
          highlightPerDragEnabled={false}
          // visibleRange={this.state.visibleRange}
          dragDecelerationEnabled={true}
          dragDecelerationFrictionCoef={0.99}
          ref="chart"
          keepPositionOnRotation={false}
          //onSelect={this.handleSelect.bind(this)}
          // onChange={(event) => console.log(event.nativeEvent)}
        />
      </View>
    );
  }

  render() {
    return this.state.payload ? (
      <View style={{}}>
        <BotText text={this.state?.payload?.text} />

        {this.renderLineChart(this.state.payload)}
      </View>
    ) : null;
  }
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    flex: 1,
    padding: 5,
    backgroundColor: '#F5FCFF',
    width: '100%',
    height: 220,
    marginBottom: 5,
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },
  chart: {
    flex: 1,
  },
});

export default LineChartView;
