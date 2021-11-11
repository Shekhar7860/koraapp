import React from 'react';
import {View, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {Text} from '../../../components/KoraText';
import ParentView from './ParentView';

import {normalize} from '../../../utils/helpers';
import * as Constants from '../../../components/KoraText';
import {BORDER} from './TemplateType';
import PagerView from 'react-native-pager-view';

class CarouselTemplate extends ParentView {
  template_type = '';
  max_btn_count = 0;
  constructor(props) {
    super(props);
    this.state = {
      payload: null,
      currentPos: 0,
    };
    this.viewPager = React.createRef();
  }

  componentDidMount() {
    const payload = this.props.corosalPayload;
    this.template_type = this.props.template_type;
    payload?.elements.map((item) => {
      if (this.max_btn_count < item?.buttons.length) {
        this.max_btn_count = item?.buttons.length;
      }
    });

    this.setState({
      payload: payload,
    });
  }

  getSingleCorosalView = (item, index) => {
    let btnViews = item?.buttons.map((btn, index) => {
      return this.getSingleButtonView(btn, index);
    });
    let Image_Http_URL = {uri: item.image_url};
    return (
      <View key={index} style={styles.container}>
        <Image source={Image_Http_URL} style={styles.imageStyles} />
        <Text style={styles.titleText} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.subtitle}
        </Text>
        <Text style={[styles.subtitle, {}]} numberOfLines={2}>
          {item.image_url}
        </Text>
        <View style={styles.btnStyles}>{btnViews}</View>
      </View>
    );
  };

  getSingleButtonView = (item, index) => {
    return (
      <View key={index} style={[styles.btn_view]}>
        <View style={styles.line} />
        <TouchableOpacity
          disabled={this.isViewDisabled()}
          style={styles.main_view_1}
          onPress={() => {
            if (this.props.onListItemClick) {
              this.props.onListItemClick(this.template_type, item);
            }
          }}>
          <Text style={styles.item_text}>{item.title}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  onPageSelected = (event) => {
    // console.log('Event -->:', event.nativeEvent.position);

    this.setState({
      currentPos: event.nativeEvent.position,
    });
    //this.currentPos = event.nativeEvent.position;
    // let obj = this.state.mediaList[event.nativeEvent.position];
    // this.scrollHandler(event.nativeEvent.position);
    // this.setState({
    //   selectedObj: obj,
    // });
  };

  rendersingleIndicator = (item, index) => {
    return (
      <TouchableOpacity
        key={index + 'i'}
        style={[
          styles.indicatorContainer,
          {borderWidth: this.state.currentPos === index ? 0.5 : 0},
        ]}
        onPress={() => {
          this.viewPager?.setPage(index);
        }}>
        <View
          style={[
            styles.indicatorView,
            {
              backgroundColor:
                this.state.currentPos === index ? 'yellow' : 'white',
            },
          ]}>
          <Text style={styles.indicatorText}>{index + 1}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  renderCorosalView = (list) => {
    if (!list || list.length <= 0) {
      return null;
    }
    let allViews = list?.map((item, index) => {
      return this.getSingleCorosalView(item, index);
    });

    let indicatorViews = list?.map((item, index) => {
      return this.rendersingleIndicator(item, index);
    });
    const height = 300 + 40 * this.max_btn_count;
    return (
      <View style={styles.btn_views_1}>
        <PagerView
          ref={(ref) => {
            this.viewPager = ref;
          }}
          style={{height: height}}
          onPageSelected={this.onPageSelected}
          // offscreenPageLimit={1}
          // showPageIndicator={true}
          overScrollMode="always"
          overdrag={true}
          // offscreenPageLimit
          // Lib does not support dynamically orientation change
          orientation="horizontal"
          // Lib does not support dynamically transitionStyle change
          transitionStyle="scroll"
          keyboardDismissMode="on-drag"
          scrollEnabled={true}
          pageMargin={10}
          initialPage={0}>
          {allViews}
        </PagerView>

        <View style={styles.indicatorMain}>{indicatorViews}</View>
      </View>
    );
  };

  render() {
    return (
      <View style={{backgroundColor: 'white'}}>
        {this.renderCorosalView(this.state.payload?.elements)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  pagerView: {
    flex: 1,
  },
  container: {
    //minHeight: 300,
    // marginTop: 20,
    flex: 1,
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },
  indicatorMain: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
  },
  indicatorText: {fontSize: 10},
  indicatorView: {
    width: 20,
    height: 20,
    borderRadius: 50,

    justifyContent: 'center',
    alignItems: 'center',
  },
  indicatorContainer: {
    width: 22,
    height: 22,
    borderRadius: 50,

    backgroundColor: 'white',
    borderColor: 'blue',
    marginEnd: 8,
    marginTop: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageStyles: {
    height: 160,
    resizeMode: 'stretch',
    margin: 0,
    // blurRadius: 50,
  },
  btnStyles: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  mainContainer: {
    backgroundColor: 'white',
    //borderWidth: 1,
    //borderColor: '#00485260',
    // borderRadius: 6,
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },

  titleText: {
    color: BORDER.TEXT_COLOR,
    fontSize: normalize(15),
    marginStart: 10,
    marginBottom: 5,
    marginEnd: 10,
    marginTop: 5,
    fontFamily: Constants.fontFamily,
  },

  subtitle: {
    color: BORDER.TEXT_COLOR,
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginStart: 10,
    marginBottom: 5,
    marginEnd: 10,
  },
  displayTextStyle: {
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: BORDER.TEXT_COLOR,
  },

  bottom_btns: {flexDirection: 'row', marginTop: 0},
  btn_view: {
    paddingBottom: 0,
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: 8,
  },
  line: {backgroundColor: BORDER.COLOR, width: '100%', height: 1},

  item_text: {
    fontFamily: Constants.fontFamily,
    alignSelf: 'center',
    color: 'blue',
    fontSize: BORDER.TEXT_SIZE,
  },
  main_view_1: {margin: 5, padding: 5},
  btn_views_1: {backgroundColor: 'white'},
});

export default CarouselTemplate;
