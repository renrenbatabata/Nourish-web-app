
"use client";
import { useEffect,useState } from 'react';
import { doc,getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
export function usePreferences(uid?:string) {
  const [state,setState]=useState<{uid?:string;showNutrition:boolean}>({showNutrition:false});
  useEffect(()=>{if(!uid)return;let active=true;getDoc(doc(db,'users',uid)).then(d=>{if(active)setState({uid,showNutrition:d.data()?.showNutrition!==false});}).catch(()=>{if(active)setState({uid,showNutrition:false});});return()=>{active=false;};},[uid]);
  return {showNutrition:state.uid===uid&&state.showNutrition};
}
