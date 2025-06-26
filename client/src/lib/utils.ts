import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import * as z from "zod";
import { toast } from "sonner";
import { CourseFormData, Section, Chapter } from "@/types"; // Добавлен импорт

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(cents: number | undefined): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format((cents || 0) / 100);
}

export function dollarsToCents(dollars: string | number): number {
  const amount = typeof dollars === "string" ? parseFloat(dollars) : dollars;
  return Math.round(amount * 100);
}

export function centsToDollars(cents: number | undefined): string {
  return ((cents || 0) / 100).toString();
}

export const priceSchema = z.string().transform((val) => {
  const dollars = parseFloat(val);
  if (isNaN(dollars)) return "0";
  return dollarsToCents(dollars).toString();
});

export const countries = [
  "Австралия",
  "Австрия",
  "Азербайджан",
  "Албания",
  "Алжир",
  "Ангола",
  "Андорра",
  "Антигуа и Барбуда",
  "Аргентина",
  "Армения",
  "Афганистан",
  "Багамы",
  "Бангладеш",
  "Барбадос",
  "Бахрейн",
  "Беларусь",
  "Белиз",
  "Бельгия",
  "Бенин",
  "Болгария",
  "Боливия",
  "Босния и Герцеговина",
  "Ботсвана",
  "Бразилия",
  "Бруней",
  "Буркина-Фасо",
  "Бурунди",
  "Бутан",
  "Вануату",
  "Ватикан",
  "Великобритания",
  "Венгрия",
  "Венесуэла",
  "Восточный Тимор",
  "Вьетнам",
  "Габон",
  "Гаити",
  "Гайана",
  "Гамбия",
  "Гана",
  "Гватемала",
  "Гвинея",
  "Гвинея-Бисау",
  "Германия",
  "Гондурас",
  "Гренада",
  "Греция",
  "Грузия",
  "Дания",
  "Демократическая Республика Конго",
  "Джибути",
  "Доминика",
  "Доминиканская Республика",
  "Египет",
  "Замбия",
  "Зимбабве",
  "Израиль",
  "Индия",
  "Индонезия",
  "Иордания",
  "Ирак",
  "Иран",
  "Ирландия",
  "Исландия",
  "Испания",
  "Италия",
  "Йемен",
  "Кабо-Верде",
  "Казахстан",
  "Камбоджа",
  "Камерун",
  "Канада",
  "Катар",
  "Кения",
  "Кипр",
  "Киргизия",
  "Кирибати",
  "Китай",
  "Колумбия",
  "Коморы",
  "Конго",
  "Коста-Рика",
  "Кот-д’Ивуар",
  "Куба",
  "Кувейт",
  "Лаос",
  "Латвия",
  "Лесото",
  "Либерия",
  "Ливан",
  "Ливия",
  "Литва",
  "Лихтенштейн",
  "Люксембург",
  "Маврикий",
  "Мавритания",
  "Мадагаскар",
  "Малави",
  "Малайзия",
  "Мали",
  "Мальдивы",
  "Мальта",
  "Марокко",
  "Маршалловы Острова",
  "Мексика",
  "Микронезия",
  "Мозамбик",
  "Молдова",
  "Монако",
  "Монголия",
  "Мьянма",
  "Намибия",
  "Науру",
  "Непал",
  "Нигер",
  "Нигерия",
  "Нидерланды",
  "Никарагуа",
  "Новая Зеландия",
  "Норвегия",
  "Объединённые Арабские Эмираты",
  "Оман",
  "Пакистан",
  "Палау",
  "Панама",
  "Папуа — Новая Гвинея",
  "Парагвай",
  "Перу",
  "Польша",
  "Португалия",
  "Республика Корея",
  "Россия",
  "Руанда",
  "Румыния",
  "Сальвадор",
  "Самоа",
  "Сан-Марино",
  "Сан-Томе и Принсипи",
  "Саудовская Аравия",
  "Северная Македония",
  "Сейшелы",
  "Сенегал",
  "Сент-Винсент и Гренадины",
  "Сент-Китс и Невис",
  "Сент-Люсия",
  "Сербия",
  "Сингапур",
  "Сирия",
  "Словакия",
  "Словения",
  "Соломоновы Острова",
  "Сомали",
  "Судан",
  "Суринам",
  "США",
  "Сьерра-Леоне",
  "Таджикистан",
  "Таиланд",
  "Танзания",
  "Того",
  "Тонга",
  "Тринидад и Тобаго",
  "Тувалу",
  "Тунис",
  "Туркмения",
  "Турция",
  "Уганда",
  "Узбекистан",
  "Украина",
  "Уругвай",
  "Фиджи",
  "Филиппины",
  "Финляндия",
  "Франция",
  "Хорватия",
  "Центральноафриканская Республика",
  "Чад",
  "Черногория",
  "Чехия",
  "Чили",
  "Швейцария",
  "Швеция",
  "Шри-Ланка",
  "Эквадор",
  "Экваториальная Гвинея",
  "Эритрея",
  "Эсватини",
  "Эстония",
  "Эфиопия",
  "Южная Африка",
  "Южный Судан",
  "Ямайка",
  "Япония"
];

