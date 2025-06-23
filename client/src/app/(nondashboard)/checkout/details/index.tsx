"use client";

import CoursePreview from "@/components/CoursePreview";
import { CustomFormField } from "@/components/CustomFormField";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { GuestFormData, guestSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import React from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import SignUpComponent from "@/components/SignUp";
import SignInComponent from "@/components/SignIn";

const CheckoutDetailsPage = () => {
  const { course: selectedCourse, isLoading, isError } = useCurrentCourse();
  const searchParams = useSearchParams();
  const showSignUp = searchParams.get("showSignUp") === "true";

  const methods = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      email: "",
    },
  });

  if (isLoading) return <Loading />;
  if (isError) return <div>Не удалось получить данные о курсе</div>;
  if (!selectedCourse) return <div>Курс не найден</div>;

  return (
    <div className="checkout-details">
      <div className="checkout-details__container">
        <div className="checkout-details__preview">
          <CoursePreview course={selectedCourse} />
        </div>

        {/* Дополнительная функция */}
        <div className="checkout-details__options">
          <div className="checkout-details__guest">
            <h2 className="checkout-details__title">Покупка без регистрации</h2>
            <p className="checkout-details__subtitle">
              Введите email, чтобы получить доступ к курсу и подтверждение заказа.
              После покупки вы сможете создать аккаунт.
            </p>
            <Form {...methods}>
              <form
                onSubmit={methods.handleSubmit((data) => {
                  console.log(data);
                })}
                className="checkout-details__form"
              >
                <CustomFormField
                  name="email"
                  label="Электронная почта"
                  type="email"
                  className="w-full rounded mt-4"
                  labelClassName="font-normal text-white-50"
                  inputClassName="py-3"
                />
                <Button type="submit" className="checkout-details__submit">
                  Продолжить как гость
                </Button>
              </form>
            </Form>
          </div>

          <div className="checkout-details__divider">
            <hr className="checkout-details__divider-line" />
            <span className="checkout-details__divider-text">или</span>
            <hr className="checkout-details__divider-line" />
          </div>

          <div className="checkout-details__auth">
            {showSignUp ? <SignUpComponent /> : <SignInComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage;
