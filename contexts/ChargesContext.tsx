"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  SetStateAction,
  useMemo,
} from "react";

// React Hook Form
import { useFormContext, useWatch } from "react-hook-form";

// Helpers
import { formatPriceToString } from "@/lib/helpers";

// Types
import { InvoiceType, ItemType } from "@/types";

const defaultChargesContext = {
  discountSwitch: false,
  setDiscountSwitch: (_: boolean) => {},
  taxSwitch: false,
  setTaxSwitch: (_: boolean) => {},
  shippingSwitch: false,
  setShippingSwitch: (_: boolean) => {},
  discountType: "amount",
  setDiscountType: (_: SetStateAction<string>) => {},
  taxType: "amount",
  setTaxType: (_: SetStateAction<string>) => {},
  shippingType: "amount",
  setShippingType: (_: SetStateAction<string>) => {},
  totalInWordsSwitch: true,
  setTotalInWordsSwitch: (_: boolean) => {},
  currency: "USD",
  subTotal: 0,
  totalAmount: 0,
  calculateTotal: () => {},
};

export const ChargesContext = createContext(defaultChargesContext);
export const useChargesContext = () => useContext(ChargesContext);

type ChargesContextProps = {
  children: React.ReactNode;
};

export const ChargesContextProvider = ({ children }: ChargesContextProps) => {
  const { control, setValue, getValues } = useFormContext<InvoiceType>();

  // Watch form fields
  const itemsArray = useWatch({ name: "details.items", control }) || [];
  const currency = useWatch({ name: "details.currency", control }) || "USD";
  const discount = useWatch({ name: "details.discountDetails", control }) || {
    amount: 0,
    amountType: "amount",
  };
  const tax = useWatch({ name: "details.taxDetails", control }) || {
    amount: 0,
    amountType: "amount",
  };
  const shipping =
    useWatch({ name: "details.shippingDetails", control }) || {
      cost: 0,
      costType: "amount",
    };

  // Switches
  const [discountSwitch, setDiscountSwitch] = useState<boolean>(
    !!discount.amount
  );
  const [taxSwitch, setTaxSwitch] = useState<boolean>(!!tax.amount);
  const [shippingSwitch, setShippingSwitch] = useState<boolean>(
    !!shipping.cost
  );
  const [totalInWordsSwitch, setTotalInWordsSwitch] = useState<boolean>(true);

  // Types
  const [discountType, setDiscountType] = useState(discount.amountType || "amount");
  const [taxType, setTaxType] = useState(tax.amountType || "amount");
  const [shippingType, setShippingType] = useState(shipping.costType || "amount");

  // Totals
  const [subTotal, setSubTotal] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Sync initial switches with form values
  useEffect(() => {
    setDiscountSwitch(!!discount.amount);
    setTaxSwitch(!!tax.amount);
    setShippingSwitch(!!shipping.cost);

    setDiscountType(discount.amountType || "amount");
    setTaxType(tax.amountType || "amount");
    setShippingType(shipping.costType || "amount");
  }, [discount, tax, shipping]);

  // Reset values when switches are off
  useEffect(() => {
    if (!discountSwitch) setValue("details.discountDetails.amount", 0);
    if (!taxSwitch) setValue("details.taxDetails.amount", 0);
    if (!shippingSwitch) setValue("details.shippingDetails.cost", 0);
  }, [discountSwitch, taxSwitch, shippingSwitch, setValue]);

  // Calculate total - hydration and loop safe
  useEffect(() => {
    // Normalize items
    const totalSum = itemsArray.reduce(
      (sum, item: ItemType) => sum + Number(item.total || 0),
      0
    );

    let total = totalSum;

    // Discount
    const discountAmount = Number(discount.amount || 0);
    if (discountSwitch) {
      total -= discountType === "percentage" ? (total * discountAmount) / 100 : discountAmount;
    }

    // Tax
    const taxAmount = Number(tax.amount || 0);
    if (taxSwitch) {
      total += taxType === "percentage" ? (total * taxAmount) / 100 : taxAmount;
    }

    // Shipping
    const shippingCost = Number(shipping.cost || 0);
    if (shippingSwitch) {
      total += shippingType === "percentage" ? (total * shippingCost) / 100 : shippingCost;
    }

    // Update state
    setSubTotal(totalSum);
    setTotalAmount(total);

    // Update form only if changed
    setValue("details.subTotal", totalSum);
    setValue("details.totalAmount", total);

    const totalInWords = totalInWordsSwitch ? formatPriceToString(total, currency) : "";
    if (totalInWords !== getValues("details.totalAmountInWords")) {
      setValue("details.totalAmountInWords", totalInWords);
    }
  }, [
    itemsArray.length, // safer dependency
    discountSwitch,
    discountType,
    discount?.amount,
    taxSwitch,
    taxType,
    tax?.amount,
    shippingSwitch,
    shippingType,
    shipping?.cost,
    totalInWordsSwitch,
    currency,
    setValue,
    getValues,
  ]);

  // Optional: expose calculateTotal
  const calculateTotal = useMemo(() => {
    return () => {};
  }, []);

  return (
    <ChargesContext.Provider
      value={{
        discountSwitch,
        setDiscountSwitch,
        taxSwitch,
        setTaxSwitch,
        shippingSwitch,
        setShippingSwitch,
        discountType,
        setDiscountType,
        taxType,
        setTaxType,
        shippingType,
        setShippingType,
        totalInWordsSwitch,
        setTotalInWordsSwitch,
        currency,
        subTotal,
        totalAmount,
        calculateTotal,
      }}
    >
      {children}
    </ChargesContext.Provider>
  );
};
