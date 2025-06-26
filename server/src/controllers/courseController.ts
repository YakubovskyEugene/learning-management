import { Request, Response } from "express";
import Course from "../models/courseModel";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import { getAuth } from "@clerk/express";

const s3 = new AWS.S3();

export const listCourses = async (req: Request, res: Response): Promise<void> => {
  const { category, teacherView } = req.query;
  const { userId } = getAuth(req);

  try {
    let courses;
    if (teacherView && userId) {
      courses = await Course.scan("teacherId").eq(userId).exec();
    } else {
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

export const createCourse = async (req: Request, res: Response): Promise<void> => {
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

export const updateCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { userId } = getAuth(req);

  console.log("Request body:", JSON.stringify(req.body, null, 2));

  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Курс не найден" });
      return;
    }

    if (course.teacherId !== userId) {
      res.status(403).json({ message: "Нет прав для изменения этого курса" });
      return;
    }

    const { title, description, category, price, status, sections } = req.body;

    // Валидация полей
    if (!title || !description || !category || price == null || !status || !sections) {
      res.status(400).json({ message: "Все поля обязательны" });
      return;
    }

    // Проверка формата цены
    const priceValue = Number(price);
    if (isNaN(priceValue)) {
      res.status(400).json({ message: "Некорректный формат цены" });
      return;
    }

    // Проверка статуса
    if (!["Published", "Draft"].includes(status)) {
      res.status(400).json({ message: "Некорректный статус курса" });
      return;
    }

    // Проверка секций
    if (!Array.isArray(sections)) {
      res.status(400).json({ message: "Секции должны быть массивом" });
      return;
    }

    // Обновление данных курса
    course.title = title;
    course.description = description;
    course.category = category;
    course.price = priceValue;
    course.status = status;
    course.sections = sections.map((section: any) => ({
      ...section,
      sectionId: section.sectionId || uuidv4(),
      chapters: section.chapters.map((chapter: any) => ({
        ...chapter,
        chapterId: chapter.chapterId || uuidv4(),
      })),
    }));

    await course.save();

    res.json({ message: "Курс успешно обновлён", data: course });
  } catch (error: unknown) {
    console.error("Ошибка на сервере:", error);
    const errorMessage = error instanceof Error ? error.message : "Неизвестная ошибка";
    res.status(500).json({ message: "Ошибка при обновлении курса", error: errorMessage });
  }
};

export const deleteCourse = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { userId } = getAuth(req);

  try {
    const course = await Course.get(courseId);
    if (!course) {
      res.status(404).json({ message: "Курс не найден" });
      return;
    }

    if (course.teacherId !== userId) {
      res.status(403).json({ message: "Нет прав для удаления этого курса" });
      return;
    }

    await Course.delete(courseId);

    res.json({ message: "Курс успешно удалён", data: course });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при удалении курса", error });
  }
};

export const getUploadVideoUrl = async (req: Request, res: Response): Promise<void> => {
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