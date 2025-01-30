import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router";
import { useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

import { US, SA } from 'country-flag-icons/react/3x2'

import './header.css'
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';


export default function DenseAppBar(props) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate()

  const dispatch = useDispatch();
  const selector = useSelector(data => data.headerHeight);
  let sideBarWidth = useSelector((data) => data.sideBarWidth)
  let langReducer = useSelector((data) => data.lang)

  const [headerHeight, setHeaderHeight] = useState(`${selector}`)

  const [anchorEl, setAnchorEl] = React.useState(false);
  const open = Boolean(anchorEl);
  const handleLanguageIconClick = (event) => { setAnchorEl(event.currentTarget) }
  const handleCloseLanguageDropdown = () => { setAnchorEl(null) }

  const handleChangeLangDropdown = (lang) => {
    dispatch({ type: "SETLANGUAGE", payload: { lang } })
    handleCloseLanguageDropdown()
  }

  const handleOpenDownloadPDFModal = () => {
    dispatch({ type: "SETDOWNLOADPDFMODAL", payload: { downloadPDFModal: true } })
  }
  // const handleCloseDownloadPDFModal = () => {
  //   dispatch({ type: "SETDOWNLOADPDFMODAL", payload: { downloadPDFModal: false } })
  // }

  useEffect(() => { i18n.changeLanguage(langReducer) }, [langReducer])


  return (
    <Box sx={{ flexGrow: 1 }} className="headerDenseMain"
      style={{
        // left: (langReducer == "en" && location.pathname !== "/") ? `${sideBarWidth}px` : "0px",
        // right: langReducer == "ar" ? `${sideBarWidth}px` : "initial",
        height: `${headerHeight}px`,
        // width: location.pathname !== "/" ? `calc(100vw - ${sideBarWidth}px)` : "100vw",
        zIndex: 0,
        direction: langReducer == "en" ? "ltr" : "rtl",
      }}
    >

      <AppBar position="static" className="headerDense"
        sx={{
          position: "relative", display: 'block', height: "100%", background: "#183e61 !important",
          borderLeft: langReducer == "en" ? "0.1px solid rgba(255,255,255,0.1)" : "initial",
          borderRight: langReducer == "ar" ? "0.1px solid rgba(255,255,255,0.1)" : "initial",
          zIndex: 9999
        }}
      >
        
        <Toolbar variant="dense" sx={{ height: "100%", width: "100%", paddingLeft: "0px !important", paddingRight: "0px !important" }}>
          {/* {location.pathname == "/" && */}
            <Box style={{ height: 62, width: 260, padding: "0px 10px", display: "flex", alignItems: "center" }}>
              <img src="/images/qiyas-logo.svg" />
            </Box>
          {/* } */}
          <Box className="" style={{ color: "#fff", width: "100%", display: "flex", justifyContent: "end" }}>

            {/* Language Dropdown */}
            <div style={{ height: "60px", width: "60px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Tooltip title="" >
                <IconButton
                  onClick={handleLanguageIconClick}
                  size="small"
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}
                >
                  <LanguageIcon sx={{ color: "#fff" }} />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleCloseLanguageDropdown}
                onClick={handleCloseLanguageDropdown}
                slotProps={{
                  paper: {
                    elevation: 0,
                    sx: {
                      overflow: 'visible',
                      zIndex: 9999999,
                      filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                      mt: 1.5,
                      '& .MuiAvatar-root': {
                        width: 32,
                        height: 32,
                        ml: -0.5,
                        mr: 1,
                      },
                      '&::before': {
                        content: '""',
                        display: 'block',
                        position: 'absolute',
                        top: 10,
                        right: 14,
                        width: 10,
                        height: 10,
                        bgcolor: 'background.paper',
                        transform: 'translateY(-50%) rotate(45deg)',
                        zIndex: 0,
                      },
                    },
                  },
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => handleChangeLangDropdown("en")} style={{ background: langReducer == "en" && "#183E61", color: langReducer == "en" && "#fff" }}>
                  <US title="English" style={{ width: 28, marginRight: 10 }} /> {t('english')}
                </MenuItem>
                <MenuItem onClick={() => handleChangeLangDropdown("ar")} style={{ background: langReducer == "ar" && "#183E61", color: langReducer == "ar" && "#fff" }}>
                  <SA title="Arabic" style={{ width: 28, marginRight: 10 }} /> {t('arabic')}
                </MenuItem>
                {/* <Divider /> */}
              </Menu>
            </div>

            {/* Download PDF Icon */}

            {/* {location.pathname !== "/" &&
              <div style={{ height: "60px", width: "60px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Tooltip title="" >
                  <IconButton
                    onClick={handleOpenDownloadPDFModal}
                    size="small"
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                  // disabled={true}
                  >
                    <PictureAsPdfIcon sx={{ color: "#fff" }} />
                  </IconButton>
                </Tooltip>
              </div>} */}
          </Box>

          {
            location.pathname !== "/" &&
            <div onClick={() => navigate('/')} title="Back" className={`backIconDiv ${langReducer == "en" ? 'backIconDivEn' : 'backIconDivAr'}`} >
              <ArrowBackIcon />
            </div>
          }
        </Toolbar>
      </AppBar>
    </Box >
  );
}
