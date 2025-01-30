import './App.css'
import Routing from './config/router/Routing'

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react'
// import store from './config/redux/store';
import { store, persistor } from './config/redux/store';

function App() {

  return (

    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Routing />
      </PersistGate>
    </Provider>

  )
}

export default App
