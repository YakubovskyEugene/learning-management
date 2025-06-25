"use client";

import { CustomFormField } from "@/components/CustomFormField";
import CustomModal from "@/components/CustomModal";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CourseFormData, courseSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface CourseCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourseFormData) => void;
}

const CourseCreateModal = ({ isOpen, onClose, onSubmit }: CourseCreateModalProps) => {
  const methods = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseTitle: "",
      courseDescription: "",
      courseCategory: "",
      coursePrice: "0",
      courseStatus: false,
    },
  });

  const handleSubmit = (data: CourseFormData) => {
    onSubmit(data);
    onClose();
    toast.success("Курс успешно создан!");
  };

  return (
    <CustomModal isOpen={isOpen} onClose={onClose}>
      <div className="course-create-modal">
        <div className="course-create-modal__header">
          <h2 className="course-create-modal__title">Создать новый курс</h2>
          <button onClick={onClose} className="course-create-modal__close">
            <X className="w-6 h-6" />
          </button>
        </div>

        <Form {...methods}>
          <form onSubmit={methods.handleSubmit(handleSubmit)} className="course-create-modal__form">
            <CustomFormField
              name="courseTitle"
              label="Название курса"
              placeholder="Введите название курса"
            />

            <CustomFormField
              name="courseDescription"
              label="Описание курса"
              type="textarea"
              placeholder="Введите описание курса"
            />

            <CustomFormField
              name="courseCategory"
              label="Категория курса"
              type="select"
              placeholder="Выберите категорию"
              options={[
                { value: "technology", label: "Технологии" },
                { value: "science", label: "Наука" },
                { value: "mathematics", label: "Математика" },
                { value: "Artificial Intelligence", label: "Искусственный интеллект" },
              ]}
            />

            <CustomFormField
              name="coursePrice"
              label="Цена курса"
              type="number"
              placeholder="0"
            />

            <div className="course-create-modal__actions">
              <Button type="button" variant="outline" onClick={onClose}>
                Отмена
              </Button>
              <Button type="submit" className="bg-primary-700">
                Создать
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </CustomModal>
  );
};

export default CourseCreateModal;