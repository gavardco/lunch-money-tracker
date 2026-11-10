import { describe, it, expect } from "vitest";
import { aggregateByMonth } from "@/utils/dataAggregation";
import { DailyData } from "@/types/cantine";

const day = (over: Partial<DailyData>): DailyData =>
  ({
    date: "05/01/2026",
    nbEnfantsALSH: null,
    nbEnfantsCantine: null,
    coutBio: null,
    coutConventionnel: null,
    coutSiqo: null,
    coutMatiereParEnfant: null,
    coutPersonnelParEnfant: null,
    ...over,
  }) as DailyData;

describe("coûts moyens par enfant (agrégation mensuelle)", () => {
  const monthly = aggregateByMonth(
    [
      day({ date: "05/01/2026", coutMatiereParEnfant: 2, coutPersonnelParEnfant: 6 }),
      day({ date: "06/01/2026", coutMatiereParEnfant: 4 }),
      day({ date: "10/02/2026", coutMatiereParEnfant: 10 }),
    ],
    "all"
  );

  it("moyenne Coût MAT./ENFANT de janvier = moyenne des journées renseignées", () => {
    const jan = monthly.find((m) => m.monthIndex === 0)!;
    expect(jan.nbJoursCoutMatiere).toBe(2);
    expect(jan.coutMatiereParEnfant).toBeCloseTo(3, 5);
  });

  it("moyenne Coût PERS./ENFANT ignore les journées sans frais personnel", () => {
    const jan = monthly.find((m) => m.monthIndex === 0)!;
    expect(jan.nbJoursCoutPersonnel).toBe(1);
    expect(jan.coutPersonnelParEnfant).toBeCloseTo(6, 5);
  });

  it("un mois sans donnée reste à 0", () => {
    const mar = monthly.find((m) => m.monthIndex === 2)!;
    expect(mar.nbJoursCoutMatiere).toBe(0);
    expect(mar.coutMatiereParEnfant).toBe(0);
    expect(mar.coutPersonnelParEnfant).toBe(0);
  });
});
