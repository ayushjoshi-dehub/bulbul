// import { createContext, useContext, useEffect, useState } from "react";
// import { frameStyleFromUrl, getWallpaperById } from "../data/wallpapers";

// const WallpaperContext = createContext();

// const STORAGE_KEY = "chat-wallpaper-id";

// function readStoredWallpaperId() {
//   const wallpaperId = localStorage.getItem(STORAGE_KEY);
//   return wallpaperId || "sonoma-horizon";
// }

// export function WallpaperProvider({ children }) {
//   const [wallpaperId, setWallpaperIdState] = useState(readStoredWallpaperId);

//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, wallpaperId);
//   }, [wallpaperId]);

//   const setWallpaperId = (id) => {
//     setWallpaperIdState(id);
//   };

//   const wallpaper = getWallpaperById(wallpaperId);
//   const frameStyle = frameStyleFromUrl(wallpaper?.url);

//   return (
//     <WallpaperContext.Provider
//       value={{ wallpaperId, setWallpaperId, wallpaper, frameStyle }}
//     >
//       {children}
//     </WallpaperContext.Provider>
//   );
// }

// export function useWallpaper() {
//   const context = useContext(WallpaperContext);

//   if (!context) {
//     throw new Error("useWallpaper must be used inside WallpaperProvider");
//   }

//   return context;
// }

import { createContext, useContext, useEffect, useState } from "react";
import { frameStyleFromUrl, getWallpaperById } from "../data/wallpapers";

export const WallpaperContext = createContext(null);

const STORAGE_KEY = "chat-wallpaper-id";

function readStoredWallpaperId() {
  return localStorage.getItem(STORAGE_KEY) || "sonoma-horizon";
}

export function WallpaperProvider({ children }) {
  const [wallpaperId, setWallpaperIdState] = useState(readStoredWallpaperId);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, wallpaperId);
  }, [wallpaperId]);

  const wallpaper = getWallpaperById(wallpaperId);
  const frameStyle = frameStyleFromUrl(wallpaper?.url);

  return (
    <WallpaperContext.Provider value={{ wallpaperId, setWallpaperId: setWallpaperIdState, wallpaper, frameStyle }}>
      {children}
    </WallpaperContext.Provider>
  );
}

export function useWallpaper() {
  const ctx = useContext(WallpaperContext);
  if (!ctx) throw new Error("useWallpaper must be used within WallpaperProvider");
  return ctx;
}