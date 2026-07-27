import { useCvStore } from "../store/cvStore";

export function useCV() {
  const { current, status, error, fetchMyCv, saveCv } = useCvStore();
  return { cv: current, status, error, fetchMyCv, saveCv };
}
