import {useCallback} from "react";
import FetchError from "../models/fetchError";
import {REST_PATH_AUTH} from "../constants/Constants";
import store from "../store/store";
import {useAppDispatch} from "./redux-hooks";
import {sendRequest, userAuthenticationActions} from "../store/slice/userAuthenticationSlice";

const useRefreshToken = () => {

    const refreshToken = store.getState().userAuthentication.authTokens.refreshToken;
    const dispatch = useAppDispatch()

    const fetchAuthToken = useCallback(async (): Promise<string> => {
        const APIAddress = REST_PATH_AUTH + "/web/token/refresh";
        const response = await fetch(APIAddress, {
            method: 'GET',
            headers: {
                'Authorization': refreshToken ? refreshToken : ''
            }
        });

        if (!response.ok) {
            throw new FetchError(response.status, await response.text());
        }

        const responseBody = await response.json();
        return responseBody['access_token'];
    }, [refreshToken]);

    const requestAuthTokenWithRefreshToken = useCallback(async (): Promise<string> => {
        const fetchedAuthToken = await fetchAuthToken();
        console.log('Fetched tokne: '+fetchedAuthToken)
        dispatch(userAuthenticationActions.setAccessToken(fetchedAuthToken))
        return fetchedAuthToken !== null ? fetchedAuthToken : "";
    }, [ fetchAuthToken])

    return {
        requestAuthTokenWithRefreshToken
    };
}

export default useRefreshToken;