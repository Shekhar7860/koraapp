import React, {useState, useEffect, useCallback} from 'react';
import {Trans, useTranslation, withTranslation} from 'react-i18next';
import {ActivityIndicator, TouchableOpacity} from 'react-native';
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {connect} from 'react-redux';
import * as UsersDao from '../../../../dao/UsersDao';
import {
  acceptToJoinWorkSpace,
  requestToJoinWorkSpace,
  getBrowsedWorkspace,
  clearWsData,
} from '../../../../shared/redux/actions/workspace.action';
import {LOADING_MORE_WS} from '../../../../shared/redux/constants/native.constants';
import {BROWSE_WORKSPACE_SUCCESSFUL} from '../../../../shared/redux/constants/workspace.constants';
import {Icon} from '../../../components/Icon/Icon';
import {fontFamily} from '../../../components/KoraText';
import {RoomAvatar} from '../../../components/RoomAvatar';
import {goBack} from '../../../navigation/NavigationService';
import {Header} from '../../../navigation/TabStacks';
import {normalize} from '../../../utils/helpers';

const ReadMoreText = React.memo(
  ({readMoreStyle, text, textStyle, limit = 2}) => {
    const {t} = useTranslation();
    const [showMoreButton, setShowMoreButton] = useState(false);
    const [textShown, setTextShown] = useState(false);
    const [numLines, setNumLines] = useState(undefined);

    const toggleTextShown = () => {
      setTextShown(!textShown);
    };

    useEffect(() => {
      setNumLines(textShown ? undefined : limit);
    }, [limit, textShown]);

    const onTextLayout = useCallback(
      (e) => {
        if (e.nativeEvent.lines.length > limit && !textShown) {
          setShowMoreButton(true);
          setNumLines(limit);
        }
      },
      [limit, textShown],
    );

    return (
      <>
        <Text
          onTextLayout={onTextLayout}
          numberOfLines={numLines}
          style={textStyle}
          ellipsizeMode="tail">
          {text}
        </Text>

        {showMoreButton ? (
          <Text onPress={toggleTextShown} style={readMoreStyle}>
            {textShown ? t('Know Less') : 'Know More'}
          </Text>
        ) : null}
      </>
    );
  },
);

class DetailedWorkspaceScreen extends React.Component {
  handleJoinWorkspace = () => {
    const {
      route: {
        params: {ws},
      },
    } = this.props;

    let item = ws;

    const payload = {
      wId: item.id,
      userId: UsersDao.getUserId(),
      q: '',
      is_append: false,
      isFirstTimeLoaded: false,
      skip: 0,
    };
    if (item.userStatus === 'invited') {
      this.props.acceptToJoinWorkSpace(payload, () => goBack());
    } else {
      this.props.requestToJoinWorkSpace(payload, () => goBack());
    }
  };

