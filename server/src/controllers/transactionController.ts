import Stripe from "stripe";
import dotenv from "dotenv";
import { Request, Response } from "express";
import Course from "../models/courseModel";
import Transaction from "../models/transactionModel";
import UserCourseProgress from "../models/userCourseProgressModel";

dotenv.config();

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY обязательна, но не найдена в переменных окружения"
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Получить список транзакций
export const listTransactions = async (req: Request, res: Response): Promise<void> => {
  const { userId, cardBrand } = req.query;

  try {
    let query = Transaction.query("userId").eq(userId);
    if (cardBrand) {
      query = query.where("cardBrand").eq(cardBrand);
    }
    const transactions = userId ? await query.exec() : await Transaction.scan().exec();

    res.json({
      message: "Транзакции успешно получены",
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при получении транзакций", error });
  }
};

// Создать Stripe Payment Intent
export const createStripePaymentIntent = async (
  req: Request,
  res: Response
): Promise<void> => {
  let { amount } = req.body;

  if (!amount || amount <= 0) {
    amount = 50;
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    });

    res.json({
      message: "",
      data: {
        clientSecret: paymentIntent.client_secret,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при создании платежа Stripe", error });
  }
};

// Создать транзакцию и прогресс по курсу
export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  const { userId, courseId, transactionId, amount, paymentProvider } = req.body;

  try {
    const course = await Course.get(courseId);
    let provider = paymentProvider;
    let cardBrand: string | undefined;

    if (paymentProvider === "stripe" && transactionId) {
      try {
        const paymentIntent: any = await stripe.paymentIntents.retrieve(transactionId, {
          expand: ["charges", "charges.data.payment_method_details.card"],
        });
        if (
          paymentIntent?.charges?.data?.length > 0 &&
          paymentIntent.charges.data[0].payment_method_details?.card?.brand
        ) {
          cardBrand = paymentIntent.charges.data[0].payment_method_details.card.brand;
        }
      } catch (stripeErr) {
        console.error("Ошибка при получении типа карты Stripe:", stripeErr);
      }
    }

    const newTransaction = new Transaction({
      dateTime: new Date().toISOString(),
      userId,
      courseId,
      transactionId,
      amount,
      paymentProvider,
      cardBrand,
    });
    await newTransaction.save();

    // 4. Создать начальный прогресс по курсу
    const initialProgress = new UserCourseProgress({
      userId,
      courseId,
      enrollmentDate: new Date().toISOString(),
      overallProgress: 0,
      sections: course.sections.map((section: any) => ({
        sectionId: section.sectionId,
        chapters: section.chapters.map((chapter: any) => ({
          chapterId: chapter.chapterId,
          completed: false,
        })),
      })),
      lastAccessedTimestamp: new Date().toISOString(),
    });
    await initialProgress.save();

    // 5. Добавить пользователя в список записавшихся на курс
    await Course.update(
      { courseId },
      {
        $ADD: {
          enrollments: [{ userId }],
        },
      }
    );

    res.json({
      message: "Курс успешно приобретён",
      data: {
        transaction: newTransaction,
        courseProgress: initialProgress,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Ошибка при создании транзакции и записи на курс", error });
  }
};
