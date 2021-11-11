import {
  StyleSheet,
} from 'react-native';
import * as Constants from '../../../KoraText';
import {normalize} from '../../../../utils/helpers';
const styles = StyleSheet.create({
  swipeout: {
    backgroundColor: '#dbddde',
    overflow: 'hidden',
  },
  swipeoutBtnTouchable: {
    flex: 1,
  },
  swipeoutBtn: {
    alignItems: 'center',
    backgroundColor: '#b6bec0',
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  rootNavigator1:{
    padding: 18,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'grey',
    borderBottomWidth: 0.5,
    borderBottomColor: 'grey',
  },
  rootNavigator2:{paddingRight: 6},
  swipeoutBtnText: {
    color: '#fff',
    textAlign: 'center',
  },
  swipeoutBtns: {
    bottom: 0,
    flex: 1,
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  swipeoutContent: {
  },
  colorDelete: {
    backgroundColor: '#fb3d38',
  },
  colorPrimary: {
    backgroundColor: '#006fff'
  },
  colorSecondary: {
    backgroundColor: '#fd9427'
  },
  titleTextStyle: {
    lineHeight: 22,
    fontSize: normalize(18),
    fontWeight: '400',
    fontStyle: 'normal',
    fontFamily: Constants.fontFamily,
    textAlign: 'left',
    paddingLeft: 6,
    fontWeight: 'bold',
    minWidth: 200,
  }
})

export default styles;
