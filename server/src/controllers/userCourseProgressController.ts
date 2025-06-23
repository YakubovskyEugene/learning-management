import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import UserCourseProgress from "../models/userCourseProgressModel";
import Course from "../models/courseModel";
import { calculateOverallProgress } from "../utils/utils";
import { mergeSections } from "../utils/utils";

// Получить курсы, на которые пользователь записан
export const getUserEnrolledCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const auth = getAuth(req);

  if (!auth || auth.userId !== userId) {
    res.status(403).json({ message: "Доступ запрещён" });
    return;
  }

  try {
    const enrolledCourses = await UserCourseProgress.query("userId")
      .eq(userId)
      .exec();
    const courseIds = enrolledCourses.map((item: any) => item.courseId);
    const courses = await Course.batchGet(courseIds);
    res.json({
      message: "Курсы, на которые вы записаны, успешно получены",
      data: courses,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при получении курсов, на которые вы записаны", error });
  }
};

// Получить прогресс пользователя по курсу
export const getUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;

  try {
    const progress = await UserCourseProgress.get({ userId, courseId });
    if (!progress) {
      res
        .status(404)
        .json({ message: "Прогресс по курсу для этого пользователя не найден" });
      return;
    }
    res.json({
      message: "Прогресс по курсу успешно получен",
      data: progress,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при получении прогресса по курсу", error });
  }
};

// Обновить прогресс пользователя по курсу
export const updateUserCourseProgress = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, courseId } = req.params;
  const progressData = req.body;

  try {
    let progress = await UserCourseProgress.get({ userId, courseId });

    if (!progress) {
      // Если прогресс не существует, создать начальный прогресс
      progress = new UserCourseProgress({
        userId,
        courseId,
        enrollmentDate: new Date().toISOString(),
        overallProgress: 0,
        sections: progressData.sections || [],
        lastAccessedTimestamp: new Date().toISOString(),
      });
    } else {
      // Объединить существующий прогресс с новыми данными
      progress.sections = mergeSections(
        progress.sections,
        progressData.sections || []
      );
      progress.lastAccessedTimestamp = new Date().toISOString();
      progress.overallProgress = calculateOverallProgress(progress.sections);
    }

    await progress.save();

    res.json({
      message: "Прогресс по курсу успешно обновлён",
      data: progress,
    });
  } catch (error) {
    console.error("Ошибка при обновлении прогресса:", error);
    res.status(500).json({
      message: "Ошибка при обновлении прогресса по курсу",
      error,
    });
  }
};
