import { Routes, Route, useLocation } from "react-router-dom";
import Header from "../../components/header/index.jsx";
import ErrorPage from "../../views/Error/ErrorPage";


import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useSelector } from "react-redux";
import ExaminationHallV2 from "../../views/ExaminationHallV2/ExaminationHallV2.jsx";
import LiveViewPanel from "../../views/LiveViewPanel/LiveViewPanel.jsx";
import { AnomalyAlertsProvider } from "../../contexts/AnomalyAlertsContext.jsx";
import { SoundProvider } from "../../contexts/SoundContext.jsx";



function Routing() {
  const location = useLocation();
  const themeMode = useSelector(data => data.themeMode)
  let arabicFont = useSelector((data) => data.arabicFont)
  let englishFont = useSelector((data) => data.englishFont)
  let langReducer = useSelector((data) => data.lang)
  const darkTheme = createTheme({
    palette: {
      mode: (themeMode == "dark") ? 'dark' : 'light',
    },
    typography: {
      allVariants: {
        fontFamily: langReducer == "en" ? englishFont : arabicFont,
        textTransform: 'none',
        // fontSize: 16,
      },
    },
  });

  return (
    <SoundProvider>
      <AnomalyAlertsProvider>
        <ThemeProvider theme={darkTheme}>
          <CssBaseline />
          {location.pathname !== "/" && <Header />}
          <Routes>
            <Route path="/" element={<LiveViewPanel />} />
            <Route path="/stream" element={<ExaminationHallV2 />} />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </ThemeProvider>
      </AnomalyAlertsProvider>
    </SoundProvider>
  );
}

export default Routing;
