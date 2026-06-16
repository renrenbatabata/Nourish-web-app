import { useState } from "react";

export const useDateRange = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();

  const [startDate, setStartDate] = useState(`${year}-${month}-01`);
  const [endDate, setEndDate] = useState(`${year}-${month}-${lastDay}`);

  const setThisWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (day === 0 ? 6 : day - 1));
    setStartDate(monday.toISOString().split("T")[0]);
    setEndDate(today.toISOString().split("T")[0]);
  };

  const setThisMonth = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const last = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0,
    ).getDate();
    setStartDate(`${y}-${m}-01`);
    setEndDate(`${y}-${m}-${last}`);
  };

  const setLastMonth = () => {
    const today = new Date();
    const last = new Date(today.getFullYear(), today.getMonth(), 0);
    const y = last.getFullYear();
    const m = String(last.getMonth() + 1).padStart(2, "0");
    const lastDay = last.getDate();
    setStartDate(`${y}-${m}-01`);
    setEndDate(`${y}-${m}-${lastDay}`);
  };

  return {
    startDate,
    endDate,
    setStartDate,
    setEndDate,
    setThisWeek,
    setThisMonth,
    setLastMonth,
  };
};
