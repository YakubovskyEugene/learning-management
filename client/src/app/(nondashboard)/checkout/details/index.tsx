"use client";

import CoursePreview from "@/components/CoursePreview";
import Loading from "@/components/Loading";
import { useCurrentCourse } from "@/hooks/useCurrentCourse";
import { useSearchParams } from "next/navigation";
import React from "react";
import SignUpComponent from "@/components/SignUp";
import SignInComponent from "@/components/SignIn";

const CheckoutDetailsPage = () => {
  const { course: selectedCourse, isLoading, isError } = useCurrentCourse();
  const searchParams = useSearchParams();
  const showSignUp = searchParams.get("showSignUp") === "true";

  if (isLoading) return <Loading />;
  if (isError) return <div>Не удалось получить данные о курсе</div>;
  if (!selectedCourse) return <div>Курс не найден</div>;

  return (
    <div className="checkout-details min-h-screen flex items-center justify-center px-2 py-6">
      <div
        className="
          checkout-details__container
          flex flex-col md:flex-row gap-6 w-full max-w-5xl
          md:items-start items-stretch
        "
      >
        <div className="checkout-details__preview w-full md:w-1/2">
          <CoursePreview course={selectedCourse} />
        </div>
        <div
          className="
            checkout-details__auth
            w-full md:w-1/2
            max-w-[400px] mx-auto md:mx-0
            min-w-[0] md:min-w-[320px]
            flex items-center justify-center
          "
        >
          <div className="w-full">
            {showSignUp ? <SignUpComponent /> : <SignInComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutDetailsPage;
