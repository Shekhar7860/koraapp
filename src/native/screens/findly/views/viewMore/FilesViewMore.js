import React from 'react';
import {View, StyleSheet} from 'react-native';
import {FlatList} from 'react-native';
import moment from 'moment';
import ParentView from '../ParentView';
import FileItem from '../../singleItem/FileItem';

const MAX_COUNT = 3;

class FilesViewMore extends ParentView {
  template_type = '';
  onListItemClick = null;
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      // payload: null,
    };
  }

  componentDidMount() {
    const {route} = this.props;
    const filesPayload = route.params.filesPayload;
    this.template_type = route.params.template_type;
    this.onListItemClick = route.params.onListItemClick;

    let data = filesPayload.elements; //this.groupData(filesPayload.elements);
    this.setState({
      files: data,
      //payload: filesPayload
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
    // console.log("item ---------> ", item.item.isHeader);
    return (
      <View style={styles.fileView1}>
        <FileItem
          {...this.props}
          onListItemClick={this.onListItemClick}
          file={item}/>
        <View
          style={styles.fileView2}></View>
      </View>
    );
  };

  // getSingleFilesView123 = (item, index) => {
  //     // console.log("item ---------> ", item.item.isHeader);
  //     return (
  //         <View style={{ padding: 5, margin: 5 }}>

  //             <TouchableOpacity
  //                 onPress={() => {
  //                     if (this.onListItemClick) {
  //                         this.onListItemClick(this.template_type, item);
  //                     }
  //                 }}>
  //                 <View style={{ flexDirection: 'row' }}>
  //                     <View style={{ backgroundColor: 'white', width: 60, height: 60, flexDirection: 'column', alignItems: 'center', paddingEnd: 5, borderRadius: 10, alignItems: 'center', alignContent: 'baseline', alignItems: 'center', justifyContent: 'center', }}>

  //                         <FileIcon type={item.fileType} />
  //                         {/* <View style={{ backgroundColor: index % 2 === 0 ? '#e7f2ff' : '#ddffef', width: 45, height: 55, borderRadius: 6, alignItems: 'center', justifyContent: 'center', }}>
  //                             <View style={{ backgroundColor: index % 2 === 0 ? '#538dff' : '#28ba76', width: 20, height: 25, borderRadius: 3 }}>

  //                             </View>
  //                             {this.SvgComponent}
  //                         </View> */}
  //                     </View>

  //                     <View style={{ flex: 1, backgroundColor: 'white', flexDirection: 'column' }}>
  //                         <Text numberOfLines={2} style={{ fontWeight: '500', fontSize: 16, color: '#485260', }} >{item.fileName}</Text>
  //                         <View style={{ alignItems: 'center', flexDirection: 'row' }}>

  //                             <Text style={{ fontSize: 14, color: '#a7b0be', }}>Shared by {item.sharedBy}</Text>

  //                         </View>

  //                         <View style={{ alignItems: 'center', flexDirection: 'row' }}>

  //                             <Text style={{ fontSize: 14, color: '#a7b0be', }}>Last Edited {this.dateToFromNowDaily(item.lastModified)}</Text>

  //                         </View>
  //                         <View style={{ marginTop: 15, marginBottom: 0, backgroundColor: '#485260', width: '100%', height: 1, opacity: 0.3, flexDirection: 'row' }}></View>
  //                     </View>
  //                 </View>
  //             </TouchableOpacity>

  //         </View>
  //     );
  // }

  renderFilesView = (list) => {
    // console.log("list  -------------------->>> ", JSON.stringify(list));

    return (
      <View
        style={styles.fileView3}>
        <FlatList
          data={list}
          renderItem={this.getSingleFilesViewForFlatList}
          keyExtractor={(item) => item?.lastModified + ''}
        />
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
    return (
      <View style={styles.fileView4}>
        {this.renderFilesView(this.state.files)}
      </View>
    );
  }
}
const styles = StyleSheet.create({
    fileView1:{padding: 5, margin: 0},
    fileView2:{
        marginTop: 15,
        marginBottom: 0,
        backgroundColor: '#485260',
        width: '100%',
        height: 1,
        opacity: 0.3,
        flexDirection: 'row',
      },
    fileView3:{
        backgroundColor: 'white',
        borderWidth: 0.6,
        borderColor: '#00485260',
        borderRadius: 8,
      },
    fileView4:{width: '100%'},
});

export default FilesViewMore;
