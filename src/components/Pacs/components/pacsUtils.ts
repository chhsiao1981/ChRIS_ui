import { getPACSSeriesList } from "../../../api/serverApi/pacs.ts";
import type { PacsSeriesState } from "../types.ts";

/**
 * Format a birth date into YYYYMMDD format
 */
export const formatBirthDate = (birthDate: Date) => {
  if (!birthDate) return "";
  const date = new Date(birthDate);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

/**
 * Sanitize a patient name by replacing ^ with _
 */
export const sanitizePatientName = (name: string) => {
  return name.replace(/\^/g, "_");
};

/**
 * Sanitize a series description by replacing whitespace with underscores
 */
export const sanitizeSeriesDescription = (description: string) => {
  return description.trim().replace(/\s+/g, "_");
};

/**
 * Fetch the series path from the API using SeriesInstanceUID and RetrieveAETitle
 * This returns the exact path as registered in the ChRIS API
 */
export const fetchSeriesPath = async (
  series: PacsSeriesState,
): Promise<string> => {
  const { status, data, errmsg } = await getPACSSeriesList({
    SeriesInstanceUID: series.info.SeriesInstanceUID,
    pacs_identifier: series.info.RetrieveAETitle,
  });
  const items = data || [];

  if (items && items.length > 0) {
    return items[0].folder_path;
  }
  return "";
};

/**
 * Generate a feed name for a series
 */
export const generateFeedName = (series: PacsSeriesState) => {
  let nameBase = "";

  if (series.info.PatientBirthDate) {
    const formattedBirth = formatBirthDate(series.info.PatientBirthDate);
    const sanitizedName = sanitizePatientName(series.info.PatientName);
    nameBase = `${series.info.PatientID}-${sanitizedName}-${formattedBirth}`;
  } else {
    const sanitizedName = sanitizePatientName(series.info.PatientName);
    nameBase = `${series.info.PatientID}-${sanitizedName}`;
  }

  // Add series description with whitespace replaced by underscores
  const sanitizedDescription = sanitizeSeriesDescription(
    series.info.SeriesDescription,
  );
  return `${nameBase}-${sanitizedDescription}`;
};