  renderWorkspaceDetails() {
    const {
      t,
      route: {
        params: {
          ws: {desc, logo, name, owner, userStatus, type},
        },
      },
    } = this.props;
    // const {t} = useTranslation();
    const isUserRequested = userStatus === 'requested';
    const isUserInvited = userStatus === 'invited';
    const isTypeOpen = type === 'open';
    const showLock = userStatus === 'nonMember' && isTypeOpen;
    const showJoinButton = userStatus === 'nonMember' || isUserInvited;
    const showRequest = !isUserRequested && isTypeOpen;
    const showJoin = !isUserRequested && !isTypeOpen;
    const {fN, lN} = owner;

    return (
      <View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
            justifyContent: 'space-between',
          }}>
          <Text
            style={{
              fontWeight: '700',
              lineHeight: normalize(20),
              fontSize: normalize(16),
              fontFamily: fontFamily,
            }}>
            {fN}
          </Text>
          {showLock && <Icon name={'Lock'} size={15} />}
        </View>
        <ReadMoreText
          text={desc}
          readMoreStyle={{
            marginTop: 10,
            fontWeight: '400',
            fontSize: normalize(16),
            lineHeight: normalize(28),
            fontFamily: fontFamily,
            color: '#0D6EFD',
          }}
          textStyle={{
            fontWeight: '400',
            fontSize: normalize(16),
            lineHeight: normalize(28),
            fontFamily: fontFamily,
          }}
        />
      </View>
    );
  }

  renderButton() {
    const {
      t,
      route: {
        params: {
          ws: {desc, logo, name, owner, userStatus, type},
        },
      },
    } = this.props;
    // const {t} = useTranslation();
    const isUserRequested = userStatus === 'requested';
    const isUserInvited = userStatus === 'invited';
    const isTypeOpen = type === 'open';
    const showLock = userStatus === 'nonMember' && isTypeOpen;
    const showJoinButton = userStatus === 'nonMember' || isUserInvited;
    const showRequest = !isUserRequested && isTypeOpen;
    const showJoin = !isUserRequested && !isTypeOpen;

    return (
      <TouchableOpacity
        onPress={this.handleJoinWorkspace}
        style={{
          marginTop: 20,
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 9,
          borderRadius: 4,
          backgroundColor: '#0D6EFD',
        }}>
        <Text
          style={{
            fontWeight: '400',
            fontSize: normalize(16),
            lineHeight: normalize(26),
            fontFamily: fontFamily,
            color: 'white',
          }}>
          {showJoin ? t('Join this workspace') : t('Request')}
        </Text>
      </TouchableOpacity>
    );
  }

  render() {
    const {
      t,
      route: {
        params: {
          ws: {logo, name, description},
        },
      },
    } = this.props;
    console.log('WS', logo);
    return (
      <View style={styles.safeAreaStyles}>
        <Header
          logo={
            <View style={{paddingLeft: 10, marginRight: -5}}>
              <RoomAvatar logo={logo} />
            </View>
          }
          title={name}
          goBack={true}
          navigation={this.props.navigation}
        />
        <View style={styles.scrollViewStyles}>
          {this.renderWorkspaceDetails()}
          {this.renderButton()}
        </View>

        <SafeAreaView />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const {workspace, native} = state;
  return {
    browseWorkspace: workspace.browsedWorkspace,
    loadingMore: native?.loaders[LOADING_MORE_WS],
  };
};

export default connect(mapStateToProps, {
  getBrowsedWorkspace,
  requestToJoinWorkSpace,
  acceptToJoinWorkSpace,
  clearWsData,
})(withTranslation()(DetailedWorkspaceScreen));

const styles = StyleSheet.create({
  joinText: {
    color: '#106CF6',
    lineHeight: normalize(26),
    fontFamily: fontFamily,
    fontSize: normalize(16),
    fontWeight: '400',
  },
  invitedTagContainer: {
    borderRadius: 4,
    paddingHorizontal: 11,
    paddingVertical: 3,
    backgroundColor: '#EAF6EC',
  },
  invitedTag: {
    color: '#135423',
    fontSize: normalize(14),
    lineHeight: normalize(14),
  },
  requestedTagContainer: {
    borderRadius: 4,
    paddingHorizontal: 11,
    paddingVertical: 3,
    backgroundColor: '#EFF0F1',
  },
  requestedTag: {
    color: '#3C4043',
    fontSize: normalize(14),
    lineHeight: normalize(14),
  },
  itemHeader: {
    fontWeight: '700',
    fontSize: normalize(16),
  },
  wsItem: {
    padding: 18,
    borderRadius: 4,
    borderColor: '#E4E5E7',
    backgroundColor: 'white',
  },
  cardLogo: {
    width: 76,
    marginLeft: -16,
    alignItems: 'center',
    // justifyContent: 'center',
  },
  descriptionText: {
    fontWeight: '400',
    fontSize: normalize(16),
    marginTop: 12,
    marginBottom: 20,
  },
  list: {
    marginTop: 14,
    paddingHorizontal: 18,
    // marginBottom: 100,
  },
  cardHeader: {fontWeight: '700', marginBottom: 7},
  safeAreaStyles: {
    flex: 1,
    backgroundColor: 'white',
    flexDirection: 'column',
  },
  scrollViewStyles: {
    marginHorizontal: 18,
    marginTop: 20,
  },
  mediumText: {fontWeight: '500', fontSize: 16},
  topText: {
    fontWeight: '700',
    fontSize: normalize(18),
    fontFamily: fontFamily,
  },
  emojiTextStyle: {
    fontWeight: '400',
    fontSize: normalize(28),
    fontStyle: 'normal',
  },
  textInput: {
    fontFamily: fontFamily,
    fontWeight: '700',
    fontSize: normalize(20),
    paddingHorizontal: 10,
    lineHeight: 24,
  },
  flexOne: {flex: 1},
  emojiContainer: {
    height: 44,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF0F1',
    borderRadius: 4,
  },
  iconAndNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  card: {
    borderWidth: 0.5,
    borderColor: '#BDC1C6',
    padding: 14,
    paddingEnd: 28,
    borderRadius: 6,
  },
  selected: {
    borderColor: '#126df6',
    backgroundColor: '#F3F8FF',
  },
  cardText: {
    fontWeight: '400',
    color: '#202124',
    flexShrink: 1,
  },
  selectedText: {
    color: '#07377F',
  },
});
