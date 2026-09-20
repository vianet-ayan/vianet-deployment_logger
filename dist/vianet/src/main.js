import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import * as Sentry from "@sentry/react";
import "./index.css";
import App from "./App.tsx";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { adminStore, adminPersistor } from "@/adminstore";
Sentry.init({
    dsn: "https://3493bd8cf8162edbf645c274d8abda36@o4512095998115840.ingest.de.sentry.io/4512107138842704",
    dataCollection: {
    // To disable sending user data and HTTP bodies, uncomment the lines below. For more info visit:
    // https://docs.sentry.io/platforms/javascript/guides/react/configuration/options/#dataCollection
    // userInfo: false,
    // httpBodies: []
    }
});
createRoot(document.getElementById("root")).render(<StrictMode>
    <Provider store={adminStore}>
      <PersistGate loading={null} persistor={adminPersistor}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>);
