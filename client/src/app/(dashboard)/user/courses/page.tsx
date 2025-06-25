"use client";

import Toolbar from "@/components/Toolbar";
import CourseCard from "@/components/CourseCard";
import { useGetUserEnrolledCoursesQuery } from "@/state/api";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useUser } from "@clerk/nextjs";
import { useState, useMemo } from "react";
import Loading from "@/components/Loading";

const Courses = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: courses,
    isLoading,
    isError,
  } = useGetUserEnrolledCoursesQuery(user?.id ?? "", {
    skip: !isLoaded || !user,
  });

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

  const handleGoToCourse = (course: Course) => {
    if (
      course.sections &&
      course.sections.length > 0 &&
      course.sections[0].chapters.length > 0
    ) {
      const firstChapter = course.sections[0].chapters[0];
      router.push(
        `/user/courses/${course.courseId}/chapters/${firstChapter.chapterId}`,
        {
          scroll: false,
        }
      );
    } else {
      router.push(`/user/courses/${course.courseId}`, {
        scroll: false,
      });
    }
  };

  if (!isLoaded || !user) return <div>Войдите в систему чтобы просмотреть ваши курсы.</div>;

  return (
    <div className="user-courses">
      <Header title="Мои курсы" subtitle="Просмотрите ваши приобретенные курсы" />
      <Toolbar onSearch={setSearchTerm} onCategoryChange={setSelectedCategory} />
      <div className="user-courses__grid">
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <p>Данные курсов временно недоступны. Попробуйте позже.</p>
        ) : filteredCourses.length === 0 ? (
          <p>Вы ещё не записаны ни на один курс.</p>
        ) : (
          filteredCourses.map((course) => (
            <CourseCard
              key={course.courseId}
              course={course}
              onGoToCourse={handleGoToCourse}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Courses;
