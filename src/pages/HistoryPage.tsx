import React, {useEffect, useState} from "react";
import HistoryNavigation from "../components/history/HistoryNavigation";
import OperationsList from "../components/history/OperationsList";
import ExchangeList from "../components/history/ExchangeList";
import {ExchangeType} from "../models/custom-types/ExchangeType";
import {DetailedTransactionType} from "../models/custom-types/DetailedTransactionType";
import useFetch, {RequestConfig} from "../hook/use-fetch";
import {SuccessfulRegistrationType} from "../models/custom-types/SuccessfulRegistrationType";

const HistoryPage = () => {
    const {isLoading, error, sendRequest: registerRequest} = useFetch();

    useEffect(
        ()=>{
            if (!!error) {
               alert("error")
            }
        }, [error])


   const get =()=> {
       const getCurrencyExchangeRequest: RequestConfig = {
           url: "http://localhost:8082/api/exchange/all",
           method: "GET",
           body: {},
           headers: {
               // 'Content-Type': 'application/json'
           }
       }

       registerRequest(getCurrencyExchangeRequest, (response: SuccessfulRegistrationType) => {
               alert("sykces")
               console.log(response)
           }
       );
   }


    const exchangeHistory :ExchangeType[] = [
        { bought : 400, boughtCurrency :'USD', sold : 400, soldCurrency : 'PLN', date : new Date(2022,0O5,12)},
        { bought : 400, boughtCurrency :'USD', sold : 400, soldCurrency : 'PLN', date : new Date(2022,0O5,12)},
    ]

    const recentTransfers :DetailedTransactionType[] =[
        {title : 'Spotify', date :new Date(2022,0O5,12), amount : 20.00, currency :'PLN',  status : 'completed',receiver: 'Mike',balanceAfterTransfer :1234.67,accountCurrency :'USD'},
        {title : 'Dziwki', date :new Date(2022,0O5,12), amount : -120.00, currency :'CHF',  status : 'completed',receiver: 'Mike',balanceAfterTransfer :1234.67,accountCurrency :'USD'},
        {title : 'Spotify', date :new Date(2022,0O5,12), amount : 20.00, currency :'PLN',  status : 'completed',receiver: 'Mike',balanceAfterTransfer :1234.67,accountCurrency :'USD'},

    ]


    const [currentlyBrowsing, setCurrentlyBrowsing] = useState('transfers');

    const handleBrowsingChange = (event: React.SyntheticEvent, newCurrent: string) => {
        get()
        setCurrentlyBrowsing(newCurrent);
    };

    const returnHistory = () => {
        if (currentlyBrowsing === 'transfers') {
            return <OperationsList  history={recentTransfers}/>
        }else{
            return <ExchangeList history={exchangeHistory}/>
        }
    }

    return (
        <>
            <HistoryNavigation currentlyBrowsing={currentlyBrowsing} handleBrowsingChange={handleBrowsingChange}/>
            {returnHistory()}

        </>
    );
};

export default HistoryPage;
