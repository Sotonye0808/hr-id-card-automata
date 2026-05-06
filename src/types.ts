/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColorPalette {
  primary: string;
  secondary: string;
  text: string;
  accent: string;
}

export interface ElementPosition {
  x: number;
  y: number;
  size: number;
  weight?: string;
  rounded?: number;
}

export interface CardConfig {
  font: string;
  colors: ColorPalette;
  elements: {
    avatar: ElementPosition;
    title: ElementPosition;
    subtitle: ElementPosition;
    badge: ElementPosition;
  };
}

export interface UserData {
  fullName: string;
  department: string;
  role: string;
  idNumber: string;
  imageUrl: string | null;
  issueDate: string;
  imageTransform: EmployeeImageTransform;
}

export interface EmployeeImageTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface TemplateConfig {
  documentTitle: string;
  subtitle: string;
  paperBackground: string;
  paperBorder: string;
  accent: string;
  titleColor: string;
  bodyColor: string;
  labelColor: string;
  tableBorder: string;
  imageFrame: string;
  cardGap: number;
  imageHeight: number;
  creditLabel: string;
  creditUrl: string;
}

export interface EmployeeRecord extends UserData {
  id: string;
  employeeId: string;
  imageTransform: EmployeeImageTransform;
}

export interface ExportProgress {
  phase: string;
  percent: number;
  status: "idle" | "working" | "complete" | "error";
}
