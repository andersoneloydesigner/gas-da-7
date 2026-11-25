/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GasService {
  id: string;
  name: string;
  badge?: string;
  description: string;
  detailedDesc?: string;
  image?: string;
}

export interface SafetyTip {
  id: string;
  step: string;
  title: string;
  desc: string;
}
