"use client";

import Loading from "@/components/Loading";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatPrice } from "@/lib/utils";
import { useGetTransactionsQuery } from "@/state/api";
import { useUser } from "@clerk/nextjs";
import React from "react";

const UserBilling = () => {
  const { user, isLoaded } = useUser();
  const { data: transactions, isLoading: isLoadingTransactions } = useGetTransactionsQuery(
    user?.id || "",
    { skip: !isLoaded || !user }
  );

  if (!isLoaded) return <Loading />;
  if (!user) return <div>Войдите в систему чтобы посмотреть историю платежей.</div>;

  return (
    <div className="billing">
      <div className="billing__container">
        <h2 className="billing__title">История платежей</h2>
        <div className="billing__grid">
          {isLoadingTransactions ? (
            <Loading />
          ) : (
            <Table className="billing__table">
              <TableHeader className="billing__table-header">
                <TableRow className="billing__table-header-row">
                  <TableHead className="billing__table-cell">Дата</TableHead>
                  <TableHead className="billing__table-cell">Сумма</TableHead>
                  <TableHead className="billing__table-cell">Название курса</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="billing__table-body">
                {transactions && transactions.length > 0 ? (
                  transactions.map((transaction) => (
                    <TableRow className="billing__table-row" key={transaction.transactionId}>
                      <TableCell className="billing__table-cell">
                        {new Date(transaction.dateTime).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="billing__table-cell billing__amount">
                        {formatPrice(transaction.amount)}
                      </TableCell>
                      <TableCell className="billing__table-cell">{transaction.courseTitle}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="billing__table-row">
                    <TableCell className="billing__table-cell text-center" colSpan={3}>
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

export default UserBilling;