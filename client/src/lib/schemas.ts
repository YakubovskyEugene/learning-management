import * as z from "zod";

// Схемы редактора курсов
export const courseSchema = z.object({
  courseTitle: z.string().min(1, "Требуется название"),
  courseDescription: z.string().min(1, "Требуется описание"),
  courseCategory: z.string().min(1, "Требуется категория"),
  coursePrice: z.string(),
  courseStatus: z.boolean(),
  courseImage: z.instanceof(File, { message: "Требуется изображение курса" }).refine(
    (file) => {
      const allowedExtensions = [".jpg", ".jpeg", ".png"];
      const ext = file.name.split(".").pop()?.toLowerCase();
      return ext && allowedExtensions.includes(`.${ext}`);
    },
    { message: "Поддерживаются только файлы .jpg, .jpeg, .png" }
  ),
});

export type CourseFormData = z.infer<typeof courseSchema>;

// Схемы главы
export const chapterSchema = z.object({
  title: z.string().min(2, "Название должно содержать не менее 2 символов"),
  content: z.string().min(10, "Содержимое должно содержать не менее 10 символов"),
  video: z.union([z.string(), z.instanceof(File)]).optional(),
});

export type ChapterFormData = z.infer<typeof chapterSchema>;

// Схемы секций
export const sectionSchema = z.object({
  title: z.string().min(2, "Название должно содержать не менее 2 символов"),
  description: z.string().min(10, "Описание должно содержать не менее 10 символов"),
});

export type SectionFormData = z.infer<typeof sectionSchema>;

// Схема гостевой оплаты
export const guestSchema = z.object({
  email: z.string().email("Некорректный адрес электронной почты"),
});

export type GuestFormData = z.infer<typeof guestSchema>;

// Схема настроек уведомлений
export const notificationSettingsSchema = z.object({
  courseNotifications: z.boolean(),
  emailAlerts: z.boolean(),
  smsAlerts: z.boolean(),
  notificationFrequency: z.enum(["immediate", "daily", "weekly"]),
});

export type NotificationSettingsFormData = z.infer<
  typeof notificationSettingsSchema
>;
