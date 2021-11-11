import React from 'react';
import {View, TouchableOpacity, StyleSheet} from 'react-native';
import {Text} from '../../../components/KoraText';
import moment from 'moment';
import {format} from 'date-fns';
import FileIcon from './FileIcon';
import {TemplateType} from '../views/TemplateType';
import {BORDER} from '../views/TemplateType';
import {normalize} from '../../../utils/helpers';

class FileItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      file: null,
    };
  }

  componentDidMount() {
    const file = this.props.file;

    this.setState({
      file: file,
    });
  }

  dateToFromNowDaily = (dateStr) => {
    //Thu, 3 Dec 2020 20:08:33 +0530
    var date = new Date(dateStr).getTime();

    return moment(date).calendar(null, {
      lastWeek: '[Last] dddd',
      lastDay: '[Yesterday]',
      sameDay: '[Today]',
      nextDay: '[Tomorrow]',
      nextWeek: 'dddd',
      sameElse: function () {
        return format(new Date(date), 'dd/MM/yyyy'); //new Date(myDate).toLocaleDateString();
      },
    });
  };

  getSingleFilesView = (item) => {
    return (
      <View style={{margin: 5}}>
        <TouchableOpacity
          onPress={() => {
            if (this.props.onListItemClick) {
              this.props.onListItemClick(
                TemplateType.FILES_SEARCH_CAROUSEL,
                item,
              );
            }
          }}>
          <View style={{flexDirection: 'row'}}>
            <View style={styles.sub_container}>
              <FileIcon type={item.fileType} />
            </View>

            <View style={styles.item_view}>
              <Text numberOfLines={1} style={styles.fileName}>
                {item.fileName}
              </Text>
              <View style={styles.shared_view}>
                <Text style={styles.shared_text}>
                  Shared by {item.sharedBy}
                </Text>
              </View>

              <View style={styles.last_edit_view}>
                <Text style={styles.last_edit_text}>
                  Last Edited {this.dateToFromNowDaily(item.lastModified)}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  render() {
    return (
      <View>
        {this.state?.file && this.getSingleFilesView(this.state.file)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  last_edit_text: {fontSize: normalize(14), color: '#a7b0be'},
  last_edit_view: {alignItems: 'center', flexDirection: 'row'},
  shared_text: {fontSize: normalize(14), color: '#a7b0be'},
  shared_view: {alignItems: 'center', flexDirection: 'row'},
  fileName: {
    fontWeight: '500',
    fontSize: BORDER.TEXT_SIZE,
    color: BORDER.TEXT_COLOR,
  },
  sub_container: {
    backgroundColor: 'white',
    width: 60,
    height: 60,
    flexDirection: 'column',
    alignItems: 'center',
    paddingEnd: 5,
    borderRadius: 10,
    alignItems: 'center',
    //alignContent: 'baseline',
    alignItems: 'center',
    justifyContent: 'center',
  },
  item_view: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
});

export default FileItem;
