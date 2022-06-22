import React from "react";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import Layout from "./components/layout/Layout";
import MainPage from "./pages/MainPage";
import LayoutAuthenticated from "./components/layout/LayoutAuthenticated";
import { darkTheme } from "./theme";
import { Route, Routes } from "react-router-dom";
import TransferPage from "./pages/TransfersPage";

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline>
        <LayoutAuthenticated>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/transfers" element={<TransferPage />} />
          </Routes>
        </LayoutAuthenticated>
      </CssBaseline>
    </ThemeProvider>
  );
}

export default App;
