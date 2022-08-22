import {Add, ArrowForward, Cached, Favorite,} from "@mui/icons-material";
import {Box, Fab, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography,} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import buttonStyles from "../../styles/ButtonStyles";
import TransferDialog from "./dialog/TransferDialog";
import AddMoneyDialog from "./dialog/AddMoneyDialog";
import AddFriendDialog from "./dialog/AddFriendDialog";
import useFetch, {RequestConfig} from "../../hook/use-fetch";
import {Link} from "react-router-dom";
import {Decimal} from "decimal.js";
import {RootState} from "../../store/store";
import {useAppDispatch, useAppSelector} from "../../hook/redux-hooks";
import AlertSnackBar, {AlertState} from "../notifications/AlertSnackBar";
import {DEFAULT_SELECTED_CURRENCY, REST_PATH_AUTH} from "../../constants/Constants";
import {SUB_ACCOUNTS_FETCH_FAILURE, SUB_ACCOUNTS_FETCH_SUCCESS} from "../../constants/AccountConstants";

export const availableCurrencies = {
    'EUR': "€",
    'USD': "$",
    'PLN': "zł",
    'CHF': "Fr",
    'GBP': "£"
};

export type AccountCurrencyBalance = {
    currency: string;
    symbol: string;
    balance: Decimal;
};

export type AccountCurrencyBalanceResponse = {
    currency: string;
    balance: Decimal;
};

export type FavoriteReceiverResponse = {
    id: number;
    name: string;
    accountNumber: string;
};

//todo handle error loading subaccounts

