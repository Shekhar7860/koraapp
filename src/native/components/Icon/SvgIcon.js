import React from 'react';
import {Image} from 'react-native';
import {createIconSetFromIcoMoon} from 'react-native-vector-icons';
import icoMoonConfig from '../../../../assets/fonts/Icomoon/selection.json';
import {normalize} from '../../utils/helpers';
import {emptyObject} from '../../../shared/redux/constants/common.constants';
import DND from '../../assets/profile/DND.svg';
import Online from '../../assets/profile/Online.svg';
import Selected from '../../assets/profile/Selected.svg';
import Unselected from '../../assets/profile/Unselected.svg';
import Logout from '../../assets/profile/Logout.svg';
import DNDPurple from '../../assets/profile/DNDPurple.svg';
import Star_Filled from '../../assets/Star_Filled.svg';
import Specific from '../../assets/Icon/Specific.svg';
import GoogleMeet from '../../assets/Icon/GoogleMeet.svg';
import ZoomIcon from '../../assets/Icon/ZoomIcon.svg';
import Empty_viewFiles from '../../assets/placeholders/mute-emptyState.svg';
import DR_Icon from '../../assets/DR_Icon.svg';

import {emptyArray} from '../../../shared/redux/constants/common.constants';
const IcoMoon = createIconSetFromIcoMoon(icoMoonConfig);

export class SvgIcon extends React.Component {
  shouldComponentUpdate(nextProps) {
    const differentName = this.props.name !== nextProps.name;
    const differentWidth = this.props.width !== emptyArray;
    const differentHeight = this.props.height !== emptyArray;
    return differentName || differentWidth || differentHeight;
  }

  render() {
    // console.log('=================Icon.js================');
    const {
      name,
      width,
      height,
      color = 'black',
      style = emptyObject,
    } = this.props;
    const iconsMap = {
      Online: <Online />,
      DND: <DND />,
      DNDPurple: <DNDPurple width={width} height={height} />,
      Selected: <Selected />,
      Unselected: <Unselected />,
      Logout: <Logout />,
      Star_Filled: <Star_Filled width={width} height={height} />,
      Specific: <Specific />,
      GoogleMeet: <GoogleMeet width={width} height={height} />,
      ZoomIcon: <ZoomIcon />,
      Empty_viewFiles: <Empty_viewFiles width={width} height={height} />,
      DR_Icon: <DR_Icon width={width} height={height} />,
    };

    const keys = Object.keys(iconsMap);
    if (keys.indexOf(name) === -1) {
      return <IcoMoon name={name} />;
    }

    return iconsMap[name];
  }
}
