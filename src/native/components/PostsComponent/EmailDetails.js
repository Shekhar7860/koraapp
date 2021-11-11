import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import {withTranslation} from 'react-i18next';

import {getTimeline, normalize} from '../../utils/helpers';

import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {
  emptyArray,
  emptyObject,
} from '../../../shared/redux/constants/common.constants';
import {colors} from '../../theme/colors';
import {Header} from '../../navigation/TabStacks';
import HTML from 'react-native-render-html';
import {decode} from 'html-entities';
import * as Constants from '../KoraText';
import {Icon} from '../Icon/Icon';

class EmailDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      componentData: null,
    };
  }

  componentDidMount() {
    const {componentData} = this.props.route.params;
    // console.log('EmailDetails componentData -----> :', componentData);
    this.setState({componentData: componentData});
  }

  renderEmails = (emails) => {
    return emails?.map((email) => {
      return (
        <View style={{flexDirection: 'row'}}>
          <View style={{marginTop: 2}}>
            <Icon name={'email'} color={'#0D6EFD'} size={normalize(15)} />
          </View>
          <Text style={[styles.textStyle, {marginStart: 5}]}>
            {email.address}
          </Text>
        </View>
      );
    });
  };

  // getRandomNumberBetween(min, max) {
  //   return Math.floor(Math.random() * (max - min + 1) + min);
  // }

  renderEmailDetails = () => {
    if (!this.state.componentData) {
      console.log(
        'this.state.componentData ----->:',
        this.state?.componentData,
      );
      return <View />;
    }
    const componentData = JSON.parse(this.state.componentData);
   // console.log('renderEmailDetails componentData ----->:', componentData.date);
    const date = getTimeline(componentData.date, 'dateAndTime');
    return (
      <View style={styles.mainContainer}>
        <View style={styles.line_1}></View>
        <Text style={styles.textStyle_1}>{date}</Text>

        <View style={styles.container_2}>
          <View style={{marginTop: 2}}>
            <Icon
              name={'Contact_BlockContact'}
              color={'#0D6EFD'}
              size={normalize(16)}
            />
          </View>
          <Text style={styles.textStyle_2}> From: </Text>
          <Text style={styles.textStyle}>{componentData.from}</Text>
          {/* <SelectedUserTag
          user={user}
          fullName={componentData.from}
         // _handleDelete={this._handleDelete}
        /> */}
        </View>
        <View style={styles.line_2}></View>
        <View style={styles.toContainer}>
          <View style={{marginTop: 2}}>
            <Icon name={'email'} color={'#0D6EFD'} size={normalize(15)} />
          </View>
          <Text style={styles.textStyle_2}> To: </Text>
          {this.renderEmails(componentData?.to?.value)}
        </View>
        <View
          style={styles.line_2}></View>
        <View style={{flexDirection: 'row', marginStart: 20}}>
          <Text style={styles.textStyle_sub}># RE: </Text>
          <Text style={styles.textStyle_sub}>{componentData.subject}</Text>
        </View>
        <View style={styles.line_3}></View>
        <View style={styles.body_container}>
          <HTML
            baseFontStyle={styles.baseFontStyle}
            source={{html: decode(componentData.body)}}
          />
        </View>
      </View>
    );
  };

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <Header
          title="Email Details"
          goBack={true}
          navigation={this.props.navigation}
        />
        {this.renderEmailDetails()}
      </View>
    );
  }
}

// const mapStateToProps = (state, ownProps) => {
//  // const {discussion, native, workspace, home, common} = state;

//   return {
//     // selectedBoard: board,

//   };
// };

const styles = StyleSheet.create({
  body_container: {flexDirection: 'row', marginStart: 20},
  toContainer: {flexDirection: 'row', marginStart: 20, marginEnd: 30},
  line_3: {
    height: 1,
    width: '100%',
    backgroundColor: '#F3F3F3',
    marginTop: 10,
    marginBottom: 10,
  },
  line_2: {
    height: 1,
    width: '95%',
    backgroundColor: '#F3F3F3',
    margin: 10,
  },
  line_1: {
    height: 1,
    width: '100%',
    backgroundColor: '#F3F3F3',
    marginBottom: 10,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
    marginEnd: 10,
  },
  container_2: {flexDirection: 'row', marginStart: 20},
  text: {
    fontWeight: 'normal',
    fontSize: normalize(16),
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#202124',
    lineHeight: normalize(21),
  },
  baseFontStyle: {
    marginEnd: 5,
    color: '#202124',
    fontSize: normalize(15),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
  textStyle: {
    marginEnd: 5,
    color: '#202124',
    fontSize: normalize(15),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
  textStyle_sub: {
    marginEnd: 5,
    color: '#202124',
    fontSize: normalize(15),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    fontWeight: '500',
  },
  textStyle_1: {
    marginEnd: 5,
    color: '#202124',
    fontSize: normalize(15),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
    marginStart: 20,
    marginBottom: 10,
  },
  textStyle_2: {
    marginEnd: 5,
    color: '#0D6EFD',
    fontSize: normalize(15),
    fontFamily: Constants.fontFamily,
    fontStyle: 'normal',
  },
});

export default connect(null, {})(withTranslation()(EmailDetails));
