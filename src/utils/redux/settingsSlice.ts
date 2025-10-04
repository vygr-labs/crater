import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { DisplayBounds } from '../types'
import { update } from 'lodash'

export interface SettingsState {
	theme: string
	language: string
	projectionBounds: DisplayBounds
	projectionDisplayId: number
}

const initialState: SettingsState = {
	theme: 'light',
	language: 'en',
	projectionBounds: {
		height: 0,
		width: 0,
		x: 0,
		y: 0,
	},
	projectionDisplayId: 0,
}

export const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		changeTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
			state.theme = action.payload
		},
		changeLanguage: (state, action: PayloadAction<string>) => {
			state.language = action.payload
		},
		updateDisplayBounds: (state, action: PayloadAction<DisplayBounds>) => {
			state.projectionBounds = action.payload
		},
		updateProjectionDisplayId: (state, action: PayloadAction<number>) => {
			state.projectionDisplayId = action.payload
		},
	},
})

export const {
	changeLanguage,
	changeTheme,
	updateDisplayBounds,
	updateProjectionDisplayId,
} = settingsSlice.actions

export default settingsSlice.reducer
