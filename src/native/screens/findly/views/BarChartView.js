import React from 'react';
import {View, StyleSheet, processColor} from 'react-native';
import {Text} from '../../../components/KoraText';

import ParentView from './ParentView';

import {normalize} from '../../../utils/helpers';
import * as Constants from '../../../components/KoraText';
import {BarChart} from 'react-native-charts-wrapper';
import BotText from '../views/BotText';
import {BORDER} from './TemplateType';

class BarChartView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.barchartPayload;
    this.template_type = this.props.template_type;

    this.setState({
      payload: payload,
    });
  }

  renderBarChartView = (payload) => {
    let legend = {
      enabled: true,
      textSize: 10,
      form: 'SQUARE',
      formSize: normalize(10),
      xEntrySpace: 10,
      yEntrySpace: 50,
      wordWrapEnabled: false,
      spaceTop: 35,
    };

    let data = {
      dataSets: payload.elements.map((element, i) => {
        return {
          values: element.values,
          label: element.title,
          config: {
            drawValues: true,
            colors: [processColor(i === 0 ? 'blue' : 'red')],
          },
        };
      }),

      config: {
        barWidth: 0.18,
        group: {
          fromX: 0,
          groupSpace: 0.4,
          barSpace: 0.05,
        },
      },
    };

    let xAxis = {
      valueFormatter: payload.X_axis,
      granularityEnabled: true,
      granularity: 1,
      axisMaximum: payload.X_axis.lenght,
      axisMinimum: 0,
      centerAxisLabels: true,
      position: 'BOTTOM',
      drawLimitLinesBehindData: false,
      centerAxisLabels: true,
      spaceTop: 35,
      textSize: 8,
    };

    let yAxis = {
      left: {
        spaceTop: 35,
      },
      right: {
        spaceTop: 35,
      },
    };

    let marker = {
      enabled: true,
      markerColor: processColor('#F0C0FF8C'),
      textColor: processColor('white'),
      markerFontSize: normalize(10),
    };
    return (
      <View style={styles.container}>
        <BarChart
          pinchZoom={false}
          touchEnabled={true}
          drawBarShadow={false}
          drawGridBackground={false}
          style={styles.chart}
          xAxis={xAxis}
          yAxis={yAxis}
          data={data}
          legend={legend}
          drawValueAboveBar={true}
          maxVisibleValueCount={60}
          // onSelect={this.handleSelect.bind(this)}
          // onChange={(event) => console.log(event.nativeEvent)}
          // highlights={this.state.highlights}
          //  drawBarShadow={false}
          highlightFullBarEnabled={true}
          marker={marker}
        />
      </View>
    );
  };

  render() {
    if (!this.state.payload) {
      return null;
    }
    return (
      <View>
        <BotText text={this.state?.payload?.text} />

        <View style={styles.main_container}>
          {this.renderBarChartView(this.state.payload)}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  main_container: {
    marginTop: 10,
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    width: '100%',
    height: 250,
    marginBottom: 5,
  },
  chart: {
    flex: 1,
  },
});

export default BarChartView;
