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

const TeacherBilling = () => {
  const [cardBrand, setCardBrand] = useState("all");
  const { user, isLoaded } = useUser();
  const { data: transactions, isLoading: isLoadingTransactions, error } = useGetTransactionsQuery(
    { userId: user?.id || "", cardBrand },
    { skip: !isLoaded || !user }
  );

  const filteredData = transactions || []; // Простая фильтрация, так как server уже фильтрует по cardBrand

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Войдите в систему чтобы посмотреть историю платежей.</div>;
  if (error) return <div>Ошибка при загрузке транзакций: {error.toString()}</div>;

  return (
    <div className="billing">
      <div className="billing__container">
        <h2 className="billing__title">История платежей</h2>
        <div className="billing__filters">
          <Select value={cardBrand} onValueChange={setCardBrand}>
            <SelectTrigger className="billing__select">
              <SelectValue placeholder="Бренд карты" />
            </SelectTrigger>
            <SelectContent className="billing__select-content">
              <SelectItem className="billing__select-item" value="all">Все карты</SelectItem>
              <SelectItem className="billing__select-item" value="visa">Visa</SelectItem>
              <SelectItem className="billing__select-item" value="mastercard">MasterCard</SelectItem>
              <SelectItem className="billing__select-item" value="amex">American Express</SelectItem>
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
                  <TableHead className="billing__table-cell">Способ оплаты</TableHead>
                  <TableHead className="billing__table-cell">Бренд карты</TableHead>
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
                        {transaction.paymentProvider}
                      </TableCell>
                      <TableCell className="billing__table-cell">
                        {transaction.cardBrand || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="billing__table-row">
                    <TableCell
                      className="billing__table-cell text-center"
                      colSpan={4}
                    >
                      Нет транзакций для отображения
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