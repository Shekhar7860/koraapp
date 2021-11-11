import {applyMiddleware, createStore, compose} from 'redux';
import Reactotron from 'reactotron-react-native';
import createSagaMiddleware from 'redux-saga';
import promise from 'redux-promise';

import rootSaga from './sagas';
import reducers from './reducers';
import reactotron from './../../../reactotron-config';

// create the saga middleware
const sagaMonitor = Reactotron.createSagaMonitor();
const sagaMiddleware = createSagaMiddleware({sagaMonitor});

export const store = createStore(
  reducers,
  {},
  compose(
    applyMiddleware(sagaMiddleware, promise),
    reactotron.createEnhancer(),
  ),
);

// then run the saga
sagaMiddleware.run(rootSaga);
