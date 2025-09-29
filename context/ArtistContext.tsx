// context/ArtistContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Artist } from "@/types/artist";

type ArtistContextType = {
  artists: Artist[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
};

const ArtistContext = createContext<ArtistContextType | undefined>(undefined);

export const ArtistProvider = ({ children }: { children: ReactNode }) => {
  const [artists, setArtists] = useState<Artist[]>([]);

  return (
    <ArtistContext.Provider value={{ artists, setArtists }}>
      {children}
    </ArtistContext.Provider>
  );
};

export const useArtists = () => {
  const context = useContext(ArtistContext);
  if (!context) throw new Error("useArtists must be used within ArtistProvider");
  return context;
};
