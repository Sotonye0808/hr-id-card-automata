/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from "react";
import { Database, ImageOff } from "lucide-react";
import { CardConfig, UserData } from "../types";

interface IDCardProps {
  config: CardConfig;
  data: UserData;
}

const FONT_CLASSES: Record<string, string> = {
  "font-sans": "sheet-font-sans",
  "font-tech": "sheet-font-tech",
  "font-mono": "sheet-font-mono",
  "font-serif": "sheet-font-serif",
};

const THEME_CLASSES: Record<string, string> = {
  "#242424": "sheet-theme-paper",
  "#3B82F6": "sheet-theme-midnight",
  "#10B981": "sheet-theme-emerald",
  "#EF4444": "sheet-theme-vulcan",
  "#8B5CF6": "sheet-theme-amethyst",
};

export default function IDCard({ config, data }: IDCardProps) {
  const themeClass =
    THEME_CLASSES[config.colors.primary] ?? THEME_CLASSES["#242424"];
  const fontClass = FONT_CLASSES[config.font] ?? FONT_CLASSES["font-sans"];
  const combinedRole = [data.department, data.role].filter(Boolean).join(" • ");
  const photoStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = photoStageRef.current;

    if (!element) {
      return;
    }

    element.style.setProperty(
      "--image-scale",
      String(data.imageTransform.scale),
    );
    element.style.setProperty(
      "--image-offset-x",
      String(data.imageTransform.offsetX),
    );
    element.style.setProperty(
      "--image-offset-y",
      String(data.imageTransform.offsetY),
    );
  }, [
    data.imageTransform.offsetX,
    data.imageTransform.offsetY,
    data.imageTransform.scale,
  ]);

  return (
    <article className={`sheet-frame ${themeClass} ${fontClass}`}>
      <div className="sheet-inner">
        <div className="space-y-2">
          <p className="sheet-eyebrow">ID CARDS TO BE PRINTED</p>
          <h3 className="sheet-title">{data.fullName || "Employee Name"}</h3>
          <p className="sheet-copy">
            Printable sheet generated from the current HR template.
          </p>
        </div>

        <table className="sheet-table">
          <tbody>
            <tr>
              <td className="sheet-cell sheet-cell-name">
                <p className="sheet-name">{data.fullName || "Employee Name"}</p>
              </td>
              <td className="sheet-cell sheet-cell-id">
                <p className="sheet-id">{data.idNumber || "EMP-001"}</p>
              </td>
              <td className="sheet-cell sheet-cell-role">
                <p className="sheet-role">
                  {combinedRole || "Department • Role"}
                </p>
              </td>
            </tr>
          </tbody>
        </table>

        <div className="sheet-layout">
          <div className="sheet-photo">
            <div className="sheet-photo-stage" ref={photoStageRef}>
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt={`${data.fullName} preview`}
                  className="sheet-photo-image"
                />
              ) : (
                <div className="sheet-photo-placeholder">
                  <div className="sheet-photo-icon">
                    <ImageOff size={42} />
                  </div>
                  <div>
                    <p className="sheet-photo-title">Photo placeholder</p>
                    <p className="sheet-photo-copy">
                      Upload an employee photo to preview the print layout.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="sheet-aside">
            <div className="sheet-card-block">
              <p className="sheet-label">Issue Date</p>
              <p className="sheet-value">{data.issueDate || "YYYY-MM-DD"}</p>
            </div>

            <div className="sheet-card-block">
              <p className="sheet-label">Department</p>
              <p className="sheet-value">
                {data.department || "Department name"}
              </p>
            </div>

            <div className="sheet-card-block">
              <p className="sheet-label">Built by S.D.</p>
              <a
                href="https://github.com/sd"
                target="_blank"
                rel="noreferrer noopener"
                className="sheet-link">
                View developer profile
              </a>
            </div>
          </div>
        </div>

        <div className="sheet-footer">
          <span className="font-mono">{data.idNumber || "EMP-001"}</span>
          <span className="sheet-footer-badge">
            <Database size={12} />
            Printable sample alignment
          </span>
        </div>
      </div>
    </article>
  );
}
