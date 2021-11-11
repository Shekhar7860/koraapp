import React, {Component} from 'react';
import {View} from 'react-native';
import WebView from 'react-native-webview';

class WebViewScreen extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <WebView
        source={{
          uri: this.props.route.params.url
        }}
      />
    );
  }
}

export default WebViewScreen;
