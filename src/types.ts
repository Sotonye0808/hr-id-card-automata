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
  imageCrop: EmployeeImageCrop;
}

export interface EmployeeImageTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface EmployeeImageCrop {
  x: number;
  y: number;
  width: number;
  height: number;
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

export interface RawImportRow {
  rowIndex: number;
  values: string[];
  selected: boolean;
}

export type LayerType = "text" | "image" | "shape" | "barcode";

export interface TemplateLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  visible: boolean;
  locked: boolean;
  opacity: number;
  props: TextLayerProps | ImageLayerProps | ShapeLayerProps | BarcodeLayerProps;
}

export interface TextLayerProps {
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  textAlign: "left" | "center" | "right";
  lineHeight: number;
  letterSpacing: number;
}

export interface ImageLayerProps {
  src: string | null;
  objectFit: "cover" | "contain" | "fill";
  borderRadius: number;
}

export interface ShapeLayerProps {
  shapeType: "rectangle" | "circle" | "line";
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
}

export interface BarcodeLayerProps {
  format: "code128" | "qr" | "datamatrix";
  value: string;
  color: string;
  bgColor: string;
}

export interface DesignerTemplate {
  id: string;
  name: string;
  description: string;
  canvasWidth: number;
  canvasHeight: number;
  canvasColor: string;
  layers: TemplateLayer[];
  createdAt: string;
  updatedAt: string;
}

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  thumbnailUrl: string | null;
}
