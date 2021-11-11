/**
 * @format
 */
// import './wdyr';
import {AppRegistry} from 'react-native';
import App from './App';
import React, {Component, Suspense} from 'react';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import NotificationService from './src/native/notifications/NotificationService';




messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  new NotificationService().localNotif(remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
