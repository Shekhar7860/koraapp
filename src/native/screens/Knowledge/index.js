import React from 'react';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {StyleSheet, View, Text, TouchableOpacity, FlatList} from 'react-native';

import {Icon} from '../../components/Icon/Icon';
import langi18 from '../../../shared/utils/i18';
import Placeholder from '../../components/Icon/Placeholder';
import {normalize} from 'react-native-elements';
import {
  getDocumentsList,
  getComments,
} from '../../../shared/redux/actions/knowledge.action';
import FileIcon from '../../components/Chat/FileIcon';
import {getTimeline} from '../../utils/helpers';
import UsersDao from '../../../dao/UsersDao';
import {navigate} from '../../navigation/NavigationService';
import {ROUTE_NAMES} from '../../navigation/RouteNames';
class KnowledgeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      gridView: true,
    };
  }

  componentDidMount() {
    this.props.getDocumentsList();
  }

  langi18() {
    return langi18;
  }

  menuIcon(fileData) {
    return (
      <TouchableOpacity style={{paddinghorizontal: 7}}>
        <Icon name={'MoreFilled'} color={'#9AA0A6'} size={normalize(24)} />
      </TouchableOpacity>
    );
  }

  viewDocument(data) {
    //console.log('Data', data);

    navigate(ROUTE_NAMES.DISCUSSION_WEBVIEW, {
      board: data,
    });
  }

  renderFiles = ({item, index}) => {
    //console.log('Item', item);
    let edited;
    if (item.lastModified) {
      let date = getTimeline(item.lastModified, 'message').toLowerCase();
      edited = 'Last edited ' + date;
    }
    return (
      <View style={{}}>
        {this.state.gridView ? (
          <TouchableOpacity
            style={styles.gridViewStyle}
            onPress={() => this.viewDocument(item)}>
            <View style={{padding: 10}}>
              <View style={styles.flexStyle}>
                <FileIcon width={19} height={26} type={item?.type} />
                <Text
                  numberOfLines={1}
                  style={[styles.documentTitle, {flex: 4}]}>
                  {item.name}
                </Text>
              </View>
              <View style={styles.flexStyle}>
                <Text style={[styles.lastEditedText, {flex: 1, marginTop: 5}]}>
                  {edited}
                </Text>
                {this.menuIcon(item)}
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.listViewStyle}
            onPress={() => this.viewDocument(item)}>
            <FileIcon width={19} height={26} type={item?.type} />
            <View style={{flex: 6}}>
              <Text style={styles.documentTitle}>{item.name}</Text>
              <Text style={[styles.lastEditedText, {marginTop: 3}]}>
                {edited}
              </Text>
            </View>
            {this.menuIcon(item)}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  render() {
    const {t} = this.props;
    const {gridView} = this.state;
    return (
      <View style={styles.mainView}>
        <View style={styles.flexStyle}>
          <TouchableOpacity style={styles.sortView}>
            <Text style={styles.sortText}>{t('NAME')}</Text>
            <Icon name={'Sort'} color={'#9AA0A6'} size={normalize(20)} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.viewTypeStyle}
            onPress={() => this.setState({gridView: !gridView})}>
            {gridView ? (
              <Icon name={'List_View'} color={'#9AA0A6'} size={normalize(20)} />
            ) : (
              <Icon name={'Grid_View'} color={'#9AA0A6'} size={normalize(20)} />
            )}
          </TouchableOpacity>
        </View>
        <View style={styles.headerView}>
          <Text style={[styles.sortText, {paddingLeft: 9}]}>{t('FILES')}</Text>
        </View>
        <FlatList
          style={{}}
          key={this.state.gridView ? '#' : '$'}
          data={this.props.documents}
          numColumns={this.state.gridView ? 2 : null}
          renderItem={this.renderFiles}
        />
      </View>
      //   <View style={styles.container}>
      //     <Placeholder name="home" />
      //   </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  mainView: {flex: 1, backgroundColor: '#ffffff'},
  sortView: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
    paddingLeft: 16,
    paddingBottom: 13,
  },
  sortText: {
    fontWeight: '500',
    fontSize: normalize(14),
    color: '#5F6368',
    letterSpacing: 1,
    paddingRight: 10,
  },
  gridViewStyle: {
    width: 172,
    height: 155,
    borderColor: '#E4E5E7',
    borderRadius: 6,
    borderWidth: 1,
    marginTop: 15,
    marginLeft: 15,
    marginRight: 0,
  },
  listViewStyle: {
    paddingLeft: 23,
    paddingVertical: 17,
    paddingRight: 12,
    //backgroundColor: 'red',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#E4E5E7',
    //flex: 2,
  },
  lastEditedText: {
    fontSize: normalize(12),
    fontWeight: '500',
    color: '#9AA0A6',
  },
  flexStyle: {flexDirection: 'row'},
  viewTypeStyle: {padding: 20, paddingTop: 18},
  headerView: {backgroundColor: '#EFF0F1', padding: 8},
  documentTitle: {fontSize: normalize(16), fontWeight: '500', color: '#202124'},
});

const mapStateToProps = (state) => {
  const {home, knowledge} = state;

  return {
    documents: knowledge.documents,
    showLoader: home.showLoader,
    permissions: home.permissions,
  };
};

export default connect(mapStateToProps, {
  getDocumentsList,
  getComments,
})(withTranslation()(KnowledgeScreen));
