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
  role: string;
  idNumber: string;
  imageUrl: string | null;
  issueDate: string;
}
