import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { appStore, appPersistor } from "./appstore";

export function AppStoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={appStore}>
      <PersistGate loading={null} persistor={appPersistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
