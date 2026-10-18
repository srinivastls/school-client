
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  Button,
  Dialog,
  Portal,
  Text,
  useTheme,
} from "react-native-paper";

export type AlertType = "success" | "error" | "info";

type AlertOptions = {
  title: string;
  message: string;
  type?: AlertType;
  buttonText?: string;
};

type ConfirmOptions = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
};

type DialogRequest =
  | {
      id: number;
      kind: "alert";
      title: string;
      message: string;
      type: AlertType;
      buttonText: string;
      resolve: (result: boolean) => void;
    }
  | {
      id: number;
      kind: "confirm";
      title: string;
      message: string;
      confirmText: string;
      cancelText: string;
      destructive: boolean;
      resolve: (result: boolean) => void;
    };

type ConfirmContextValue = {
  showAlert: (
    title: string,
    message: string,
    type?: AlertType
  ) => Promise<void>;

  showAlertWithOptions: (
    options: AlertOptions
  ) => Promise<void>;

  confirm: (options: ConfirmOptions) => Promise<boolean>;

  showError: (
    error: unknown,
    fallbackMessage?: string
  ) => Promise<void>;
};

const ConfirmContext =
  createContext<ConfirmContextValue | undefined>(undefined);

function getErrorMessage(
  error: unknown,
  fallbackMessage: string
): string {
  if (typeof error === "string" && error.trim()) {
    return error;
  }

  if (error && typeof error === "object") {
    const value = error as {
      message?: unknown;
      response?: {
        data?: {
          message?: unknown;
        };
      };
    };

    const apiMessage = value.response?.data?.message;

    if (typeof apiMessage === "string" && apiMessage.trim()) {
      return apiMessage;
    }

    if (typeof value.message === "string" && value.message.trim()) {
      return value.message;
    }
  }

  return fallbackMessage;
}

export function ConfirmProvider({
  children,
}: {
  children: ReactNode;
}) {
  const theme = useTheme();

  const [current, setCurrent] =
    useState<DialogRequest | null>(null);

  const queue = useRef<DialogRequest[]>([]);
  const nextId = useRef(1);

  const enqueue = useCallback(
    (request: Omit<DialogRequest, "id">): Promise<boolean> =>
      new Promise((resolve) => {
        const item = {
          ...request,
          id: nextId.current++,
          resolve,
        } as DialogRequest;

        queue.current.push(item);

        if (queue.current.length === 1) {
          setCurrent(item);
        }
      }),
    []
  );

  const finish = useCallback((result: boolean) => {
    const completed = queue.current.shift();

    // Move to the next queued dialog before resolving the caller.
    const next = queue.current[0] ?? null;
    setCurrent(next);

    completed?.resolve(result);
  }, []);

  const showAlertWithOptions = useCallback(
    async (options: AlertOptions): Promise<void> => {
      await enqueue({
        kind: "alert",
        title: options.title,
        message: options.message,
        type: options.type ?? "info",
        buttonText: options.buttonText ?? "OK",
        resolve: () => {},
      } as Omit<DialogRequest, "id">);
    },
    [enqueue]
  );

  const showAlert = useCallback(
    (
      title: string,
      message: string,
      type: AlertType = "info"
    ) =>
      showAlertWithOptions({ title, message, type }),
    [showAlertWithOptions]
  );

  const confirm = useCallback(
    (options: ConfirmOptions) =>
      enqueue({
        kind: "confirm",
        title: options.title,
        message: options.message,
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText ?? "Cancel",
        destructive: options.destructive ?? false,
        resolve: () => {},
      } as Omit<DialogRequest, "id">),
    [enqueue]
  );

  const showError = useCallback(
    (error: unknown, fallbackMessage = "Something went wrong.") =>
      showAlert(
        "Error",
        getErrorMessage(error, fallbackMessage),
        "error"
      ),
    [showAlert]
  );

  useEffect(() => {
    return () => {
      const pending = queue.current.splice(0);
      pending.forEach((request) => request.resolve(false));
    };
  }, []);

  const alertColor =
    current?.kind === "alert" && current.type === "error"
      ? theme.colors.error
      : current?.kind === "alert" && current.type === "success"
        ? "#218653"
        : theme.colors.primary;

  return (
    <ConfirmContext.Provider
      value={{
        showAlert,
        showAlertWithOptions,
        confirm,
        showError,
      }}
    >
      {children}

      <Portal>
        <Dialog
          visible={current !== null}
          onDismiss={() => finish(false)}
        >
          <Dialog.Title>
            <Text
              variant="titleLarge"
              style={{
                color:
                  current?.kind === "alert"
                    ? alertColor
                    : theme.colors.onSurface,
              }}
            >
              {current?.title ?? ""}
            </Text>
          </Dialog.Title>

          <Dialog.Content>
            <Text variant="bodyMedium">
              {current?.message ?? ""}
            </Text>
          </Dialog.Content>

          <Dialog.Actions>
            {current?.kind === "confirm" && (
              <Button onPress={() => finish(false)}>
                {current.cancelText}
              </Button>
            )}

            <Button
              textColor={
                current?.kind === "confirm" &&
                current.destructive
                  ? theme.colors.error
                  : theme.colors.primary
              }
              onPress={() =>
                finish(current?.kind === "confirm")
              }
            >
              {current?.kind === "confirm"
                ? current.confirmText
                : current?.kind === "alert"
                  ? current.buttonText
                  : "OK"}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error(
      "useConfirm must be used inside ConfirmProvider"
    );
  }

  return context;
}
