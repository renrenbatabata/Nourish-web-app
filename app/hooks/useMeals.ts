"use client";

import { useState, useEffect } from "react";
import { db, storage } from "../../firebase";
import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "firebase/storage";

export type MealPhoto = {
  id: string;
  url: string;
  base64?: string; // アップロード直後の一時表示用
};

export type MealData = {
  photos: MealPhoto[];
  message: string;
  analyzed: boolean;
};

export type Meals = {
  breakfast: MealData;
  lunch: MealData;
  dinner: MealData;
};

const emptyMeal = (defaultMessage: string): MealData => ({
  photos: [],
  message: defaultMessage,
  analyzed: false,
});

export const useMeals = (uid: string | undefined, todayKey: string) => {
  const [meals, setMeals] = useState<Meals>({
    breakfast: emptyMeal("朝から脳にエネルギーを届けられたね！"),
    lunch: emptyMeal("お昼もしっかり食べられたね。体が喜んでいるよ！"),
    dinner: emptyMeal("夜ごはんも食べられたね。今日もよく頑張ったね🌙"),
  });
  const [mealsLoading, setMealsLoading] = useState(true);

  // 今日の記録をFirestoreから復元
  useEffect(() => {
    const fetchMeals = async () => {
      if (!uid) {
        setMealsLoading(false);
        return;
      }
      try {
        const docId = `${uid}_${todayKey}`;
        const snap = await getDoc(doc(db, "dailyMeals", docId));
        if (snap.exists()) {
          const data = snap.data();
          setMeals((prev) => ({
            breakfast: data.breakfast ?? prev.breakfast,
            lunch: data.lunch ?? prev.lunch,
            dinner: data.dinner ?? prev.dinner,
          }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setMealsLoading(false);
      }
    };
    fetchMeals();
  }, [uid, todayKey]);

  // Firestoreに保存（写真・メッセージ・分析済みフラグ含む）
  const saveMealsToFirestore = async (updated: Meals) => {
    if (!uid) return;
    const docId = `${uid}_${todayKey}`;
    await setDoc(
      doc(db, "dailyMeals", docId),
      {
        uid,
        date: todayKey,
        breakfast: updated.breakfast,
        lunch: updated.lunch,
        dinner: updated.dinner,
        updatedAt: Timestamp.now(),
      },
      { merge: true },
    );
  };

  // 写真をStorageにアップロードしてURLを取得
  const uploadPhoto = async (
    mealKey: keyof Meals,
    base64: string,
  ): Promise<MealPhoto> => {
    const photoId = Date.now().toString();
    const path = `meals/${uid}/${todayKey}/${mealKey}/${photoId}.jpg`;
    const storageRef = ref(storage, path);
    await uploadString(storageRef, base64, "data_url");
    const url = await getDownloadURL(storageRef);
    return { id: photoId, url };
  };

  // 写真を追加（複数枚対応）
  const addPhoto = async (mealKey: keyof Meals, base64: string) => {
    const photo = await uploadPhoto(mealKey, base64);
    setMeals((prev) => {
      const updated = {
        ...prev,
        [mealKey]: {
          ...prev[mealKey],
          photos: [...prev[mealKey].photos, photo],
          analyzed: false, // 新しい写真が追加されたら未分析に戻す
        },
      };
      saveMealsToFirestore(updated);
      return updated;
    });
  };

  // 写真を削除
  const removePhoto = (mealKey: keyof Meals, photoId: string) => {
    setMeals((prev) => {
      const updated = {
        ...prev,
        [mealKey]: {
          ...prev[mealKey],
          photos: prev[mealKey].photos.filter((p) => p.id !== photoId),
        },
      };
      saveMealsToFirestore(updated);
      return updated;
    });
  };

  // 分析結果（メッセージ）を反映
  const setMealMessage = (mealKey: keyof Meals, message: string) => {
    setMeals((prev) => {
      const updated = {
        ...prev,
        [mealKey]: { ...prev[mealKey], message, analyzed: true },
      };
      saveMealsToFirestore(updated);
      return updated;
    });
  };

  return {
    meals,
    mealsLoading,
    addPhoto,
    removePhoto,
    setMealMessage,
  };
};
