import {REDUX_FLUSH} from '../constants/auth.constants';
import {
  SET_SELECTED_ROUTES,
  SET_UNSELECTED_ROUTES,
} from '../constants/bottom-tab.constants';

const initState = {
  unSelectedRoutes: [
    {icon: 'Tasks', name: 'Tasks', showTitle: true},
    //{icon: 'Events', name: 'Events', showTitle: true},
    {icon: 'Knowledge', name: 'Knowledge', showTitle: true},
    // {icon: 'Automations', name: 'Automations', showTitle: true},
    // {icon: 'More_Apps', name: 'Apps store', showTitle: true},
  ],
  selectedRoutes: [
    // {icon: 'Home', name: 'Home', showTitle: true},
    // {icon: 'Workspaces', name: 'Workspaces', showTitle: true},
    {icon: 'Messages', name: 'Messages', showTitle: true},
    {icon: 'Workspaces', name: 'Workspaces', showTitle: true},
    {icon: 'findly', name: 'Findly', showTitle: false},
    {icon: 'Events', name: 'Events', showTitle: true},
    //{icon: 'Knowledge', name: 'Knowledge', showTitle: true},
    {icon: 'UserProfile', name: 'Profile', showTitle: false},
    // {icon: 'More', name: 'More', showTitle: true},
  ],
};
export default (state = initState, action) => {
  switch (action.type) {
    case REDUX_FLUSH:
      return initState;
    case SET_UNSELECTED_ROUTES:
      return {...state, unSelectedRoutes: action.unSelectedRoutes};
    case SET_SELECTED_ROUTES:
      return {...state, selectedRoutes: action.selectedRoutes};
    default:
      return state;
  }
};