export const customStyles = "text-gray-300 placeholder:text-gray-500";

export function convertToSubCurrency(amount: number, factor = 100) {
  return Math.round(amount * factor);
}

export const NAVBAR_HEIGHT = 48;

export const courseCategories = [
  { value: "technology", label: "Технологии" },
  { value: "science", label: "Наука" },
  { value: "mathematics", label: "Математика" },
  { value: "artificial-intelligence", label: "Искусственный интеллект" },
] as const;

export const customDataGridStyles = {
  border: "none",
  backgroundColor: "#17181D",
  // ... остальные стили без изменений ...
};

export const createCourseFormData = (
  data: CourseFormData,
  sections: Section[]
): any => {
  const priceInCents = parseInt(data.coursePrice) * 100;
  if (isNaN(priceInCents)) {
    throw new Error("Некорректный формат цены");
  }

  return {
    title: data.courseTitle,
    description: data.courseDescription,
    category: data.courseCategory,
    price: priceInCents,
    status: data.courseStatus ? "Published" : "Draft",
    sections: sections.map((section) => ({
      ...section,
      chapters: section.chapters.map((chapter) => ({
        ...chapter,
        video: chapter.video || null,
      })),
    })),
  };
};

export const uploadAllVideos = async (
  localSections: Section[],
  courseId: string,
  getUploadVideoUrl: (args: {
    courseId: string;
    sectionId: string;
    chapterId: string;
    fileName: string;
    fileType: string;
  }) => Promise<{ uploadUrl: string; videoUrl: string }>
): Promise<Section[]> => {
  const updatedSections = await Promise.all(
    localSections.map(async (section) => {
      const updatedChapters = await Promise.all(
        section.chapters.map(async (chapter) => {
          if (chapter.video instanceof File && chapter.video.type === "video/mp4") {
            try {
              const { uploadUrl, videoUrl } = await getUploadVideoUrl({
                courseId,
                sectionId: section.sectionId,
                chapterId: chapter.chapterId,
                fileName: chapter.video.name,
                fileType: chapter.video.type,
              });
              await fetch(uploadUrl, {
                method: "PUT",
                headers: {
                  "Content-Type": chapter.video.type,
                },
                body: chapter.video,
              });
              toast.success(`Видео успешно загружено для главы ${chapter.chapterId}`);

              return { ...chapter, video: videoUrl };
            } catch (error) {
              console.error(`Не удалось загрузить видео для главы ${chapter.chapterId}:`, error);
              return { ...chapter, video: null };
            }
          }
          return chapter;
        })
      );
      return { ...section, chapters: updatedChapters };
    })
  );
  return updatedSections;
};

async function uploadVideo(
  chapter: Chapter,
  courseId: string,
  sectionId: string,
  getUploadVideoUrl: (args: {
    courseId: string;
    sectionId: string;
    chapterId: string;
    fileName: string;
    fileType: string;
  }) => Promise<{ uploadUrl: string; videoUrl: string }>
) {
  const file = chapter.video as File;

  try {
    const { uploadUrl, videoUrl } = await getUploadVideoUrl({
      courseId,
      sectionId,
      chapterId: chapter.chapterId,
      fileName: file.name,
      fileType: file.type,
    });
    await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": file.type,
      },
      body: file,
    });
    toast.success(`Видео успешно загружено для главы ${chapter.chapterId}`);

    return { ...chapter, video: videoUrl };
  } catch (error) {
    console.error(`Не удалось загрузить видео для главы ${chapter.chapterId}:`, error);
    throw error;
  }
}