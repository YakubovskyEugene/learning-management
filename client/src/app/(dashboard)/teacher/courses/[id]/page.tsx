"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  useGetCourseQuery,
  useUpdateCourseMutation,
  useGetUploadVideoUrlMutation,
} from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/state/hooks";
import { setSections } from "@/state/slices/globalSlice";
import { CourseFormData, courseSchema } from "@/lib/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { centsToDollars } from "@/lib/utils";
import { toast } from "sonner"; // Добавили импорт
import CustomFormField from "@/components/CustomFormField";
import SectionModal from "./SectionModal";
import ChapterModal from "./ChapterModal";
import Droppable from "./Droppable";

const CourseEditor = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: course, isLoading, refetch } = useGetCourseQuery(id);
  const [updateCourse] = useUpdateCourseMutation();
  const [getUploadVideoUrl] = useGetUploadVideoUrlMutation();

  const dispatch = useAppDispatch();
  const { sections } = useAppSelector((state) => state.global.courseEditor);

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

  useEffect(() => {
    if (course) {
      methods.reset({
        courseTitle: course.title,
        courseDescription: course.description,
        courseCategory: course.category,
        coursePrice: centsToDollars(course.price),
        courseStatus: course.status === "Published",
      });
      dispatch(setSections(course.sections || []));
    }
  }, [course, methods, dispatch]);

  const onSubmit = async (data: CourseFormData) => {
    try {
      const updatedSections = await uploadAllVideos(
        sections,
        id,
        getUploadVideoUrl
      );

      const formData = createCourseFormData(data, updatedSections);

      await updateCourse({
        courseId: id,
        formData,
      }).unwrap();

      toast.success("Курс успешно обновлён"); // Теперь работает
      refetch();
    } catch (error) {
      console.error("Ошибка при обновлении курса:", error);
      if (error instanceof Error) {
        toast.error(`Ошибка: ${error.message}`);
      } else {
        toast.error("Неизвестная ошибка при обновлении курса");
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="course-editor">
      <Header
        title={course?.title || "Редактирование курса"}
        subtitle="Редактируйте ваш курс"
        rightElement={
          <Button
            type="submit"
            form="course-form"
            className="bg-primary-700 text-white hover:bg-primary-600"
          >
            Сохранить черновик
          </Button>
        }
      />
      <Form {...methods}>
        <form
          id="course-form"
          onSubmit={methods.handleSubmit(onSubmit)}
          className="course-editor__form"
        >
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
          <CustomFormField
            name="courseStatus"
            label="Статус курса"
            type="switch"
            placeholder="Опубликовать курс"
          />
          <Droppable sections={sections} courseId={id} />
        </form>
      </Form>
      <SectionModal />
      <ChapterModal />
    </div>
  );
};

export default CourseEditor;