import { useEffect, useState } from "react";

const THEME_KEY = "inupa_theme";

/** Lee el tema guardado; si no hay, respeta la preferencia del sistema. */
function temaInicial(): boolean {
  const guardado = localStorage.getItem(THEME_KEY);
  if (guardado) return guardado === "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
}

/**
 * Modo oscuro compartido por toda la app (panel de administrador y vista de
 * alumno). La clase `.dark` se pone en <html> y no en un contenedor interno:
 * la variante de Tailwind es `&:is(.dark *)`, así que desde la raíz alcanza a
 * todo, incluidos los diálogos que React monta fuera del árbol de la página.
 */
export function useTheme() {
  const [dark, setDark] = useState<boolean>(temaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark]);

  return { dark, setDark, toggleTheme: () => setDark((d) => !d) };
}
