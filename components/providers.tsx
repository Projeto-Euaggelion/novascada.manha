"use client";

import { Provider } from "@lyket/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider 
      apiKey="pt_89cc199a4163149abcc63d6668992a"
      theme={{
        colors: {
          highlight:"rgba(198, 168, 115, 1)",
          background: "rgba(198, 168, 115, .05)",
          primary: "rgba(198, 168, 115, .2)",
          icon:"rgba(198, 168, 115, 1)",
          text:"rgba(198, 168, 115, 1)"
        }
      }}
    >
    {children}
  </Provider>
  );
}