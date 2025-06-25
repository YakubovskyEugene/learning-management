"use client";

import Header from "@/components/Header";
import Loading from "@/components/Loading";
import TeacherCourseCard from "@/components/TeacherCourseCard";
import Toolbar from "@/components/Toolbar";
import { Button } from "@/components/ui/button";
import {
  useCreateCourseMutation,
  useDeleteCourseMutation,
  useGetCoursesQuery,
} from "@/state/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

const Courses = () => {
  const router = useRouter();
  const { user } = useUser();
  const {
    data: courses,
    isLoading,
    isError,
  } = useGetCoursesQuery({ category: "all" });

  const [createCourse] = useCreateCourseMutation();
  const [deleteCourse] = useDeleteCourseMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter((course) => {
      const matchesSearch = course.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchTerm, selectedCategory]);

  const handleEdit = (course: Course) => {
    router.push(`/teacher/courses/${course.courseId}`, {
      scroll: false,
    });
  };

  const handleDelete = async (course: Course) => {
    if (window.confirm("Вы уверены, что хотите удалить этот курс?")) {
      await deleteCourse(course.courseId).unwrap();
    }
  };

const handleCreateCourse = async () => {
  if (!user) return;

  try {
    const result = await createCourse({
      teacherId: user.id,
      teacherName: user.fullName || "Неизвестный преподаватель",
    }).unwrap();
    // Проверяем, что курс создан, и только тогда переходим
    const checkCourse = await api
      .endpoints.getCourse.initiate(result.courseId, { forceRefetch: true })
      .unwrap();
    if (checkCourse) {
      router.push(`/teacher/courses/${result.courseId}`, {
        scroll: false,
      });
    } else {
      toast.error("Не удалось загрузить новый курс. Попробуйте ещё раз.");
    }
  } catch (error) {
    toast.error("Ошибка при создании курса");
  }
};

  if (isLoading) return <Loading />;

  return (
    <div className="teacher-courses">
      <Header
        title="Курсы"
        subtitle="Просмотрите ваши курсы"
        rightElement={
          <Button onClick={handleCreateCourse} className="teacher-courses__header">
            Создать курс
          </Button>
        }
      />
      <Toolbar onSearch={setSearchTerm} onCategoryChange={setSelectedCategory} />
      <div className="teacher-courses__grid">
        {isError ? (
          <p>Данные курсов временно недоступны. Вы можете продолжить создание курса.</p>
        ) : filteredCourses.length === 0 ? (
          <p>У вас пока нет курсов. Начните с создания нового!</p>
        ) : (
          filteredCourses.map((course) => (
            <TeacherCourseCard
              key={course.courseId}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
              isOwner={course.teacherId === user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;