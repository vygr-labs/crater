import { combineReducers, configureStore } from '@reduxjs/toolkit'
import settingsReducer from './settingsSlice'
import appReducer from './appSlice'
import { persistStore, persistReducer, createTransform } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage for web
import {
	createStateSyncMiddleware,
	initMessageListener,
} from 'redux-state-sync'

const syncConfig = {
	// TOGGLE_TODO will not be triggered in other tabs
	blacklist: ['persist/PERSIST', 'persist/REHYDRATE'],
}

// const middlewares = [createStateSyncMiddleware(config)]
// const store = createStore(rootReducer, {}, applyMiddleware(...middlewares));
// this is used to pass store.dispatch to the message listener
// initMessageListener(store);

const rootReducer = combineReducers({
	settings: settingsReducer,
	app: appReducer,
})
export type RootState = ReturnType<typeof rootReducer>

const ArrayTransform = createTransform(
	// transform state on its way to being serialized and persisted.
	(inboundState: Array<Record<any, any>>, key) => {
		console.log('Inbound State: ', inboundState)
		// alert('inbound ' + JSON.stringify(inboundState))
		return JSON.stringify(inboundState)
	},
	// transform state being rehydrated
	(outboundState: string, key) => {
		// alert('outbound ' + JSON.stringify(outboundState))
		console.log('Outbound being rehydrated: ', JSON.parse(outboundState))
		return JSON.parse(outboundState)
	},
	{ whitelist: ['app'] }
)

const persistConfig = {
	key: 'root',
	storage,
	transforms: [ArrayTransform],
}

// const persistedReducer = persistReducer(persistConfig, rootReducer)
const persistedReducer = combineReducers({
	settings: persistReducer(persistConfig, settingsReducer),
	app: persistReducer(persistConfig, appReducer),
})

export const store = configureStore({
	reducer: persistedReducer,
	middleware: getDefaultMiddlewares =>
		getDefaultMiddlewares().concat(createStateSyncMiddleware(syncConfig)),
})

export const persistor = persistStore(store)

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch
// Same for the `RootState` type
