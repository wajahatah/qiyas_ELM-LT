import { Routes, Route } from "react-router-dom";
import Header from "../../components/header/index.jsx";
import ErrorPage from "../../views/Error/ErrorPage";
// import ExaminationHall from "../../views/ExaminationHall/ExaminationHall.jsx";


import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useSelector } from "react-redux";
import ExaminationHallV2 from "../../views/ExaminationHallV2/ExaminationHallV2.jsx";



function Routing() {

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
    <>
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        <Header />
        <Routes>
          <Route path="/" element={<ExaminationHallV2 />} />
          {/* <Route path="/" element={<ExaminationHall />} /> */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default Routing;
