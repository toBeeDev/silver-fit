import fs from "node:fs/promises";
import type { Benefit } from "../../src/types/benefit.js";

export interface MergeResult {
  added: string[];
  updated: string[];
  unchanged: string[];
  total: number;
}

export async function mergeBenefits(
  newBenefits: Benefit[],
  benefitsJsonPath: string,
  dryRun: boolean
): Promise<MergeResult> {
  const existingJson = await fs.readFile(benefitsJsonPath, "utf-8");
  const existing: Benefit[] = JSON.parse(existingJson);

  const existingMap = new Map<string, Benefit>();
  for (const b of existing) {
    existingMap.set(b.id, b);
  }

  const result: MergeResult = {
    added: [],
    updated: [],
    unchanged: [],
    total: 0,
  };

  for (const newBenefit of newBenefits) {
    const old = existingMap.get(newBenefit.id);

    if (!old) {
      existingMap.set(newBenefit.id, newBenefit);
      result.added.push(newBenefit.id);
    } else if (hasChanged(old, newBenefit)) {
      existingMap.set(newBenefit.id, newBenefit);
      result.updated.push(newBenefit.id);
    } else {
      result.unchanged.push(newBenefit.id);
    }
  }

  const merged = Array.from(existingMap.values()).sort((a, b) => {
    if (a.category !== b.category)
      return a.category.localeCompare(b.category, "ko");
    return a.title.localeCompare(b.title, "ko");
  });

  result.total = merged.length;

  if (!dryRun) {
    const tmpPath = benefitsJsonPath + ".tmp";
    await fs.writeFile(
      tmpPath,
      JSON.stringify(merged, null, 2) + "\n",
      "utf-8"
    );
    await fs.rename(tmpPath, benefitsJsonPath);
  }

  return result;
}

function hasChanged(existing: Benefit, incoming: Benefit): boolean {
  const normalize = (b: Benefit) => {
    const copy = { ...b, updatedAt: "" };
    return JSON.stringify(copy);
  };
  return normalize(existing) !== normalize(incoming);
}
