"use client";

import Loading from "@/components/Loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { useGetTransactionsQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import React, { useState } from "react";

// Список поддерживаемых карт для фильтра и отображения
const CARD_TYPES = ["visa", "mastercard", "amex", "discover", "jcb", "diners"];

const CARD_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  jcb: "JCB",
  diners: "Diners Club",
};

const TeacherBilling = () => {
  const [paymentType, setPaymentType] = useState("all");
  const { user, isLoaded } = useUser();
  const { data: transactions, isLoading: isLoadingTransactions, error } = useGetTransactionsQuery(
    { userId: user?.id || "", cardBrand: paymentType }, // Используем paymentType как cardBrand
    { skip: !isLoaded || !user }
  );

  // Фильтруем только транзакции по картам
  const cardTransactions =
    transactions?.filter((transaction) =>
      CARD_TYPES.includes(transaction.paymentProvider)
    ) || [];

  // Фильтрация по типу карты
  const filteredData =
    cardTransactions.filter((transaction) => {
      return (
        paymentType === "all" ||
        transaction.paymentProvider === paymentType
      );
    }) || [];

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Войдите в систему чтобы посмотреть историю платежей.</div>;
  if (error) return <div>Ошибка при загрузке транзакций: {error.toString()}</div>;

  return (
    <div className="billing">
      <div className="billing__container">
        <h2 className="billing__title">История платежей</h2>
        <div className="billing__filters">
          <Select value={paymentType} onValueChange={setPaymentType}>
            <SelectTrigger className="billing__select">
              <SelectValue placeholder="Тип карты" />
            </SelectTrigger>
            <SelectContent className="billing__select-content">
              <SelectItem className="billing__select-item" value="all">
                Все карты
              </SelectItem>
              {CARD_TYPES.map((type) => (
                <SelectItem
                  className="billing__select-item"
                  value={type}
                  key={type}
                >
                  {CARD_LABELS[type] || type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="billing__grid">
          {isLoadingTransactions ? (
            <Loading />
          ) : (
            <Table className="billing__table">
              <TableHeader className="billing__table-header">
                <TableRow className="billing__table-header-row">
                  <TableHead className="billing__table-cell">Дата</TableHead>
                  <TableHead className="billing__table-cell">Сумма</TableHead>
                  <TableHead className="billing__table-cell">Тип карты</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="billing__table-body">
                {filteredData.length > 0 ? (
                  filteredData.map((transaction) => (
                    <TableRow
                      className="billing__table-row"
                      key={transaction.transactionId}
                    >
                      <TableCell className="billing__table-cell">
                        {new Date(transaction.dateTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="billing__table-cell billing__amount">
                        {formatPrice(transaction.amount)}
                      </TableCell>
                      <TableCell className="billing__table-cell">
                        {CARD_LABELS[transaction.paymentProvider] ||
                          transaction.paymentProvider}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="billing__table-row">
                    <TableCell
                      className="billing__table-cell text-center"
                      colSpan={3}
                    >
                      Нет транзакций по картам для отображения
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherBilling;