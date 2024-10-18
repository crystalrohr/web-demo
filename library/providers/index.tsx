import React from "react";

import { AptosKeylessProvider } from "./keyless";
import { AptosSurfProvider } from "./surf";

const RootProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AptosKeylessProvider>
      <AptosSurfProvider>{children}</AptosSurfProvider>
    </AptosKeylessProvider>
  );
};

export default RootProvider;
