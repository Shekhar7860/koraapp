import {get} from 'lodash';
import SimpleToast from 'react-native-simple-toast';
import {toastRef} from '../components/Toast';

export function showError(e) {
  toastRef.current?.showWithGravity(
    get(e, 'data.errors[0].msg', 'Error'),
    SimpleToast.LONG,
    SimpleToast.CENTER,
  );
}

export function showToast(message) {
  toastRef.current?.showWithGravity(
    message,
    SimpleToast.SHORT,
    SimpleToast.CENTER,
  );
}
