import React, { useState } from 'react';
import { Platform } from 'react-native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../theme/colors';
import { bulkImportServices, BulkModule, ImportPreviewResponse } from '../../services/bulkImportServices';

export default function BulkImportScreen() {
  const [module, setModule] = useState<BulkModule>('students');
  const [fileName, setFileName] = useState('No file selected');
  const [preview, setPreview] = useState<ImportPreviewResponse | null>(null);
  const [busy, setBusy] = useState(false);

  

const chooseFile = async () => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      // Android file providers may use different MIME types
      // for CSV files, so allow all files and validate below.
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (
      result.canceled ||
      !result.assets ||
      result.assets.length === 0
    ) {
      return;
    }

    const asset = result.assets[0];



    if (!asset.uri) {
      throw new Error("Selected file does not have a URI");
    }

    if (!asset.name) {
      throw new Error("Selected file does not have a name");
    }

    const selectedFileName = asset.name.toLowerCase();

    const isCsv = selectedFileName.endsWith(".csv");
    const isXlsx = selectedFileName.endsWith(".xlsx");
    const isXls = selectedFileName.endsWith(".xls");

    if (!isCsv && !isXlsx && !isXls) {
      Alert.alert(
        "Unsupported file",
        "Please select a CSV, XLS, or XLSX file."
      );
      return;
    }

    setFileName(asset.name);
    setBusy(true);
    setPreview(null);

    const formData = new FormData();

    if (Platform.OS === "web") {
      const browserFile = (asset as any).file;

      if (!browserFile) {
        throw new Error("Browser file object is missing");
      }

      formData.append(
        "file",
        browserFile,
        asset.name
      );
    } else {
      let mimeType = "application/octet-stream";

      if (isCsv) {
        mimeType = "text/csv";
      } else if (isXlsx) {
        mimeType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      } else if (isXls) {
        mimeType = "application/vnd.ms-excel";
      }

      formData.append("file", {
        uri: asset.uri,
        name: asset.name,
        type: mimeType,
      } as any);
    }


    const previewResult =
      await bulkImportServices.preview(
        module,
        formData
      );


    setPreview(previewResult);
  } catch (error: any) {
    console.error("Bulk upload error:", error);

    Alert.alert(
      "Upload failed",
      error?.message ||
        "Unable to preview the selected file."
    );
  } finally {
    setBusy(false);
  }
};


  const commit = async () => {
  if (!preview) {
    Alert.alert("Error", "No preview available.");
    return;
  }

  const previewId = preview.previewId;


  if (!previewId) {
    Alert.alert(
      "Error",
      "Preview ID is missing. Please upload the file again."
    );
    return;
  }

  if (preview.summary.invalidRows > 0) {
    Alert.alert(
      "Validation errors",
      "Please fix the invalid rows before importing."
    );
    return;
  }

  setBusy(true);

  try {
    await bulkImportServices.commit(
      module,
      previewId
    );

    Alert.alert(
      "Import completed",
      `${preview.summary.validRows} rows imported successfully.`
    );

    setPreview(null);
    setFileName("No file selected");
  } catch (error: any) {


  const message =
    error?.response?.data?.message ||
    error?.message ||
    "An unexpected error occurred while importing students.";

  let userMessage = message;

  if (
    message.includes("Unique constraint failed") &&
    message.includes("school_id") &&
    message.includes("admission_no")
  ) {
    userMessage =
      "A student with this admission number already exists in this school.";
  }

  Alert.alert("Import Failed", userMessage, [
    { text: "OK" },
  ]);
} finally {
    setBusy(false);
  }
};

  return <ScrollView contentContainerStyle={styles.page}>
    <Text style={styles.title}>Bulk Import</Text>
    <Text style={styles.subtitle}>Upload onboarding data and validate it before saving.</Text>
    <View style={styles.moduleRow}>{(['students', 'teachers', 'parents', 'transactions'] as BulkModule[]).map(item =>
      <Pressable key={item} onPress={() => { setModule(item); setPreview(null); }} style={[styles.chip, module === item && styles.activeChip]}>
        <Text style={[styles.chipText, module === item && styles.activeChipText]}>{item.toUpperCase()}</Text>
      </Pressable>)}
    </View>
    <View style={styles.card}><Text style={styles.file}>{fileName}</Text><Pressable style={styles.primary} onPress={chooseFile} disabled={busy}><Text style={styles.primaryText}>{busy ? 'Processing...' : 'Choose CSV / Excel File'}</Text></Pressable></View>
    {/* {preview && <View style={styles.card}><Text style={styles.section}>Validation Summary</Text><Text>Total rows: {preview.totalRows}</Text><Text style={styles.success}>Valid rows: {preview.validRows}</Text><Text style={preview.invalidRows ? styles.error : styles.success}>Invalid rows: {preview.invalidRows}</Text>{(preview.errors ?? []).slice(0, 8).map((error, index) => <Text key={index} style={styles.error}>Row {error.row}: {error.field ? `${error.field} - ` : ''}{error.message}</Text>)}<Pressable style={[styles.primary, preview.invalidRows > 0 && styles.disabled]} onPress={commit} disabled={busy || preview.invalidRows > 0}><Text style={styles.primaryText}>Confirm Import</Text></Pressable></View>} */}
      {preview && (
  <View style={styles.card}>
    <Text style={styles.section}>
      Validation Summary
    </Text>

    <Text>
      Total rows: {preview.summary?.totalRows ?? 0}
    </Text>

    <Text style={styles.success}>
      Valid rows: {preview.summary?.validRows ?? 0}
    </Text>

    <Text
      style={
        (preview.summary?.invalidRows ?? 0) > 0
          ? styles.error
          : styles.success
      }
    >
      Invalid rows: {preview.summary?.invalidRows ?? 0}
    </Text>

    {(preview.summary?.errors ?? [])
      .slice(0, 8)
      .map((error, index) => (
        <Text key={index} style={styles.error}>
          Row {error.row}:{" "}
          {error.field ? `${error.field} - ` : ""}
          {error.message}
        </Text>
      ))}

    <Pressable
      style={[
        styles.primary,
        (preview.summary?.invalidRows ?? 0) > 0 &&
          styles.disabled,
      ]}
      onPress={commit}
      disabled={
        busy ||
        (preview.summary?.invalidRows ?? 0) > 0
      }
    >
      <Text style={styles.primaryText}>
        Confirm Import
      </Text>
    </Pressable>
  </View>
)}
  </ScrollView>;
}

const styles = StyleSheet.create({ page: { padding: 20, gap: 16, backgroundColor: Colors.background, flexGrow: 1 }, title: { fontSize: 28, fontWeight: '800', color: Colors.text }, subtitle: { color: Colors.subtext }, moduleRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { padding: 10, borderRadius: 20, borderWidth: 1, borderColor: Colors.border }, activeChip: { backgroundColor: Colors.brandPrimary }, chipText: { fontSize: 12, color: Colors.text }, activeChipText: { color: Colors.textOnPrimary }, card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, gap: 12 }, file: { color: Colors.subtext }, primary: { backgroundColor: Colors.brandPrimary, padding: 14, borderRadius: 12, alignItems: 'center' }, primaryText: { color: Colors.textOnPrimary, fontWeight: '800' }, disabled: { opacity: 0.4 }, section: { fontSize: 18, fontWeight: '800' }, success: { color: Colors.success }, error: { color: Colors.error } });
