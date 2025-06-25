import { Request, Response } from "express";
import Course from "../models/courseModel";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";

const s3 = new AWS.S3();

export const listCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { category, teacherView } = req.query;
  const { userId } = getAuth(req);

  try {
    let courses;
    if (teacherView && userId) {
      // Возвращаем все курсы преподавателя, включая черновики, если teacherView=true
      courses = await Course.scan("teacherId")
        .eq(userId)
        .exec();
    } else {
      // Для всех остальных случаев (например, студентов) возвращаем только опубликованные курсы
      courses =
        category && category !== "all"
          ? await Course.scan("category")
              .eq(category)
              .where("status")
              .eq("Published")
              .exec()
          : await Course.scan()
              .where("status")
              .eq("Published")
              .exec();
    }

    res.json({ message: "Курсы успешно получены", data: courses });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении курсов", error });
  }
};

export const getCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Курс не найден" });
      return;
    }

    res.json({ message: "Курс успешно получен", data: course });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении курса", error });
  }
};

export const createCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      teacherId,
      teacherName,
      title,
      description,
      category,
      price,
      level,
      status,
      sections,
      enrollments,
    } = req.body;

    if (!teacherId || !teacherName) {
      res.status(400).json({ message: "Необходимо указать ID и имя преподавателя" });
      return;
    }

    const newCourse = new Course({
      courseId: uuidv4(),
      teacherId,
      teacherName,
      title: title || "Новый курс",
      description: description || "",
      category: category || "Без категории",
      image: "",
      price: price || 0,
      level: level || "Beginner",
      status: status || "Draft",
      sections: sections || [],
      enrollments: enrollments || [],
    });
    await newCourse.save();

    res.json({ message: "Курс успешно создан", data: newCourse });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при создании курса", error });
  }
};

export const updateCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Курс не найден" });
      return;
    }

    if (course.teacherId !== userId) {
      res
        .status(403)
        .json({ message: "Нет прав для изменения этого курса" });
      return;
    }

    const formData = req.body as FormData; // Приводим к FormData
    const updateData: any = {};

    // Извлекаем данные из FormData
    for (const [key, value] of formData.entries()) {
      if (key === "coursePrice") {
        const price = parseInt(value as string);
        if (isNaN(price)) {
          res.status(400).json({
            message: "Некорректный формат цены",
            error: "Цена должна быть числом",
          });
          return;
        }
        updateData[key] = price * 100;
      } else if (key === "sections") {
        const sectionsData = JSON.parse(value as string);
        updateData[key] = sectionsData.map((section: any) => ({
          ...section,
          sectionId: section.sectionId || uuidv4(),
          chapters: section.chapters.map((chapter: any) => ({
            ...chapter,
            chapterId: chapter.chapterId || uuidv4(),
          })),
        }));
      } else {
        updateData[key] = value;
      }
    }

    console.log("Обновляемые данные:", updateData); // Логируем данные для отладки

    Object.assign(course, updateData);
    await course.save();

    res.json({ message: "Курс успешно обновлён", data: course });
  } catch (error) {
    console.error("Ошибка на сервере:", error);
    res.status(500).json({ message: "Ошибка при обновлении курса", error });
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { courseId } = req.params;
  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Курс не найден" });
      return;
    }

    if (course.teacherId !== userId) {
      res
        .status(403)
        .json({ message: "Нет прав для удаления этого курса" });
      return;
    }

    await Course.delete(courseId);

    res.json({ message: "Курс успешно удалён", data: course });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении курса", error });
  }
};

export const getUploadVideoUrl = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { fileName, fileType } = req.body;

  if (!fileName || !fileType) {
    res.status(400).json({ message: "Необходимо указать имя и тип файла" });
    return;
  }

  try {
    const uniqueId = uuidv4();
    const s3Key = `videos/${uniqueId}/${fileName}`;

    const s3Params = {
      Bucket: process.env.S3_BUCKET_NAME || "",
      Key: s3Key,
      Expires: 60,
      ContentType: fileType,
    };

    const uploadUrl = s3.getSignedUrl("putObject", s3Params);
    const videoUrl = `${process.env.CLOUDFRONT_DOMAIN}/videos/${uniqueId}/${fileName}`;

    res.json({
      message: "Ссылка для загрузки успешно сгенерирована",
      data: { uploadUrl, videoUrl },
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при генерации ссылки для загрузки", error });
  }
};
