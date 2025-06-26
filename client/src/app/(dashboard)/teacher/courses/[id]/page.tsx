"use client";

import { CustomFormField } from "@/components/CustomFormField";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { courseSchema } from "@/lib/schemas";
import {
  centsToDollars,
  createCourseFormData,
  uploadAllVideos,
} from "@/lib/utils";
import { openSectionModal, setSections } from "@/state";
import {
  useGetCourseQuery,
  useUpdateCourseMutation,
  useGetUploadVideoUrlMutation,
} from "@/state/api";
import { useAppDispatch, useAppSelector } from "@/state/redux";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import DroppableComponent from "./Droppable";
import ChapterModal from "./ChapterModal";
import SectionModal from "./SectionModal";
import { toast } from "sonner";

const CourseEditor = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { data: course, isLoading, refetch } = useGetCourseQuery(id);
  const [updateCourse] = useUpdateCourseMutation();
  const [getUploadVideoUrlTrigger] = useGetUploadVideoUrlMutation();

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
      console.log("Данные формы перед отправкой:", data);
      const updatedSections = await uploadAllVideos(sections, id, (args) =>
        getUploadVideoUrlTrigger(args).unwrap()
      );
      console.log("Обновлённые секции после uploadAllVideos:", updatedSections);

      const courseData = createCourseFormData(data, updatedSections);
      console.log("Данные для отправки:", courseData);

      const response = await updateCourse({
        courseId: id,
        data: courseData,
      }).unwrap();
      console.log("Ответ от сервера:", response);

      toast.success("Курс успешно обновлён");
      refetch();
    } catch (error) {
      console.error("Ошибка при обновлении курса (подробности):", error);
      if (error instanceof Error) {
        toast.error(`Ошибка: ${error.message}`);
        console.error("Стек вызовов:", error.stack);
      } else {
        toast.error("Неизвестная ошибка при обновлении курса");
        console.error("Неизвестная ошибка:", error);
      }
    }
  };

  return (
    <div>
      <div className="flex items-center gap-5 mb-5">
        <button
          className="flex items-center border border-customgreys-dirtyGrey rounded-lg p-2 gap-2 cursor-pointer hover:bg-customgreys-dirtyGrey hover:text-white-100 text-customgreys-dirtyGrey"
          onClick={() => router.push("/teacher/courses", { scroll: false })}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Вернуться к курсам</span>
        </button>
      </div>

      <Form {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Header
            title="Настройка курса"
            subtitle="Заполните все поля и сохраните курс"
            rightElement={
              <div className="flex items-center space-x-4">
                <CustomFormField
                  name="courseStatus"
                  label={methods.watch("courseStatus") ? "Опубликован" : "Черновик"}
                  type="switch"
                  className="flex items-center space-x-2"
                  labelClassName={`text-sm font-medium ${
                    methods.watch("courseStatus")
                      ? "text-green-500"
                      : "text-yellow-500"
                  }`}
                  inputClassName="data-[state=checked]:bg-green-500"
                />
                <Button
                  type="submit"
                  className="bg-primary-700 hover:bg-primary-600"
                >
                  {methods.watch("courseStatus")
                    ? "Обновить опубликованный курс"
                    : "Сохранить черновик"}
                </Button>
              </div>
            }
          />

          <div className="flex justify-between md:flex-row flex-col gap-10 mt-5 font-dm-sans">
            <div className="basis-1/2">
              <div className="space-y-4">
                <CustomFormField
                  name="courseTitle"
                  label="Название курса"
                  type="text"
                  placeholder="Введите название курса"
                  className="border-none"
                  initialValue={course?.title}
                />

                <CustomFormField
                  name="courseDescription"
                  label="Описание курса"
                  type="textarea"
                  placeholder="Введите описание курса"
                  initialValue={course?.description}
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
                    {
                      value: "artificial-intelligence",
                      label: "Искусственный интеллект",
                    },
                  ]}
                  initialValue={course?.category}
                />

                <CustomFormField
                  name="coursePrice"
                  label="Цена курса"
                  type="number"
                  placeholder="0"
                  initialValue={course?.price}
                />
              </div>
            </div>

            <div className="bg-customgreys-darkGrey mt-4 md:mt-0 p-4 rounded-lg basis-1/2">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-secondary-foreground">
                  Секции
                </h2>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    dispatch(openSectionModal({ sectionIndex: null }))
                  }
                  className="border-none text-primary-700 group"
                >
                  <Plus className="mr-1 h-4 w-4 text-primary-700 group-hover:white-100" />
                  <span className="text-primary-700 group-hover:white-100">
                    Добавить секцию
                  </span>
                </Button>
              </div>

              {isLoading ? (
                <p>Загрузка содержимого курса...</p>
              ) : sections.length > 0 ? (
                <DroppableComponent />
              ) : (
                <p>Секции отсутствуют</p>
              )}
            </div>
          </div>
        </form>
      </Form>

      <ChapterModal />
      <SectionModal />
    </div>
  );
};

export default CourseEditor;