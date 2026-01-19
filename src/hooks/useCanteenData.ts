import { useState, useEffect, useCallback } from "react";
import { DailyData } from "@/types/cantine";
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
    setData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  }, []);

  // Ajouter une nouvelle entrée
  const addEntry = useCallback((entry: DailyData) => {
    const newData = [...data, entry].sort((a, b) => a.date - b.date);
    saveData(newData);
  }, [data, saveData]);

  // Mettre à jour une entrée existante
  const updateEntry = useCallback((date: number, entry: DailyData) => {
    const newData = data.map((d) => (d.date === date ? entry : d));
    saveData(newData);
  }, [data, saveData]);

  // Supprimer une entrée
  const deleteEntry = useCallback((date: number) => {
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
