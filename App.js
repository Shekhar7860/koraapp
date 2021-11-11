/**
 * WorkAssist React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component, Suspense} from 'react';
import {Provider} from 'react-redux';
import {Linking} from 'react-native';
import {store} from './src/shared/redux/store';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {
  AppStackNavigator,
  FindlyNavigator,
  NewWorkspacesNavigator,
} from './src/native/navigation/RootNavigator';
import CustomBottomTabBar from './src/native/navigation/CustomBottomTabBar'
import {Text, Platform} from 'react-native'
if (__DEV__) {
  import('./reactotron-config').then(() =>
    console.log('Reactotron configured'),
  );
}


const Stack = createStackNavigator();
const oldRender = Text.render;
const settings = [
  // we use this empty object for when there is no weight specified
    {},
    {
      fontFamily: 'Inter-Thin',
      
    }, {
      fontFamily: 'Inter-Regular',
      
    }, {
      fontFamily: 'Inter-Medium',
    
    }, {
      fontFamily: 'Inter-Semibold',
      
    }, {
      fontFamily: 'Inter-Bold',
    
    },
    {
      fontFamily: 'Inter-ExtraBold',
    
    },
    {
      fontFamily: 'Inter-Black',
      
    },
    {
      fontFamily: 'Inter-ExtraLight',
    },
    {
      fontFamily: 'Inter-Light',
      
    },
  ];
  
  const defaultIndex = 0;
  
  Text.render = (...args) => {
    const origin = oldRender.call(this, ...args);
    if (Platform.OS === 'android') {
      let useIndex = defaultIndex;
      if (typeof origin.props.style !== 'undefined' && typeof origin.props.style.fontWeight !== 'undefined') {
        const { fontWeight } = origin.props.style;
        if (fontWeight === '100') {
          useIndex = 1;
        } else if (fontWeight === '400' || fontWeight === 'normal') {
          useIndex = 2;
        } else if (fontWeight === '500' ) {
          useIndex = 3;
        } else if (fontWeight === '600') {
          useIndex = 4;
        } else if (fontWeight === '700' || fontWeight === 'bold') {
          useIndex = 5;
        } else if (fontWeight === '800') {
          useIndex = 6;
      } else if (fontWeight === '900') {
        useIndex = 7;
      }
        else if (fontWeight === '200') {
          useIndex = 8;
        }
      else if (fontWeight === '300') {
        useIndex = 9;
      }
      }
  
      return React.cloneElement(origin, {
        style: [settings[defaultIndex], Platform.OS === 'android' ? { fontFamily: 'Roboto' } : {}, origin.props.style, settings[useIndex]],
      });
    }
  
    return origin;
  };
import {
  navigationRef,
  isReadyRef,
} from './src/native/navigation/NavigationService';
import './src/shared/i18n';
import {LogBox} from 'react-native';
import {ROUTE_NAMES} from './src/native/navigation/RouteNames';
import {Toast, toastRef} from './src/native/components/Toast';
import {overrideTextRender} from './src/native/utils/overrides';
import NoNetworkBar from './src/native/components/NoNetworkBar';

import {pushNotifData} from './src/shared/redux/actions/home.action';
import {Loader} from './src/native/screens/ChatsThreadScreen/ChatLoadingComponent';

overrideTextRender();

//kora-Main->Main->Chat
const deepLinksConf = {
  screens: {
    Kora: {
      screens: {
        Main: {
          screens: {
            Main: {
              screens: {
                // Chat: 'myChat/:boardId',
                // Main: 'myMain/:boardId',
              },
            },
          },
        },
        Login: {
          screens: {
            Splash: 'splash/:customData',
          },
        },
      },
    },
  },
};

const linking = {
  prefixes: ['korav2://app.koraapp.com'],
  config: deepLinksConf,
};
export default class App extends Component {
  componentDidMount() {
    if (this.props?.userInteraction && this.props?.userInfo) {
      let _params = {
        notifData: this.props?.userInfo,
      };
      store.dispatch(pushNotifData(_params));
    }
    // this.initializeFonts()
  //  FontManager.init();
  }
  

  render() {
    // if (!__DEV__) {
    LogBox.ignoreAllLogs();
    // }
    return (
      <Provider store={store}>
        <Toast ref={toastRef} />
        <Suspense fallback={<Loader />}>
          <NoNetworkBar />
          <NavigationContainer
            linking={linking}
            ref={navigationRef}
            onReady={() => {
              isReadyRef.current = true;
            }}>
            <Stack.Navigator
              headerMode="none"
              initialRouteName="Kora"
              mode="modal">
              <Stack.Screen name="Kora" component={AppStackNavigator} />
              <Stack.Screen
                name={ROUTE_NAMES.FINDLY}
                component={CustomBottomTabBar}
              />
              <Stack.Screen
                name={ROUTE_NAMES.NEW_WORKSPACE}
                component={NewWorkspacesNavigator}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </Suspense>
      </Provider>
    );
  }
}
