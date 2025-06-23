import SharedNotificationSettings from "@/components/SharedNotificationSettings";
import React from "react";

const TeacherSettings = () => {
  return (
    <div className="w-3/5">
      <SharedNotificationSettings
        title="Настройки преподавателя"
        subtitle="Управляйте настройками уведомлений преподавателя"
      />
    </div>
  );
};

export default TeacherSettings;
