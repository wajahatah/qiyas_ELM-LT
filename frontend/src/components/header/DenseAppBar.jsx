import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from "react-router";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";

import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';

import { US, SA } from 'country-flag-icons/react/3x2'

import './header.css'
import { IconButton, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";


export default function DenseAppBar(props) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate()

  const dispatch = useDispatch();
  const selector = useSelector(data => data.headerHeight);
  let sideBarWidth = useSelector((data) => data.sideBarWidth)
  let langReducer = useSelector((data) => data.lang)

  const [headerHeight, setHeaderHeight] = useState(`${selector}`)

  const [anchorEl, setAnchorEl] = React.useState(false);
  const open = Boolean(anchorEl);
  const handleClick = (event) => { setAnchorEl(event.currentTarget) }
  const handleClose = () => { setAnchorEl(null) }

  const handleChangeLangDropdown = (lang) => {
    dispatch({ type: "SETLANGUAGE", payload: { lang } })
    handleClose()
  }


  useEffect(() => { i18n.changeLanguage(langReducer) }, [langReducer])


  return (
    <Box sx={{ flexGrow: 1 }} className="headerDenseMain"
      style={{
        left: langReducer == "en" ? `${sideBarWidth}px` : "0px",
        // right: langReducer == "ar" ? `${sideBarWidth}px` : "initial",
        height: `${headerHeight}px`,
        width: `calc(100vw - ${sideBarWidth}px)`,
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
          <Box className="" style={{ color: "#fff", width: "100%", display: "flex", justifyContent: "end" }}>

            {/* Language Dropdown */}
            <div style={{ height: "60px", width: "60px", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <Tooltip title="" >
                <IconButton
                  onClick={handleClick}
                  size="small"
                  aria-controls={open ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={open ? 'true' : undefined}

                >
                  <LanguageIcon sx={{ color: "#fff" }} />
                  {/* <Avatar sx={{ width: 32, height: 32 }}>M</Avatar> */}
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                id="account-menu"
                open={open}
                onClose={handleClose}
                onClick={handleClose}
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
          </Box>
        </Toolbar>
      </AppBar>
    </Box >
  );
}
