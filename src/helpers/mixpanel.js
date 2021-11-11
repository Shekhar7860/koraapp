import { Mixpanel } from 'mixpanel-react-native';
const mixpanel = new Mixpanel('bde7551d1b6b6e42bee04b7db2d88fac');
mixpanel.init();
let env_check = process.env.NODE_ENV === 'production';

let actions = {
  identify: (id) => {
    if (env_check)
     mixpanel.identify(id);
  },
  alias: (id) => {
    if (env_check)
     mixpanel.alias(id);
  },
  track: (name, props) => {
    if (env_check)
     mixpanel.track(name, props);
  },
  people: {
    set: (props) => {
      if (env_check) 
      mixpanel.people.set(props);
    },
  },
};

export let MixpanelAction = actions;