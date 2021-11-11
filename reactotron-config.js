import Reactotron from 'reactotron-react-native';
import AsyncStorage from '@react-native-community/async-storage';
import sagaPlugin from 'reactotron-redux-saga';
import {reactotronRedux} from 'reactotron-redux';

const reactotron = Reactotron.setAsyncStorageHandler(AsyncStorage)
  .configure({
    name: 'WorkAssist',
  })
  .use(sagaPlugin())
  .use(
    reactotronRedux({
      isActionImportant: (action) => action.type === 'repo.receive',
    }),
  )
  .useReactNative({
    asyncStorage: false,
    networking: {
      ignoreUrls: /symbolicate/,
    },
    editor: false,
    errors: {veto: (stackFrame) => false},
    overlay: false,
  })
  .connect();

export default reactotron;
