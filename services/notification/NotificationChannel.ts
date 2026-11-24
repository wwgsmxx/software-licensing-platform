import { db } from "@/lib/db";

export interface CreateNotificationParams {
  userId: string;
  type:
    | "APPLICATION_SUBMITTED"
    | "APPLICATION_APPROVED"
    | "APPLICATION_REJECTED"
    | "INFO_REQUESTED"
    | "LICENSE_ISSUED"
    | "EXPIRATION_WARNING";
  title: string;
  message: string;
  link?: string;
}

export interface INotificationChannel {
  name: string;
  dispatch(params: CreateNotificationParams): Promise<void>;
}

export class InAppNotificationChannel implements INotificationChannel {
  name = "InAppNotificationChannel";

  async dispatch(params: CreateNotificationParams): Promise<void> {
    try {
      await db.notification.create({
        data: {
          userId: params.userId,
          type: params.type,
          title: params.title,
          message: params.message,
          link: params.link,
        },
      });
    } catch (err) {
      console.error("Failed to create in-app notification:", err);
    }
  }
}

export const notificationChannel: INotificationChannel = new InAppNotificationChannel();
