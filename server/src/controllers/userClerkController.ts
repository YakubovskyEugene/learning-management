import { Request, Response } from "express";
import { clerkClient } from "../index";

// Обновить данные пользователя Clerk  h
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  const userData = req.body;
  try {
    const user = await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        userType: userData.publicMetadata.userType,
        settings: userData.publicMetadata.settings,
      },
    });

    res.json({ message: "Пользователь успешно обновлён", data: user });
  } catch (error) {
    res.status(500).json({ message: "Ошибка при обновлении пользователя", error });
  }
};
