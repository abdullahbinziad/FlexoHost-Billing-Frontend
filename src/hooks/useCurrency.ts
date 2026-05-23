"use client";

import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { setCurrency, addCurrency, removeCurrency } from "@/store/slices/currencySlice";
import type { Currency } from "@/types/currency";

export const useCurrency = () => {
  const dispatch = useDispatch();
  const currency = useSelector((state: RootState) => state.currency);

  const changeCurrency = (currencyCode: string) => {
    dispatch(setCurrency(currencyCode));
  };

  const addNewCurrency = (currency: Currency) => {
    dispatch(addCurrency(currency));
  };

  const removeCurrencyCode = (currencyCode: string) => {
    dispatch(removeCurrency(currencyCode));
  };

  return {
    selectedCurrency: currency.selectedCurrency,
    availableCurrencies: currency.availableCurrencies,
    changeCurrency,
    addNewCurrency,
    removeCurrencyCode,
  };
};
