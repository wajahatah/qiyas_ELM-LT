import { AppBar } from "@mui/material";
import React from "react";
import DenseAppBar from "./DenseAppBar";
import AppDrawer from "./Sidebar";

function Header() {
  const [state, setState] = React.useState({
    top: false,
    left: false,
    bottom: false,
    right: false,
  });

  const [pageName, setPageName] = React.useState("PeopleAnalytics")

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setState({ ...state, [anchor]: open });
  };
  return (
    <>
      <DenseAppBar
        state={state}
        setState={setState}
        toggleDrawer={toggleDrawer}
        pageName={pageName}
        setPageName={setPageName}
      />
      <AppDrawer
        state={state}
        setState={setState}
        toggleDrawer={toggleDrawer}
        pageName={pageName}
        setPageName={setPageName}
      />
    </>
  );
}

export default Header;
