import React from 'react';
import {TouchableOpacity, View, StyleSheet} from 'react-native';
import {Text} from '../../../components/KoraText';
import {Icon} from '../../../components/Icon/Icon.js';
import {FlatList} from 'react-native';
import moment from 'moment';
import FileItem from '../singleItem/FileItem';
import {BORDER} from './TemplateType';

const MAX_COUNT = 3;

class FilesView extends React.Component {
  template_type = '';
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      isShowMore: false,
      filesCount: 0,
      payload: null,
    };
  }

  componentDidMount() {
    const filesPayload = this.props.filesPayload;
    this.template_type = this.props.template_type;
    let data = this.groupData(filesPayload.elements);
    let count = filesPayload.elements.length;
    let isShowMore = count > 3;
    this.setState({
      isShowMore: isShowMore,
      files: data,
      filesCount: count,
      payload: filesPayload,
    });
  }

  getSingleFilesViewForFlatList = (item) => {
    return this.getSingleFilesView(item.item, item.index);
  };

  //yyyy-MM-dd'T'HH:mm:ss'Z'

  dateToFromNowDaily = (dateStr) => {
    //Thu, 3 Dec 2020 20:08:33 +0530
    var date = new Date(dateStr).getTime();

    return moment(date).calendar(null, {
      lastWeek: '[Last] dddd',
      lastDay: '[Yesterday]',
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      sameElse: 'ddd, MMM d, yyyy',
      // sameElse: function () {
      //     return format(new Date(dateStr), 'EEE, MMM d, yyyy');//new Date(myDate).toLocaleDateString();
      // },
    });
  };

  getSingleFilesView = (item, index) => {
    return (
      <View
        key={index}
        style={{flexDirection: 'column', padding: 5, margin: 5}}>
        <FileItem {...this.props} file={item} />

        <View style={styles.line}></View>
      </View>
    );
  };

  renderFilesView = (list) => {
    return (
      <View style={styles.sub_container}>
        <FlatList
          data={list}
          renderItem={this.getSingleFilesViewForFlatList}
          keyExtractor={(item) => item.index + ''}
        />

        {this.state.isShowMore && (
          <TouchableOpacity
            onPress={() => {
              if (this.props.onViewMoreClick) {
                this.props.onViewMoreClick(
                  this.template_type,
                  this.state.payload,
                );
              }
            }}>
            <View style={styles.viewmore_view}>
              <Text style={styles.view_more_text}>View more</Text>

              <View style={styles.icon_view}>
                <Icon size={16} name="Right_Direction" color="black" />
              </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  groupData = (data) => {
    let result = [];

    for (let i = 0; i < data.length; i++) {
      if (i === MAX_COUNT) {
        break;
      }
      let obj = data[i];

      obj = {
        index: i,
        ...obj,
      };
      result[i] = obj;
    }
    return result;
  };

  render() {
    return <View>{this.renderFilesView(this.state.files)}</View>;
  }
}

const styles = StyleSheet.create({
  view_more_text: {
    flex: 1,
    fontSize: BORDER.TEXT_SIZE,
    color: BORDER.TEXT_COLOR,
    alignSelf: 'flex-start',
  },
  viewmore_view: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 5,
    marginLeft: 10,
  },
  icon_view: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
    margin: 0,
  },
  filesStyle: {width: '100%'},

  sub_container: {
    backgroundColor: 'white',
    borderWidth: BORDER.WIDTH,
    borderColor: BORDER.COLOR,
    borderRadius: BORDER.RADIUS,
  },
  line: {
    marginTop: 15,
    marginBottom: 0,
    backgroundColor: BORDER.COLOR,
    width: '100%',
    height: BORDER.WIDTH,
    flexDirection: 'row',
  },
});

export default FilesView;
