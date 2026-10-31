
type AlertType = "success" | "error" | "info";

type AlertHandler = (
  title: string,
  message: string,
  type?: AlertType
) => Promise<void>;

let alertHandler: AlertHandler | null = null;

export function registerConfirmAlert(
  handler: AlertHandler
): () => void {
  alertHandler = handler;

  return () => {
    if (alertHandler === handler) {
      alertHandler = null;
    }
  };
}

export function showGlobalAlert(
  title: string,
  message: string,
  type: AlertType = "info"
): Promise<void> {
  if (!alertHandler) {
    console.warn(
      "ConfirmProvider is not mounted. Unable to display alert:",
      title,
      message
    );

    return Promise.resolve();
  }

  return alertHandler(title, message, type);
}
