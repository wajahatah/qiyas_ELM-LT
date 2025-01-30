import { createStore } from "redux";
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web

import reducer from "./reducer";

const persistConfig = {
    key: 'root',
    storage,
}

// const store = createStore(reducer);
// export default store;


const persistedReducer = persistReducer(persistConfig, reducer)

const store = createStore(persistedReducer);
const persistor = persistStore(store)



export {
    store,
    persistor
}