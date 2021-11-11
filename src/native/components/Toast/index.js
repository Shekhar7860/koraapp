import React, {Component, createRef} from 'react';
import SimpleToast from 'react-native-simple-toast';

export const toastRef = createRef();

export class Toast extends Component {
  show(...params) {
    SimpleToast.show(...params);
  }

  showWithGravity(...params) {
    SimpleToast.showWithGravity(...params);
  }

  render() {
    return <></>;
  }
}
