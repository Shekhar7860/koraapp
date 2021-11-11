import React from 'react';
import {View, StyleSheet, Text, TouchableOpacity, Image} from 'react-native';
import {FlatList} from 'react-native';
import moment from 'moment';
import ParentView from '../ParentView';
import {BORDER} from '../TemplateType';
import * as Constants from '../../../../components/KoraText';

class ListViewMore extends ParentView {
  template_type = '';
  onListItemClick = null;
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      // payload: null,
    };
  }

  componentDidMount() {
    const {route} = this.props;
    const listPayload = route.params.listPayload;
    this.template_type = route.params.template_type;
    this.onListItemClick = route.params.onListItemClick;

    let data = listPayload.elements;
    this.setState({
      list: data,
      //payload: filesPayload
    });
  }

  getSingleFilesViewForFlatList = (item) => {
    return this.getSingleFilesView(item.item, item.index);
  };

  getSingleFilesView = (item, index) => {
    let Image_Http_URL = {uri: item.image_url};
    return (
      <View style={styles.main_view_1}>
        <View style={{flexDirection: 'row'}}>
          <View>
            <View
              style={{
                borderWidth: 1,
                borderColor: BORDER.COLOR,
                borderRadius: 5,
              }}>
              <Image
                source={Image_Http_URL}
                style={{
                  height: 70,
                  width: 70,
                  resizeMode: 'stretch',
                  margin: 0,
                  //blurRadius: 50,
                }}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: 'column',
              marginStart: 10,
              flex: 1,
            }}>
            <Text style={styles.displayTextStyle}>{item.title}</Text>

            <Text style={styles.descTextStyle}>{item.subtitle}</Text>
            {item?.default_action?.url && (
              <TouchableOpacity
                disabled={this.isViewDisabled()}
                onPress={() => {
                  if (this.onListItemClick) {
                    this.onListItemClick(this.template_type, item);
                  }
                }}>
                <Text style={styles.urlStyle}>{item?.default_action?.url}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.line} />
      </View>
    );
  };

  renderListView = (list) => {
    // console.log("list  -------------------->>> ", JSON.stringify(list));

    return (
      <View style={styles.fileView3}>
        <FlatList
          data={list}
          renderItem={this.getSingleFilesViewForFlatList}
          keyExtractor={(item) => item?.lastModified + ''}
        />
      </View>
    );
  };

  render() {
    return (
      <View style={styles.fileView4}>
        {this.renderListView(this.state.list)}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  fileView1: {padding: 5, margin: 0},
  fileView2: {
    marginTop: 15,
    marginBottom: 0,
    backgroundColor: '#485260',
    width: '100%',
    height: 1,
    opacity: 0.3,
    flexDirection: 'row',
  },
  fileView3: {
    backgroundColor: 'white',
    borderWidth: 0.6,
    borderColor: '#00485260',
    borderRadius: 2,
  },
  fileView4: {width: '100%'},
  main_view_1: {
    marginTop: 5,
    marginBottom: 5,
    marginEnd: 10,
    marginStart: 5,
    padding: 5,
    flexDirection: 'column',
  },
  line: {
    backgroundColor: BORDER.COLOR,
    width: '100%',
    height: 1,
    marginTop: 10,
    marginBottom: 5,
  },
  displayTextStyle: {
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: BORDER.TEXT_COLOR,
    marginBottom: 5,
    marginEnd: 10,
  },
  descTextStyle: {
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    color: '#485260',
    marginBottom: 3,
    marginEnd: 10,
  },
  urlStyle: {
    color: 'blue',
    fontWeight: '400',
    fontSize: BORDER.TEXT_SIZE,
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    marginEnd: 10,
  },
});

export default ListViewMore;
