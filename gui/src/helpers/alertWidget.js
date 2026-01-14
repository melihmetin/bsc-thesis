import { Notify, QSpinnerGears } from "quasar";

export const alertWidget = (type, message, timer = 0) => {
  switch (type) {
    case "error":
      Notify.create({
        message: message,
        color: "negative",
        icon: "mdi-alert-circle-outline",
        position: "top",
        group: false,
        timeout: timer,
        actions: [
          {
            label: "Dismiss",
            color: "white",
          },
        ],
      });
      break;

    case "success":
      Notify.create({
        message: message,
        color: "teal",
        icon: "mdi-check-circle-outline",
        position: "top",
        group: false,
        actions: [
          {
            label: "Dismiss",
            color: "white",
          },
        ],
      });
      break;

    case "welcome":
      return Notify.create({
        message: message,
        color: "blue-grey-8",
        icon: "mdi-human-greeting",
        position: "top",
        html: true,
        timeout: 0,
        group: false,
        actions: [
          {
            label: "Dismiss",
            color: "white",
          },
        ],
      });

    case "loading":
      // in this case, we want to capture the notification and destroy it upon completion
      return Notify.create({
        spinner: QSpinnerGears,
        message: message,
        group: false,
        position: "top",
        timeout: 0,

        actions: [
          {
            label: "Dismiss",
            color: "white",
          },
        ],
      });
  }
};
