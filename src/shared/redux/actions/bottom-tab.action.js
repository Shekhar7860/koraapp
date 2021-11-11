import {
  SET_UNSELECTED_ROUTES,
  SET_SELECTED_ROUTES,
} from '../constants/bottom-tab.constants';

export function setUnSelectedRoutes(unSelectedRoutes) {
  return {
    type: SET_UNSELECTED_ROUTES,
    unSelectedRoutes,
  };
}

export function setSelectedRoutes(selectedRoutes) {
  return {
    type: SET_SELECTED_ROUTES,
    selectedRoutes,
  };
}