const TotalBalanceContent = () => {
    const [openTransferDialog, setOpenTransferDialog] = useState(false);
    const [openAddMoneyDialog, setOpenAddMoneyDialog] = useState(false);
    const [openAddFriendDialog, setOpenAddFriendDialog] = useState(false);
    const [subAccountsLoaded, setSubAccountsLoaded] = useState(false);
    const [successAlertState, setSuccessAlertState] = useState<AlertState>({
        isOpen: false,
        message: ''
    });
    const [errorAlertState, setErrorAlertState] = useState<AlertState>({
        isOpen: false,
        message: ''
    });
    const [favoriteReceiversList, setFavoriteReceiversList] = useState<FavoriteReceiverResponse[]>([]);

    const {
        isLoading: isSubAccountsLoading,
        error: subAccountsError,
        sendRequest: sendSubAccountsRequest
    } = useFetch();
    const {
        isLoading: isFavoriteTransferReceiversLoading,
        error: favoriteTransferReceiversError,
        sendRequest: sendFavoriteTransferReceiversRequest
    } = useFetch();

    const [isAddMoneyErrorMessageOpen, setIsAddMoneyErrorMessageOpen] = useState(false);
    const [isAddMoneySuccessMessageOpen, setIsAddMoneySuccessMessageOpen] = useState(false);
    const [isAddFriendErrorMessageOpen, setIsAddFriendErrorMessageOpen] = useState(false);
    const [isAddFriendSuccessMessageOpen, setIsAddFriendSuccessMessageOpen] = useState(false);
    const [selectedCurrencyName, setSelectedCurrencyName] = useState<string>("PLN");


    const selector= useAppSelector((state :RootState)=>state.userAuthentication);
    const dispatch = useAppDispatch()

    const [accountCurrencyBalanceList, setAccountCurrencyBalanceList] = useState<AccountCurrencyBalance[]>([]);
    const [selectedCurrency, setSelectedCurrency] = useState<AccountCurrencyBalance>({
        currency: '',
        symbol: '',
        balance: new Decimal(0.00)
    });
    //default currency for transfer
    const [dialogCurrency, setDialogCurrency] = useState(selectedCurrency.currency);


    const handleTransferDialogOpen = () => {
        setOpenTransferDialog(true);
    };

    const handleAddMoneyDialogOpen = () => {
        setOpenAddMoneyDialog(true);
    };

    const handleAddFriendDialogOpen = () => {
        setOpenAddFriendDialog(true);
    };

    const addCurrencyBalance = (currencyName: string, amountToAdd: string) => {
        setAccountCurrencyBalanceList(accountCurrencyBalanceList.map(currency => currency.currency === currencyName
                                                ? {...currency, balance: Decimal.add(currency.balance, amountToAdd)} : currency))
    }

    const chargeCurrencyBalance = (currencyName: string, amountToCharge: Decimal) => {
        setAccountCurrencyBalanceList(accountCurrencyBalanceList.map(currency => currency.currency === currencyName
            ? {...currency, balance: Decimal.sub(currency.balance, amountToCharge)} : currency))
    }

    const findCurrencyByName = useCallback((selectedCurrencyName: string, loadedCurrencyBalances: AccountCurrencyBalance[]): AccountCurrencyBalance | undefined => {
        return loadedCurrencyBalances.find((accountCurrencyBalance) => {
            return accountCurrencyBalance.currency === selectedCurrencyName;
        });
    }, []);

    const handleCurrencyChange = (e: SelectChangeEvent) => {
        const selectedCurrencyName = e.target.value;
        setSelectedCurrencyName(selectedCurrencyName);
    }

    const mapSelectedCurrencyToString = (accountCurrencyBalance: AccountCurrencyBalance) => {
        return `${accountCurrencyBalance.currency} - ${accountCurrencyBalance.balance} ${accountCurrencyBalance.symbol}`;
    }


    useEffect(()=>{

        const transformSubAccounts = (currenciesBalanceObj: AccountCurrencyBalanceResponse[]) => {
            console.log(currenciesBalanceObj)
            const loadedCurrencyBalances: AccountCurrencyBalance[] = [];
            for (const key in currenciesBalanceObj) {
                console.log(key)
                loadedCurrencyBalances.push({
                    currency: currenciesBalanceObj[key].currency,
                    symbol: availableCurrencies[currenciesBalanceObj[key].currency as keyof typeof availableCurrencies],
                    balance: new Decimal(currenciesBalanceObj[key].balance)
                });
            }

            setSubAccountsLoaded(true);
            setAccountCurrencyBalanceList(loadedCurrencyBalances);
            setSelectedCurrency(findCurrencyByName(DEFAULT_SELECTED_CURRENCY, loadedCurrencyBalances)!);



            dispatch({
                type: SUB_ACCOUNTS_FETCH_SUCCESS,
                status: 200,
                payload: loadedCurrencyBalances
            })
        }

        const fetchSubAccountsRequest: RequestConfig = {
            url: REST_PATH_AUTH + '/account/currency/all'
        };

        sendSubAccountsRequest(fetchSubAccountsRequest, transformSubAccounts);

        if(subAccountsError){
            dispatch({
                type: SUB_ACCOUNTS_FETCH_FAILURE,
                error: subAccountsError,
                status: 403
            })
        }

        // dispatch(fetchSubAccounts()).then(
        //     ()=>{
        //         setAccountCurrencyBalanceList(selector['subAccounts'])
        //         setSelectedCurrency({
        //             currency: accountCurrencyBalanceList[0].currency,
        //             symbol: accountCurrencyBalanceList[0].symbol,
        //             balance: accountCurrencyBalanceList[0].balance
        //         })
        //     }
        // )
    },[findCurrencyByName, sendSubAccountsRequest,subAccountsError,setSubAccountsLoaded])


    return (
        <>

            <AlertSnackBar alertState={{"state": errorAlertState, "setState": setErrorAlertState}}
                           severity="error" />
            <AlertSnackBar alertState={{"state": successAlertState, "setState": setSuccessAlertState}}
                           severity="success" />


            <Box sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%"
            }}>
                <Box>
                    <Typography variant="h2" color="primary.main" letterSpacing="0.045em">
                        Total balance
                    </Typography>
                    <Typography variant="h2" fontWeight="200" sx={{mt: "10px"}}>
                        15.750,89 PLN
                    </Typography>
                </Box>
                <Box>
                    <FormControl
                        variant="standard"
                        sx={{
                            m: 1,
                            minWidth: "370px"
                        }}
                    >
                        <InputLabel sx={{
                            color: "primary.main",
                            fontSize: "18px"
                        }}>Currency balance</InputLabel>
                        <Select value={selectedCurrencyName} onChange={handleCurrencyChange}>
                            {accountCurrencyBalanceList.map((accountCurrencyBalance) => (
                                <MenuItem value={accountCurrencyBalance.currency}>{mapSelectedCurrencyToString(accountCurrencyBalance)}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            rowGap: "40px",
                            width: "385px"
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Fab
                                color="primary"
                                variant="extended"
                                aria-label="transfer"
                                size="large"
                                sx={buttonStyles}
                                onClick={handleAddMoneyDialogOpen}
                            >
                                <Add sx={{mr: 1}}/>
                                Add money
                            </Fab>
                            <Fab
                                color="error"
                                variant="extended"
                                aria-label="transfer"
                                size="large"
                                sx={buttonStyles}
                                onClick={handleTransferDialogOpen}
                            >
                                <ArrowForward sx={{mr: 1}}/>
                                Transfer
                            </Fab>
                        </Box>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Fab
                                component={Link}
                                to="/exchange"
                                color="primary"
                                variant="extended"
                                aria-label="transfer"
                                size="large"
                                sx={buttonStyles}
                            >
                                <Cached sx={{mr: 1}}/>
                                Exchange
                            </Fab>
                            <Fab
                                color="success"
                                variant="extended"
                                aria-label="transfer"
                                size="large"
                                sx={buttonStyles}
                                onClick={handleAddFriendDialogOpen}
                            >
                                <Favorite sx={{mr: 1}}/>
                                Add Friend
                            </Fab>
                        </Box>
                    </Box>
                </Box>
            </Box>

            {subAccountsLoaded &&
                <>
                    <TransferDialog
                        openTransferDialog={openTransferDialog}
                        setOpenTransferDialog={setOpenTransferDialog}
                        selectedCurrencyName={selectedCurrencyName}
                        setSelectedCurrencyName={setSelectedCurrencyName}
                        currencies={accountCurrencyBalanceList}
                        favoriteReceivers={favoriteReceiversList}
                        setErrorAlertState={setErrorAlertState}
                        setSuccessAlertState={setSuccessAlertState}
                        updateCurrencyBalance={chargeCurrencyBalance}
                    />
                    <AddMoneyDialog
                        openAddMoneyDialog={openAddMoneyDialog}
                        setOpenAddMoneyDialog={setOpenAddMoneyDialog}
                        selectedCurrencyName={selectedCurrencyName}
                        setSelectedCurrencyName={setSelectedCurrencyName}
                        currencies={accountCurrencyBalanceList}
                        setErrorAlertState={setErrorAlertState}
                        setSuccessAlertState={setSuccessAlertState}
                        updateCurrencyBalance={addCurrencyBalance}
                    />
                </>
            }
            <AddFriendDialog
                openAddFriendDialog={openAddFriendDialog}
                setOpenAddFriendDialog={setOpenAddFriendDialog}
                setErrorAlertState={setErrorAlertState}
                setSuccessAlertState={setSuccessAlertState}
                setFavoriteReceiversList={setFavoriteReceiversList}
            />
        </>
    );
};

export default TotalBalanceContent;
