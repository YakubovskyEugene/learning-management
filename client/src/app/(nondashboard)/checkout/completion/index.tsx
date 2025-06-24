"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import React from "react";

const CompletionPage = () => {
  return (
    <div className="completion">
      <div className="completion__content">
        <div className="completion__icon">
          <Check className="w-16 h-16" />
        </div>
        <h1 className="completion__title">ЗАВЕРШЕНО</h1>
        <p className="completion__message">
          🎉 Вы успешно приобрели курс! 🎉
        </p>
      </div>
      <div className="completion__support">
        <p>
          Нужна помощь? Свяжитесь с нашей{" "}
          <Button variant="link" asChild className="p-0 m-0 text-primary-700">
            <a href="https://elearningindustry.com/support"> поддержки</a>
          </Button>
          .
        </p>
      </div>
      <div className="completion__action">
        <Link href="user/courses" scroll={false}>
          Перейти к курсам
        </Link>
      </div>
    </div>
  );
};

export default CompletionPage;
