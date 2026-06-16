// import { createContext, useContext, useEffect, useState } from "react";
// import { frameStyleFromUrl, getWallpaperById } from "../data/wallpapers";

// export const WallpaperContext = createContext(null);

// const STORAGE_KEY = "chat-wallpaper-id";

// function readStoredWallpaperId() {
//   const id = localStorage.getItem(STORAGE_KEY);
//   return id || "sonoma-horizon";
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
//       value={{
//         wallpaperId,
//         setWallpaperId,
//         wallpaper,
//         frameStyle,
//       }}
//     >
//       {children}
//     </WallpaperContext.Provider>
//   );
// }

// export function useWallpaper() {
//   const ctx = useContext(WallpaperContext);

//   if (!ctx) {
//     throw new Error("useWallpaper must be used within WallpaperProvider");
//   }

//   return ctx;
// }
export * from "./WallpaperContext.jsx";