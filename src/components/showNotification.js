import React, { useEffect } from "react";
import { showNotification } from "@mantine/notifications";
import Pusher from "pusher-js";

const NotificationExample = () => {
  useEffect(() => {
    const pusher = new Pusher("83f49852817c6b52294f", {
      cluster: "mt1",
    });
    const notificationChannel = pusher.subscribe("notification");
    notificationChannel.bind("new-item-created", function (data) {
      showNotification({
        color: "green",
        title: "Success",
        message: data.message,
        position: {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
        autoClose: 8000, // Adjust the duration time here (in milliseconds)
      });
    });

    return () => {
      // Unsubscribe from channels, disconnect, etc.
      pusher.disconnect();
    };
  }, []); //notification

  return <div></div>;
};

export default NotificationExample;
