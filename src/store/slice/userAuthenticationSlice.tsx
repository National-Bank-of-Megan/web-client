import {createAsyncThunk, createSlice, PayloadAction} from "@reduxjs/toolkit";
import {UserAuthenticationSliceType} from "../slice-types/UserAuthenticationSliceType";
import {ClientJS} from "clientjs";

export type Tokens = {
    authToken: string;
    refreshToken: string;
};

export const userAuthenticationSlice = createSlice({
    name: "userAuthentication",
    initialState: {
        authToken: null,
        refreshToken: null,
        status: -1,
        isLoading: false,
        error: null
    } as UserAuthenticationSliceType,

    reducers: {
        loginHandler: (state, action: PayloadAction<Tokens>) => {
            state.authToken = action.payload.authToken;
            state.refreshToken = action.payload.refreshToken;
        },
        setAuthToken: (state, action) => {
            console.log('USER AUTH SLICE SETTING ACCESS TOKEN')
            state.authToken = action.payload;
        },
        clearAuthentication: (state) => {
            state.isLoading = false;
            state.authToken = null;
            state.refreshToken = null;
            state.status = -1;
            state.error = null;
        }
    }

})


export const userAuthenticationActions = userAuthenticationSlice.actions;
export default userAuthenticationSlice.reducer;