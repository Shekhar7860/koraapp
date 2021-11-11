import React from 'react';
import {
  View,
  TouchableHighlight,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {decode} from 'html-entities';
import {Avatar} from '../../components/Icon/Avatar';
import HTML from 'react-native-render-html';

import {Icon} from '../../components/Icon/Icon';
import {getTimeline} from '../../utils/helpers';
import * as Constants from '../../components/KoraText';
import {withTranslation, useTranslation} from 'react-i18next';
import {normalize} from '../../utils/helpers';

class DocCommentItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {item, replyCount} = this.props;

    return (
      <View style={{marginVertical: 5}}>
        <View
          style={{
            flexDirection: 'row',
          }}>
          <View style={styles.flexStyle}>
            <View style={styles.commentView}>
              <Text>{item?.templateData?.hTxt}</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => {
              this.setCommentResolved(item);
            }}>
            {item?.status === 'open' || item?.status === 'reopen' ? (
              <Icon name={'Checked'} size={normalize(24)} color={'#202124'} />
            ) : (
              <Icon name={'Checked'} size={normalize(24)} color={'#28A745'} />
            )}
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.commentMainView}
          onPress={() =>
            this.props.onCommentClick({
              data: item,
              showReplies: this.props.showReplies,
            })
          }>
          <View style={styles.viewStyle1}>
            <Avatar
              rad={32}
              name={item?.author?.fN}
              color={item?.author?.color}
              profileIcon={item?.author?.icon}
              userId={item?.author?.id}
            />
            <Text style={styles.authorText}>
              {item?.author?.fN + ' ' + item?.author?.lN}
            </Text>
            <Text
              style={[
                styles.greyText,
                {
                  marginLeft: 2,
                  flex: 1,
                },
              ]}>
              {getTimeline(item?.createdOn, 'thread')}
            </Text>
            <TouchableOpacity style={{justifyContent: 'flex-end'}}>
              <Icon name={'options'} size={normalize(15)} color={'#202124'} />
            </TouchableOpacity>
          </View>
          <View style={styles.htmlContentView}>
            <HTML
              baseFontStyle={{fontSize: normalize(16)}}
              source={{
                html: decode(item.components[0].componentBody),
              }}
            />
          </View>
          {replyCount ? (
            <View style={{}}>
              <TouchableOpacity style={styles.replyCountView}>
                <Text style={styles.greyText}>{replyCount}</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>
    );
  }
}

DocCommentItem.propTypes = {
  onClickActions: PropTypes.func,
};

DocCommentItem.defaultProps = {
  onClickActions: (data) => {},
};

export default withTranslation()(React.memo(DocCommentItem));

const styles = StyleSheet.create({
  greyText: {
    color: '#5F6368',
    fontSize: normalize(14),
    fontWeight: '400',
  },
  commentView: {
    alignSelf: 'flex-start',
    padding: 3,
    backgroundColor: 'rgba(255,212,0,0.14)',
    borderBottomColor: '#FFDA2D',
    borderBottomWidth: 2,
  },
  commentMainView: {
    marginVertical: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E4E5E7',
  },
  viewStyle1: {
    margin: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontWeight: '500',
    fontSize: normalize(16),
    color: '#202124',
    marginHorizontal: 8,
  },
  htmlContentView: {
    marginLeft: 12,
    marginBottom: 18,
    color: '#202124',
    fontSize: normalize(16),
    fontWeight: '400',
  },
  replyCountView: {
    flexDirection: 'row-reverse',
    margin: 10,
  },
  flexStyle: {flex: 1},
});
