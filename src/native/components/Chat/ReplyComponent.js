import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import withObservables from '@nozbe/with-observables';
import {switchMap} from 'rxjs/operators';
import {of as of$} from 'rxjs';

import {MultiComponentView} from './extras/MultiComponentView';
import stylesLocal from './MessagesListView.Style';
import {Icon} from '../Icon/Icon';
import {Text} from '../KoraText';
import * as UsersDao from '../../../dao/UsersDao';

class _ReplyComponent extends React.Component {
  constructor(props) {
    super(props);
  }

  scrollTo(key) {
    if (this.props?.scrollTo) {
      this.props?.scrollTo?.(key);
    }
  }

  setReplyToMessage = (message = null) => {
    if (this?.props?.setReplyToMessage) {
      console.log('THIS');
      this?.props?.setReplyToMessage?.(message);
    }
  };

  render() {
    const {message, from, components} = this.props;
    if (!from || components?.length === 0) {
      return <View />;
    }
    const texts = components
      .filter((comp) => comp.componentType === 'text')
      .map((comp) => comp.componentBody)
      .join('\n');
    const authorName =
      from.id === UsersDao.getUserId() ? 'You' : from?.fN + ' ' + from?.lN;
    var filterComponent = components.filter(
      (obj) =>
        obj.componentType === 'image' ||
        obj.componentType === 'audio' ||
        obj.componentType === 'video',
    );
    return (
      <View style={stylesLocal.replyComponent8}>
        <View style={stylesLocal.replyComponent9}>
          <TouchableOpacity
            onPress={() => {
              this.scrollTo(message?.id);
            }}
            underlayColor="rgba(0,0,0,0.2)"
            style={stylesLocal.replyComponent1}>
            <View style={stylesLocal.replyComponent2}>
              <View style={stylesLocal.replyComponent3}>
                <Text>{authorName}</Text>
              </View>
              <View style={stylesLocal.replyComponent4}>
                <Text>{texts}</Text>
              </View>
            </View>
            <View style={stylesLocal.replyComponent5} />
            {filterComponent.length > 0 && (
              <View style={stylesLocal.replyComponent6}>
                <MultiComponentView
                  borderRadius={0}
                  hindeControls={true}
                  components={filterComponent}
                />
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View style={stylesLocal.replyComponent10}>
          <TouchableOpacity
            underlayColor="rgba(0,0,0,0.2)"
            onPress={() => {
              this.setReplyToMessage();
            }}
            style={stylesLocal.replyComponent7}>
            <Icon name={'cross'} size={20} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

_ReplyComponent.propTyypes = {
  setReplyToMessage: PropTypes.func,
  scrollTo: PropTypes.func,
};

_ReplyComponent.defaultProps = {
  setReplyToMessage: () => {},
  scrollTo: () => {},
};

const enhance = withObservables(['message'], ({message}) => ({
  message: message.observe(),
  components: message.components ? message.components.observe() : null,
  from: message.from
    .observe()
    .pipe(switchMap((f) => (f ? f.contact : of$(null)))),
}));

export const ReplyComponent = enhance(_ReplyComponent);
