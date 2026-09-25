import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "./client";

export type BulkModule =
  | "students"
  | "teachers"
  | "parents"
  | "transactions";

export type ImportPreviewResponse = {
  previewId: string;
  sample: Record<string, unknown>[];
  summary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    errors: Array<{
      row: number;
      field?: string;
      message: string;
    }>;
  };
};

type PreviewApiResponse = {
  message: string;
  data: ImportPreviewResponse;
};

export const bulkImportServices = {
  downloadTemplate: async (module: BulkModule) => {
    return api.get(`/admin/bulk/${module}/template`, {
      responseType: "blob",
    });
  },

  preview: async (
    module: BulkModule,
    formData: FormData
  ): Promise<ImportPreviewResponse> => {
    const baseURL = "http://10.81.51.200:3000/api";

    // Read the same token used by your Axios interceptor.
    const persistedUserDetails =
      await AsyncStorage.getItem("userStore");

    let accessToken: string | undefined;

    if (persistedUserDetails) {
      const parsed = JSON.parse(persistedUserDetails);
      accessToken = parsed?.state?.accessToken;
    }

    const uploadURL =
      `${baseURL}/admin/bulk/${module}/preview`;

    console.log("NATIVE UPLOAD URL:", uploadURL);
    console.log("HAS ACCESS TOKEN:", Boolean(accessToken));

    const response = await fetch(uploadURL, {
      method: "POST",
      headers: {
        Accept: "application/json",

        // Same authentication header as your Axios client.
        ...(accessToken
          ? { "x-access-token": accessToken }
          : {}),
      },

      // IMPORTANT:
      // Do not set Content-Type manually.
      // Fetch creates the multipart boundary.
      body: formData,
    });

    const responseText = await response.text();



    let result: PreviewApiResponse | {
      message?: string;
    };

    try {
      result = JSON.parse(responseText);
    } catch {
      throw new Error(
        `Server returned an invalid response (${response.status}): ${responseText}`
      );
    }

    if (!response.ok) {
      throw new Error(
        result.message ||
          `Upload failed with status ${response.status}`
      );
    }

    if (!("data" in result) || !result.data) {
      throw new Error(
        "Preview data is missing from the server response"
      );
    }

    return result.data;
  },

  commit: async (
    module: BulkModule,
    previewId: string
  ) => {
    if (!previewId) {
      throw new Error(
        "Cannot commit: previewId is missing"
      );
    }

    const response = await api.post(
      `/admin/bulk/${module}/commit`,
      { previewId }
    );

    return response.data;
  },
};