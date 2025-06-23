import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import AccordionSections from "./AccordionSections";

const CoursePreview = ({ course }: CoursePreviewProps) => {
  const price = formatPrice(course.price);
  return (
    <div className="course-preview">
      <div className="course-preview__container">
        <div className="course-preview__image-wrapper flex justify-center">
          <Image
            src={course.image || "/placeholder.png"}
            alt="Course Preview"
            width={320}
            height={180}
            className="rounded-lg object-cover w-full max-w-[320px] h-auto"
            // Ограничиваем ширину и делаем картинку аккуратной
          />
        </div>
        <div>
          <h2 className="course-preview__title">{course.title}</h2>
          <p className="text-gray-400 text-md mb-4">Автор: {course.teacherName}</p>
          <p className="text-sm text-customgreys-dirtyGrey">
            {course.description}
          </p>
        </div>

        <div>
          <h4 className="text-white-50/90 font-semibold mb-2">
            Содержание курса
          </h4>
          <AccordionSections sections={course.sections} />
        </div>
      </div>

      <div className="course-preview__container">
        <h3 className="text-xl mb-4">Детали цены (1 товар)</h3>
        <div className="flex justify-between mb-4 text-customgreys-dirtyGrey text-base">
          <span className="font-bold">1x {course.title}</span>
          <span className="font-bold">{price}</span>
        </div>
        <div className="flex justify-between border-t border-customgreys-dirtyGrey pt-4">
          <span className="font-bold text-lg">Итого</span>
          <span className="font-bold text-lg">{price}</span>
        </div>
      </div>
    </div>
  );
};

export default CoursePreview;
