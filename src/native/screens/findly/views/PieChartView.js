import React from 'react';
import {View, TouchableOpacity, StyleSheet, processColor} from 'react-native';
import ParentView from './ParentView';
import {normalize} from '../../../utils/helpers';
import * as Constants from '../../../components/KoraText';
import {PieChart} from 'react-native-charts-wrapper';
import {BORDER} from './TemplateType';
import BotText from '../views/BotText';

const PIE_TYPE_REGULAR = 'regular';
const PIE_TYPE_DONUT = 'donut';

class PieChartView extends ParentView {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      payload: null,
    };
  }

  componentDidMount() {
    const payload = this.props.piechartPayload;
    this.template_type = this.props.template_type;

    this.setState({
      payload: payload,
    });
  }

  renderPieChartView = (payload) => {
    let legend = {
      enabled: true,
      textSize: 11,
      form: 'CIRCLE',

      horizontalAlignment: 'CENTER',
      verticalAlignment: 'TOP',
      orientation: 'HORIZONTAL',
      wordWrapEnabled: true,
      //   xEntrySpace: 7,
      //   yEntrySpace: 5,
    };
    //element.title + ' ' + element.displayValue
    let data = {
      dataSets: [
        {
          values: payload.elements.map((element) => {
            return {
              value: parseFloat(element.value),
              label: element.title + ' ' + element.value,
            };
          }),

          label: '',
          config: {
            colors: [
              processColor('#4E74F0'),
              processColor('#E44929'),

              processColor('#DB9400'),
              processColor('#008930'),
              processColor('#591880'),
              processColor('#3AB961'),
              processColor('#654BAF'),
              processColor('#E36CA2'),
              processColor('#FF7A00'),
              processColor('#BDA100'),
              processColor('#1B3880'),
              processColor('#9D1850'),
            ],
            valueTextSize: 11,
            valueTextColor: processColor('white'),
            sliceSpace: 3,
            selectionShift: 5,
            // xValuePosition: "OUTSIDE_SLICE",
            // yValuePosition: "OUTSIDE_SLICE",
            valueFormatter: "#.# '%'",
            valueLineColor: processColor('white'),
            valueLinePart1Length: 1,
          },
        },
      ],
    };

    let highlights = [];
    let description = {
      text: '',
      textSize: 15,
      textColor: processColor('darkgray'),
    };

    let holeRadius = 0;
    let transparentCircleRadius = 0;

    let pieType = payload.pie_type;
    //console.log('pieType ------> :', pieType);
    if (pieType && pieType === PIE_TYPE_DONUT) {
      holeRadius = 58;
      transparentCircleRadius = 61;
    }

    return (
      <View style={styles.container}>
        <PieChart
          // xAxis={xAxis}
          style={styles.chart}
          logEnabled={true}
          chartBackgroundColor={processColor('white')}
          chartDescription={description}
          data={data}
          legend={legend}
          highlights={highlights}
          extraOffsets={{left: 5, top: 5, right: 5, bottom: 5}}
          entryLabelColor={processColor('white')}
          entryLabelTextSize={12}
          entryLabelFontFamily={'HelveticaNeue-Medium'}
          drawEntryLabels={false}
          rotationEnabled={true}
          rotationAngle={270}
          usePercentValues={true}
          styledCenterText={{
            text: '',
            color: processColor('pink'),
            fontFamily: 'HelveticaNeue-Medium',
            size: 12,
          }}
          centerTextRadiusPercent={100}
          holeRadius={holeRadius}
          holeColor={processColor('#f0f0f0')}
          transparentCircleRadius={transparentCircleRadius}
          transparentCircleColor={processColor('#f0f0f088')}
          // maxAngle={450}
          // onSelect={this.handleSelect.bind(this)}
          onChange={(event) => console.log(event.nativeEvent)}
        />
      </View>
    );
  };

  render() {
    return (
      <View>
        {this.state.payload && (
          <View>
            <View>
              <View style={styles.sub_container}>
                <BotText text={this.state?.payload?.text} />
              </View>
            </View>
            <View style={styles.chart_view}>
              {this.renderPieChartView(this.state.payload)}
            </View>
          </View>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  chart_view: {
    padding: 10,
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },
  text: {
    flexWrap: 'wrap',
    color: '#485260',
    fontSize: normalize(16),
    margin: 5,
    fontFamily: Constants.fontFamily,
  },
  sub_container: {
    marginBottom: 10,
    marginTop: 5,
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

export default PieChartView;
