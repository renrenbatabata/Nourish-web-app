
"use client";
import { useEffect,useState } from 'react';
import { doc,getDoc } from 'firebase/firestore';
import { parseGoals, NutritionGoals } from '../lib/nutrition';
import { db } from '../../firebase';
export function usePreferences(uid?:string) {
  const [state,setState]=useState<{uid?:string;showNutrition:boolean;goals:NutritionGoals}>({showNutrition:false,goals:{}});
  useEffect(()=>{if(!uid)return;let active=true;getDoc(doc(db,'users',uid)).then(d=>{if(active)setState({uid,showNutrition:d.data()?.showNutrition!==false,goals:parseGoals(d.data()?.nutritionGoals)});}).catch(()=>{if(active)setState({uid,showNutrition:false,goals:{}});});return()=>{active=false;};},[uid]);
  return {showNutrition:state.uid===uid&&state.showNutrition,goals:state.uid===uid?state.goals:{},loadingGoals:!!uid&&state.uid!==uid};
}

