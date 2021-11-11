import {Component} from 'react';

export class KoraReactComponent extends Component {
  componentWillUnmount() {
    this.setState = (state, callback) => {
      return;
    };
  }
}
