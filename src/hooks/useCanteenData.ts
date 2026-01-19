import { useState, useEffect, useCallback } from "react";
import { DailyData, parseFrenchDate } from "@/types/cantine";
import { sampleData } from "@/data/sampleData";

const STORAGE_KEY = "cantine_data";

export const useCanteenData = () => {
  const [data, setData] = useState<DailyData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  // Charger les données au démarrage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
      } catch {
        // Si erreur, utiliser les données d'exemple
        setData(sampleData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      }
    } else {
      // Premier chargement : utiliser les données d'exemple
      setData(sampleData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
    }
  }, []);

  // Sauvegarder à chaque modification
  const saveData = useCallback((newData: DailyData[]) => {
    // Trier par date
    const sortedData = [...newData].sort((a, b) => {
      const dateA = parseFrenchDate(a.date);
      const dateB = parseFrenchDate(b.date);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
    setData(sortedData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedData));
  }, []);

  // Ajouter une nouvelle entrée
  const addEntry = useCallback((entry: DailyData) => {
    const newData = [...data, entry];
    saveData(newData);
  }, [data, saveData]);

  // Mettre à jour une entrée existante
  const updateEntry = useCallback((originalDate: string, entry: DailyData) => {
    const newData = data.map((d) => (d.date === originalDate ? entry : d));
    saveData(newData);
  }, [data, saveData]);

  // Supprimer une entrée
  const deleteEntry = useCallback((date: string) => {
    const newData = data.filter((d) => d.date !== date);
    saveData(newData);
  }, [data, saveData]);

  // Réinitialiser avec les données d'exemple
  const resetToSample = useCallback(() => {
    saveData(sampleData);
  }, [saveData]);

  return {
    data,
    selectedMonth,
    setSelectedMonth,
    addEntry,
    updateEntry,
    deleteEntry,
    resetToSample,
  };
};
