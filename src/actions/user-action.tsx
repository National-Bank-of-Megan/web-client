import {
    USER_AUTH_FAIL,
    USER_AUTH_REQUEST,
    USER_AUTH_SUCCESS,
    USER_LOGOUT,
    USER_PARTIAL_AUTH
} from "../constants/AuthConstants";
import {ThunkAction, ThunkDispatch} from "redux-thunk";
import {RootState} from "../store/auth-store";
import {AnyAction} from "redux";
import {REST_PATH_AUTH} from "../constants/Constants";
import storage from "redux-persist/lib/storage";


export const login = (clientId: string, password: string): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>): Promise<void> => {

    dispatch({
        type: USER_AUTH_REQUEST
    })

    const response = await fetch(REST_PATH_AUTH + "/web/login", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            clientId,
            password
        })
    })

    console.log(response)
    if (!response.ok) {
        const text = await response.text() || 'Invalid credentials';
        dispatch({
            type: USER_AUTH_FAIL,
            payload: text,
            status: response.status
        })
        return Promise.reject(text)

    }

    if (response.status === 206) {
        dispatch({
            type: USER_PARTIAL_AUTH,
            status: response.status
        })
      return;
    }

    console.log('sdfdsm')
    const data = await response.json();
    const authTokens = {accessToken: data.access_token, refreshToken: data.refresh_token}

    dispatch({
        type: USER_AUTH_SUCCESS,
        payload: authTokens
    })

}

export const logout = (): ThunkAction<Promise<void>, RootState, unknown, AnyAction> => async (dispatch: ThunkDispatch<RootState, unknown, AnyAction>): Promise<void> => {

    dispatch({
        type: USER_LOGOUT,
    });

    await storage.removeItem('persist: persist-key')


}
