import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Provider } from "react-redux"
import { PersistGate } from "redux-persist/integration/react"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { adminStore, adminPersistor } from "@/adminstore"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={adminStore}>
      <PersistGate loading={null} persistor={adminPersistor}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
)
