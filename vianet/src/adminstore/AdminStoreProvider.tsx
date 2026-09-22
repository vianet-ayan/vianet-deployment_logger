import type { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { adminStore, adminPersistor } from "./adminstore";

export function AdminStoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={adminStore}>
      <PersistGate loading={null} persistor={adminPersistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
