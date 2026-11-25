/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GasService {
  id: string;
  semCascoId: string;
  name: string;
  badge?: string;
  description: string;
  detailedDesc?: string;
  image?: string;
  priceRefill: number;
  priceWithoutShell: number;
}

export interface SafetyTip {
  id: string;
  step: string;
  title: string;
  desc: string;
}
