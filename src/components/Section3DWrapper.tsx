/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface Section3DWrapperProps {
  children: React.ReactNode;
  sectionColor: string;
  sectionId?: string;
  isHero?: boolean;
  className?: string;
}

export default function Section3DWrapper({
  children,
  sectionColor,
  sectionId,
  className = "",
}: Section3DWrapperProps) {
  return (
    <div
      data-section-3d={sectionId || "band"}
      data-section-color={sectionColor}
      className={`relative ${className}`}
    >
      {children}
    </div>
  );
}
