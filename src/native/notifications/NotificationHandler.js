import PushNotification from 'react-native-push-notification';
import NotificationService from './NotificationService';
import {ActivityIndicator, Linking} from 'react-native';
export default class NotificationHandler {
  configure() {
    PushNotification.configure({
      onRegister: this.onRegister.bind(this),
      onNotification: this.onNotification.bind(this),
      onAction: this.onAction.bind(this),
      onRegistrationError: this.onRegistrationError.bind(this),
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  onNotification(notification) {
    if (typeof this._onNotification === 'function') {
      this._onNotification(notification);
    } else {
      new NotificationService()?.localNotif(notification);
    }
  }

  onRegister(token) {
    if (typeof this._onRegister === 'function') {
      this._onRegister(token);
    }
  }

  onAction(notification) {
    // if (notification.action === 'Yes') {
    //   PushNotification.invokeApp(notification);
    // }
  }

  // (optional) Called when the user fails to register for remote notifications. Typically occurs when APNS is having issues, or the device is a simulator. (iOS)
  onRegistrationError(err) {}

  attachRegister(handler) {
    this._onRegister = handler;
  }

  attachNotification(handler) {
    this._onNotification = handler;
  }
}
