import * as React from "react";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Drawer from "@mui/material/Drawer";
import Divider from "@mui/material/Divider";


import { styled } from '@mui/material/styles';
// import Tooltip from '@mui/material/Tooltip';
// import Stack from '@mui/material/Stack';
import { DemoContainer, DemoItem } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { TimePicker } from '@mui/x-date-pickers/TimePicker';
// import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
// import { DateRangePicker } from '@mui/x-date-pickers-pro/DateRangePicker';



import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';

import './header.css'
import { get_ocr_data, get_cameras } from "../../utils/functions";
import { constants } from "../../constants/constants";
import { useTranslation } from "react-i18next";
import { formatNumberForLocale } from "../../utils/utils";

const ProSpan = styled('span')({
  color: "#fff",
  margin: "0px auto",
  marginBottom: 10,
  padding: "0px !important"
});

export default function AppDrawer(props) {
  const { t } = useTranslation();
  let dispatch = useDispatch();

  let sideBarWidth = useSelector((data) => data.sideBarWidth)
  let selectedCamera = useSelector((data) => data.selectedCamera)
  const desks = useSelector(data => data.desks);
  let langReducer = useSelector((data) => data.lang)

  const [loading, setLoading] = useState(true);
  const [activeDesk, setActiveDesk] = useState("desk1")
  const handleSelectDesk = (desk, index) => {
    // console.log('Selected Desk:', desk);
    setActiveDesk(desk)

    dispatch({ type: "SETACTIVEDESK", payload: { desk: desk, active: true } });
    dispatch({ type: "RESETFLASH", payload: { desk: desk, flash: false } });
    dispatch({ type: "SETACTIVEDESKINDEX", payload: { activeDeskIndex: index + 1 } });



    dispatch({ type: "TOGGLEFLASH", payload: { desk: desk, flash: false } });
    // delete alertTimeouts[deskKey]; // Clean up the timeout reference
  }


  const [camera, setCamera] = useState(null);
  const [cameraIndex, setCameraIndex] = useState(null);

  // console.log("camera link:", camera)

  const handleCameraChange = (event) => {
    const newCamera = event.target.value;
    // const selectedIndex = constants.cameraLinks.indexOf(newCamera);
    const selectedIndex = camerasDropdown.indexOf(newCamera);
    const cameraIndex = `camera_${selectedIndex + 1}`;
    // console.log("cameraIndex:", cameraIndex)
    dispatch({ type: "SETSELECTEDCAMERA", payload: { selectedCamera: newCamera, cameraIndex: cameraIndex } });
    dispatch({ type: "REMOVEFLASHALERS" });
  };

  const [camerasDropdown, setCamerasDropdown] = useState([]);

  useEffect(() => {
    const fetchCameras = async () => {
      setLoading(true)
      try {
        const data = await get_cameras();
        if (data.success) {
          setCamerasDropdown(data.ids);
          console.log(data.ids[0]);
          // console.log("cameraIndex:", cameraIndex);



          dispatch({ type: "SETSELECTEDCAMERA", payload: { selectedCamera: data?.ids[0], cameraIndex: "camera_1" } });
        }

        // console.log('OCR data:', data);
        // dispatch({ type: "SETOCRCAM1", payload: { name: data } });
        // setLoading(false)
      } catch (error) {
        // setLoading(false)
        console.error('Error fetching OCR data:', error);
      }
    };

    fetchCameras();

  }, [])

  useEffect(() => { setCamera(selectedCamera) }, [selectedCamera]);

  //getting OCR data
  useEffect(() => {

    if (!constants.byPassInitialApiCalling) {

      const fetchOCRData = async () => {
        setLoading(true)
        try {
          const data = await get_ocr_data();
          // console.log('OCR data:', data);
          dispatch({ type: "SETOCRCAM1", payload: { name: data } });
          setLoading(false)
        } catch (error) {
          setLoading(false)
          console.error('Error fetching OCR data:', error);
        }
      };

      fetchOCRData();

    } else {

      dispatch({ type: "SETOCRCAM1", payload: { name: "Desk" } });
      // dispatch({ type: "SETOCRCAM1", payload: { name: "H2-Exam-32" } });

      setTimeout(() => {
        setLoading(false)
      }, 1000);

    }
  }, [])

  // useEffect(() => { console.log("langReducersss:", langReducer) }, [langReducer])

  return (
    <div>
      {
        loading && (
          <div style={{ background: "rgba(24, 62, 97, 1)", position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh", zIndex: 99999, display: "flex", justifyContent: "center", alignItems: "center" }}>
            <img src="/images/qiyas-logo.svg" width="30%" style={{ animation: "zoomInOut 1.5s infinite alternate" }} />
          </div>)
      }


      {["left"].map((anchor) => (
        <React.Fragment key={anchor}>
          <Drawer
            anchor={anchor}
            open={props.state[anchor]}
            onClose={props.toggleDrawer(anchor, false)}
            variant="permanent"
            PaperProps={{
              sx: {
                background: '#183e61',
                color: '#fff',
                width: 'max-content',
                overflow: 'hidden',
                display: 'flex',
                transition: 'all .5s ease',
                boxShadow: "none",
                position: "absolute",
                top: 0,
                left: langReducer === "en" ? 0 : "initial",
                right: langReducer === "ar" ? 0 : "initial",

                direction: langReducer === "en" ? "ltr" : "rtl",
              },
            }}
          >
            <div style={{ height: 62, width: `${sideBarWidth}px`, padding: "0px 10px", display: "flex", justifyContent: "space-between" }}>
              <img src="/images/qiyas-logo.svg" />
            </div>
            <Divider color="#3E505B" sx={{ marginBottom: 1 }} />
            {/* <Divider color="#3E505B" sx={{ marginBottom: 5 }} /> */}

            {/* <ProSpan sx={{ width: `calc(${sideBarWidth}px - 20px)` }}>
              <LocalizationProvider dateAdapter={AdapterDayjs} >
                <DemoContainer
                  components={[
                    'DatePicker',
                    'TimePicker',
                    'DateTimePicker',
                    'DateRangePicker',
                  ]}

                >
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ marginLeft: 5, opacity: 0.4, marginBottom: 5 }}>Select Date</span>
                    <DatePicker sx={{ borderRadius: 2, background: "#fff" }} />
                  </div>

                </DemoContainer>
              </LocalizationProvider>
            </ProSpan> */}


            <FormControl sx={{ width: `calc(${sideBarWidth}px - 10%)`, margin: "0px auto", marginBottom: "20px", }}>
              <span style={{ marginLeft: 5, opacity: 0.4, marginBottom: 5 }}>{t('select-camera')}</span>
              <Select
                value={camera}
                onChange={handleCameraChange}
                // displayEmpty
                inputProps={{ 'aria-label': 'Without label' }}

                sx={{
                  background: "#fff", borderRadius: 2, outline: "none", boxShadow: "none",
                  ".MuiOutlinedInput-notchedOutline": { border: 0 },
                  "&.MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": { border: 0, },
                  "&.MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { border: 0, },
                }}
              >
                {
                  // constants.cameraLinks.map((rtsp, i) => {
                  //   return <MenuItem key={rtsp} value={rtsp}>Camera {i + 1}</MenuItem>
                  // })

                  camerasDropdown.map((rtsp, i) => {
                    return <MenuItem key={rtsp} value={rtsp} sx={{ direction: langReducer == "en" ? "ltr" : "rtl" }}>
                      {t('camera', { count: formatNumberForLocale(i + 1) })}</MenuItem>
                  })
                }
                {/* <MenuItem value="rtsp://10.85.120.104:9000/live">Camera 1</MenuItem>
                <MenuItem value="rtsp://10.85.120.19:9000/live">Camera 2</MenuItem> */}
              </Select>
            </FormControl>
            <Divider color="#3E505B" sx={{ marginBottom: 1 }} />

            <span style={{
              marginLeft: langReducer == "en" ? 15 : "initial",
              marginRight: langReducer == "ar" ? 15 : "initial",
              opacity: 0.4,
            }}>{t('desks')}</span>
            {/* <Divider color="gray" /> */}
            <div style={{ margin: "10px 15px", display: "flex", flexDirection: "column" }}>

              {
                desks.map((item, index) => (
                  <div key={item + "_" + index}>
                    <div className={`sideBarDeskItem ${item.active && "active"} ${item.flash && "flash"}`} onClick={() => handleSelectDesk(item.desk, index)}>
                      <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>

                        {item.active ?
                          <img src="/images/student.png" alt="Desk" style={{ width: "40px", height: "40px", objectFit: "cover" }} /> :
                          < img src="/images/student_white.png" alt="Desk" style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                        }
                        {/* <span className="selectDeskText">{item.name + " " + (index + 1) + "" || "Desk " + (index + 1) + " (" + (index + 1) + ")"}</span> */}
                        <span className="selectDeskText">{t(item.name.toLowerCase(), { count: formatNumberForLocale(index + 1) })}</span>
                      </span>

                      {/* {(item.alert &&
                        <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                          <img src="/images/alert_icon.png" alt="Desk" style={{ width: "22px", height: "22px", objectFit: "cover" }} />
                          <span className="selectDeskText attentionAlertCountText">5</span>
                        </span>
                      )} */}
                    </div>
                    <Divider color="gray" />
                  </div>
                ))
              }



            </div>



          </Drawer>
        </React.Fragment>
      ))
      }
    </div >
  );
}
