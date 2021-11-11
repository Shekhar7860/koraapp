import React, {Component, useState, useEffect} from 'react';
import {View} from 'react-native';
import RNUrlPreview from './RNUrlPreview';
import * as Constants from '../KoraText';
import {normalize} from '../../utils/helpers';
import {LinkPreview, getPreviewData} from '@flyerhq/react-native-link-preview';

class UrlPreview extends Component {
  urlPreview = React.createRef();
  state = {
    url: null,
  };

  componentDidMount() {
    this.setUrl(this.props.url);
  }

  setUrl(url) {
    if (this.state.url && url && url === this.state.url) {
      return;
    }

    this.setState({
      url: url,
    });

    if (this.urlPreview && this.urlPreview.current) {
      if (!url || url === null) {
        this.urlPreview.current.hidePreview();
      } else {
        this.urlPreview.current.getPreview(url);
      }
    }
  }
  // render() {
  //   getPreviewData(this.state.url).then((data) => {
  //     console.log('getPreviewData  ----------->:', data);
  //   });
  //   // return <RNUrlPreview text=" " />;
  //   return <LinkPreview containerStyle={{height: 300}} text={this.state.url} />;
  // }

  render() {
    return this.state.url ? (
      // <View style={{ alignSelf: 'center', flexDirection: 'row', borderColor: '#E4E5E7', borderWidth: 1, borderRadius: 4, opacity: 0.9, padding: 0.2, width: '98%', margin: 5 }}>
      <RNUrlPreview
        ref={this.urlPreview}
        text={this.state.url}
        imageProps={{resizeMode: 'cover'}}
        titleNumberOfLines={1}
        descriptionNumberOfLines={3}
        imageStyle={{
          alignSelf: 'center',
          height: 57,
          width: 59,
          borderRadius: 5,
        }}
        title={true}
        descriptionStyle={{
          color: '#202124',
          fontFamily: Constants.fontFamily,
          fontStyle: 'normal',
          fontWeight: 'normal',

          fontSize: normalize(14),
        }}
        titleStyle={{
          flex: 1,
          marginEnd: 60,
          fontFamily: Constants.fontFamily,
          fontStyle: 'normal',
          fontWeight: 'bold',
          alignSelf: 'center',
          fontSize: normalize(14),
        }}
        textCotainerStyle={{
          flex: 1,
          justifyContent: 'flex-start',
        }}
        onDeleteClick={this.props.onDeleteClick}
        onLoad={(data) => {
          if (this.props.onLoad) {
            this.props.onLoad(data);
          }
        }}
      />
    ) : //  {/* </View>  */}
    null;
  }
}

export default UrlPreview;
