import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, Button, CircularProgress, Switch } from "@mui/material";

import { makeStyles } from '@material-ui/core/styles';
import toast, { Toaster } from 'react-hot-toast';

import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css';

import ImageModal from "../../components/imageModal/ImageModal.jsx";
import { constants } from "../../constants/constants.js";
import DataCard from "../../components/DataCard/DataCard.jsx";

import PendingIcon from '@mui/icons-material/Pending';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import AnomalyDataCard from "../../components/DataCard/AnomalyDataCard.jsx";
import ActionChartModal from "../../components/chartModal/ActionChartModal.jsx";
import axios from "axios";
import "./ExaminationHallV2.css";
import { formatNumberForLocale, getTodayDate } from "../../utils/utils.js";


function ExaminationHallV2() {
  const { t } = useTranslation();
  const dispatch = useDispatch()

  const useStyles = makeStyles({
    playStopIcon: {
      fontSize: "60px !important",
      color: '#fff',
      cursor: 'pointer',
      opacity: 0.1,
      transition: 'opacity 0.1s ease', // Adding transition for smooth effect
      '&:hover': {
        opacity: 1,
      },
    },

    heading: {
      fontSize: "1.2em",
      fontWeight: "bold",
      // color: "rgba(0,0,0,0.6)",
      color: "#0056a6b8",
      // textDecoration: "underline",
    }
  });
  const classes = useStyles();


  let sideBarWidth = useSelector((data) => data.sideBarWidth)
  let headerHeight = useSelector((data) => data.headerHeight)

  var activeDeskIndex = useSelector(data => data.activeDeskIndex);
  let selectedCameraIndex = useSelector((data) => data.cameraIndex)
  let langReducer = useSelector((data) => data.lang)
  let arabicFont = useSelector((data) => data.arabicFont)
  let englishFont = useSelector((data) => data.englishFont)
  const actionChartHeaderLabel = 'Student Attention'


  const [imageModalTitle, setImageModalTitle] = useState("");
  const [openImageModal, setOpenImageModal] = useState(false);
  const handleImageModalOpen = () => setOpenImageModal(true);
  const handleImageModalClose = () => setOpenImageModal(false);


  const [openChartModal, setOpenChartModal] = useState(false);
  const handleChartModalOpen = () => {
    fetchDatesForAlertsChartDropdown();
    handleActionChartDropDownChange(getTodayDate());
    setOpenChartModal(true)
  };
  const handleChartModalClose = () => setOpenChartModal(false);

  const [isChartRunning, setIsChartRunning] = useState(false);
  const [detectedImage, setDetectedImage] = useState(null)

  const chartRef = useRef(null);

  const [actionChartData, setActionChartData] = useState([
    {
      "1": {
        name: actionChartHeaderLabel,
        data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
        categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
        ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
      },
      "2": {
        name: actionChartHeaderLabel,
        data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
        categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
        ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
      },
      "3": {
        name: actionChartHeaderLabel,
        data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
        categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
        ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
      },
      "4": {
        name: actionChartHeaderLabel,
        data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
        categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
        ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
      },
    }
  ]);



  let [anomalies, setAnomalies] = useState([
    "looking around",
    // "looking backward",
    "using mobile phone",
    // "standing up",
    "raising hand",
    "Normal"
  ])

  let [mapActions, setMapActions] = useState({
    "looking around": 1,
    // "looking backward": 2,
    "using mobile phone": 2,
    // "standing up": 4,
    "raising hand": 3,
    "student interacting with invigilator": 4,
    "Normal": 5,
  })
  let [mapActionsReverse, setMapActionsReverse] = useState({
    "0": "",
    "1": "looking around",
    // "2": "looking backward",
    "2": "using mobile phone",
    // "4": "standing up",
    "3": "raising hand",
    "4": "Student Interacting with Invigilator",
    "5": "Normal"
  })

  const mapObjectKeys = {
    "Offline": 0,
    "monitor": 1,
    "computer": 1,
    "mobile phone": 2,
    "keyboard": 3,
    "Other": 4,
  }


  const [camera1StreamInfo, setCamera1StreamInfo] = useState({ stream: null, data: null })

  const [controller1, setController1] = useState(new AbortController());

  const handleStartChart = () => {
    setCamera1StreamInfo({
      stream: null,
      data: null
    })
    setIsChartRunning(true);
    fetchVideoStream1();
  };

  const handleStopChart = () => {
    setIsChartRunning(false);
    cleanupStreamControllers();
    setController1(new AbortController())
  };

  const cleanupStreamControllers = () => {
    controller1.abort();
  };



  let alertTimeouts = {};
  const [cooldown, setCooldown] = useState({}); // Track cooldowns for each desk

  function handleFlashAlert(detectedObjJson, objectName, deskIndex) {

    const deskKey = "desk" + deskIndex;
    objectName = objectName.trim().toLowerCase();

    const excludedObjects = ["computer", "monitor"];
    if (!excludedObjects.includes(objectName)) {
      const now = Date.now();

      // Check if the desk is on cooldown
      if (cooldown[deskKey] && now < cooldown[deskKey]) {
        // If on cooldown, exit the function early
        return;
      }

      // Trigger the flash alert
      dispatch({ type: "TOGGLEFLASH", payload: { desk: deskKey, flash: true } });

      // Clear any existing timeout for this desk
      if (alertTimeouts[deskKey]) {
        clearTimeout(alertTimeouts[deskKey]);
      }

      // Set a new timeout to turn off the flash after 3 seconds
      alertTimeouts[deskKey] = setTimeout(() => {
        dispatch({ type: "TOGGLEFLASH", payload: { desk: deskKey, flash: false } });
        delete alertTimeouts[deskKey]; // Clean up the timeout reference
      }, constants.flashAlertTime);

      // Set the cooldown for 10 seconds from now
      cooldown[deskKey] = now + constants.coolDownTime;
    }
  }


  function handleFlashAlertForAction(detectedObjJson, objectName, deskIndex) {
    const deskKey = "desk" + deskIndex;
    // console.log("deskKey:", deskKey)

    const now = Date.now();

    // Check if the desk is on cooldown
    if (cooldown[deskKey] && now < cooldown[deskKey]) {
      // If on cooldown, exit the function early
      // console.log(`deskKey: ${deskKey}`, "On cooldown, exiting early");
      return;
    }

    // Trigger the flash alert
    dispatch({ type: "TOGGLEFLASH", payload: { desk: deskKey, flash: true } });

    // Clear any existing timeout for this desk
    if (alertTimeouts[deskKey]) {
      clearTimeout(alertTimeouts[deskKey]);
    }

    // // Set a new timeout to turn off the flash 
    // alertTimeouts[deskKey] = setTimeout(() => {
    //   dispatch({ type: "TOGGLEFLASH", payload: { desk: deskKey, flash: false } });
    //   delete alertTimeouts[deskKey]; // Clean up the timeout reference
    // }, constants.flashAlertTime);

    // Set the cooldown 
    setCooldown(prevCooldown => ({
      ...prevCooldown,
      [deskKey]: now + constants.coolDownTime,
    }));
  }

  const isEmpty = (obj) => {
    return Object.entries(obj).length === 0;
  };

  const [lastMessage, setLastMessage] = useState(null);
  const [lastMessageTime, setLastMessageTime] = useState(0);

  useEffect(() => {
    // console.log(camera1StreamInfo);

    if (camera1StreamInfo?.data) {
      const updateNotifications = (response) => {

        const currentTime = new Date().getTime();
        for (let i = 1; i <= 4; i++) {
          if (response.hasOwnProperty(i.toString())) {
            // const message = `Student ${i.toString()}: ${response[i.toString()]["alert_title"]}`;
            const message = t('student', { count: formatNumberForLocale(i) }) + ": " + t(response[i.toString()]["alert_title"].toLowerCase().replaceAll(" ", "-"));

            if (activeDeskIndex == i.toString()) {
              if (message !== lastMessage || currentTime - lastMessageTime > constants.notificationBufferTime) {
                showToast(message);
                setLastMessage(message);
                setLastMessageTime(currentTime);
              }
            }
          }
        }
      };

      const updateActionChartData = (response) => {
        // console.log("in Updating action chart data");
        setActionChartData((prevState) => {
          const newState = { ...prevState[0] };

          for (const key in response) {
            if (newState[key]) {
              newState[key].data[selectedCameraIndex].push(mapActions[response[key]["alert_title"].toLowerCase()]);

              const id = response[key]["id"];
              const time = id.split(' ')[1]; // Extracting time part
              newState[key].categories[selectedCameraIndex].push(time);
              newState[key].ids[selectedCameraIndex].push(id);
            }
          }

          return [newState];
        });
      };

      if (!isEmpty(camera1StreamInfo?.data['alert'])) {
        updateNotifications(camera1StreamInfo?.data['alert'][0]);

        if (actionChartSelectedDate == getTodayDate()) {
          updateActionChartData(camera1StreamInfo?.data['alert'][0])
        }

        for (const key in camera1StreamInfo?.data['alert'][0]) {
          if (camera1StreamInfo?.data['alert'][0].hasOwnProperty(key)) {
            handleFlashAlertForAction(camera1StreamInfo?.data['alert'][0], "Alert title", key);
          }
        }
      }
    }
  }, [camera1StreamInfo])


  const [isStreamLoading, setIsStreamLoading] = useState(false)

  let selectedCamera = useSelector((data) => data.selectedCamera)

  /////////////////////////////////////////////////
  const cameraUrl = `${constants.pythonBaseUrl}/stream/video_feed?camera_id=${selectedCameraIndex}`;
  const fetchVideoStream1 = async () => {
    // console.log("In fetchVideoStream1");
    // console.log(cameraUrl);

    setIsStreamLoading(true);

    try {

      let jsonData = ""

      const response = await fetch(cameraUrl, { signal: controller1.signal });
      const reader = response.body.getReader();
      let imageData = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const parts = new TextDecoder("utf-8").decode(value).split("\r\n\r\n");

        parts.map((e, j) => {
          if (e.startsWith("--frame\r\nContent-Type: image/jpeg")) { }
          else if (e.startsWith("/9j")) { imageData = e }
          else if (e.startsWith("--frame\r\nContent-Type: application/json")) { }
          else if (e.startsWith("{\"analytics\"")) {
            try {
              jsonData = JSON.parse(e)
              // handleAreaChartData(jsonData)
              // console.log(jsonData);

              let base64Img = "data:image/png;base64, " + imageData;
              setCamera1StreamInfo({ stream: base64Img, data: jsonData })
              imageData = "";
            } catch (error) {
              console.info(error);
              imageData = "";
            }
          }
          else if (e.trim() == "[]") {
            let base64Img = "data:image/png;base64, " + imageData;
            setCamera1StreamInfo({ stream: base64Img, data: jsonData })
            imageData = "";
          }
          else if (e.trim() == "") { }
          else { imageData += e }
        })
      }
      console.log("stopped");
      setCamera1StreamInfo({ stream: null, data: null });
      setIsStreamLoading(false);
      alert(t("stream-has-ended"));
      handleStopChart()
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch request aborted");
      } else {
        console.error("Error:", error.message);
      }
      setIsStreamLoading(false);
      setIsChartRunning(false)
    }
  };


  useEffect(() => {
    dispatch({ type: "REMOVEFLASHALERS" });

    ////// this should be uncommented when the stream is ready
    setCamera1StreamInfo({
      stream: null,
      data: null
    })
    handleStopChart()
    // handleStartChart()
  }, [selectedCamera])

  const closeAllNotifications = () => { toast.dismiss() }

  const showToast = (notificationMessage) => {
    toast(
      (tst) => (
        <span>
          {notificationMessage}
          {/* <button onClick={() => toast.dismiss(tst.id)} style={{ color: "#D45241" }}><b>❌</b></button> */}
        </span>
      ),
      {
        // duration: Infinity,
        duration: constants.notificationDuration,
        position: constants.notificationPosition,

        // Styling
        style: {},
        className: '',

        // Custom Icon
        icon: '🔔',

        // Change colors of success/error/loading icon
        iconTheme: {
          primary: '#000',
          secondary: '#fff',
        },

        // Aria
        ariaProps: {
          role: 'status',
          'aria-live': 'polite',
        },
      }
    )
  }


  function handleHighChartMarkerClick(x, y, position, activeDesk) {

    const id = actionChartData[0][activeDesk].ids[selectedCameraIndex][position];

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${constants.pythonDbUrl}/stream/get_image?alert_ID=${id}`,
      headers: {}
    };

    axios.request(config)
      .then((response) => {
        setDetectedImage(response.data.image)
        setImageModalTitle(mapActionsReverse[y])
        handleImageModalOpen()
      })
      .catch((error) => {
        console.log(error);
      });

  }

  const [alertChartDropdownDates, setAlertChartDropdownDates] = useState([]);
  const [actionChartSelectedDate, setActionChartSelectedDate] = useState(''); // State to manage the selected date
  function fetchDatesForAlertsChartDropdown() {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${constants.pythonDbUrl}/stream/get_alert_dates`,
      headers: {}
    };
    setAlertChartDropdownDates([])
    axios.request(config)
      .then((response) => {
        if (response.status === 200) {

          const parsedData = JSON.parse(response.data)
          var alertDates = parsedData.data
          alertDates = alertDates.map((item) => item.replaceAll("-", "/"))
          alertDates = alertDates.reverse();
          const todayDate = getTodayDate();

          if (alertDates.includes(todayDate)) {
            setAlertChartDropdownDates(prevDates => [...alertDates]);
          } else {
            setAlertChartDropdownDates(prevDates => [todayDate, ...alertDates]);
          }
          handleActionChartDropDownChange(todayDate)
        }
      })
      .catch((error) => { console.log(error) });
  }

  function handleActionChartDropDownChange(date) {
    setActionChartSelectedDate(date)
    setActionChartData([...[
      {
        "1": {
          name: actionChartHeaderLabel,
          data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
          categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
          ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
        },
        "2": {
          name: actionChartHeaderLabel,
          data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
          categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
          ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
        },
        "3": {
          name: actionChartHeaderLabel,
          data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
          categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
          ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
        },
        "4": {
          name: actionChartHeaderLabel,
          data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
          categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
          ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
        },
      }
    ]])

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${constants.pythonDbUrl}/stream/get_chart_alerts?date=${date.replaceAll("/", "-")}`,
      headers: {}
    };

    axios.request(config)
      .then((response) => {
        if (response.status === 200) {
          const parsedData = JSON.parse(response.data)
          const data = parsedData.data

          let tempActionData = [...[
            {
              "1": {
                name: actionChartHeaderLabel,
                data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
                categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
                ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
              },
              "2": {
                name: actionChartHeaderLabel,
                data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
                categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
                ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
              },
              "3": {
                name: actionChartHeaderLabel,
                data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
                categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
                ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
              },
              "4": {
                name: actionChartHeaderLabel,
                data: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
                categories: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] },
                ids: { camera_1: [], camera_2: [], camera_3: [], camera_4: [], camera_5: [], camera_6: [], camera_7: [], camera_8: [], camera_9: [], camera_10: [], camera_11: [], camera_12: [], camera_13: [], camera_14: [], camera_15: [] }
              },
            }
          ]]
          for (let i = 0; i < data.length; i++) {
            let cam_id = data[i].cam_id;
            let candidate = data[i].candidate;
            let alert_ID = data[i].alert_ID;
            let alert_title = data[i].alert_title;
            // let image = data[i].image;
            let time = data[i].time;

            tempActionData[0][candidate].data[cam_id].push(mapActions[alert_title.toLowerCase()]);
            tempActionData[0][candidate].categories[cam_id].push(time);
            tempActionData[0][candidate].ids[cam_id].push(alert_ID);
          }
          // console.log("tempActionData:", tempActionData[0][activeDeskIndex].data['camera_1'].length);
          setActionChartData([...tempActionData])
        }
      })
      .catch((error) => { console.log(error) });

  }
  useEffect(() => {
    fetchDatesForAlertsChartDropdown();
    handleGetConfig()
  }, [])

  const memoizedActionChart = useMemo(() => {
    // This function will only re-run if camera1StreamInfo changes
    return <ActionChartModal
      openChartModal={openChartModal}
      closeChartModal={handleChartModalClose}
      areaChartData={[actionChartData[0][activeDeskIndex]]}
      classes={classes}
      chartRef={chartRef}
      handleHighChartMarkerClick={handleHighChartMarkerClick}
      activeDeskIndex={activeDeskIndex}
      alertChartDropdownDates={alertChartDropdownDates}
      setAlertChartDropdownDates={setAlertChartDropdownDates}
      handleActionChartDropDownChange={handleActionChartDropDownChange}
      selectedDate={actionChartSelectedDate}
      setSelectedDate={setActionChartSelectedDate}
      mapActionsReverse={mapActionsReverse}
    />;
  }, [openChartModal, actionChartData, activeDeskIndex]);



  //-------------- Config Drawer ---------------
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isConfigUpdating, setIsConfigUpdating] = useState(false)
  const [isBackendRestarting, setIsBackendRestarting] = useState(false);
  const [disableSaveButton, setDisableSaveButton] = useState(true);
  const [configOptions, setConfigOptions] = useState([
    { name: "desk", label: "Desk Area", roi: true, enableSwitch: true },
    { name: "objects", label: "Objects", roi: false, enableSwitch: true },
    { name: "head", label: "Head", roi: false, enableSwitch: true },
    { name: "deskNumber", label: "Desk Number", roi: false, enableSwitch: true },
    { name: "visualfield", label: "Visual Field", roi: false, enableSwitch: true },
    { name: "gaze", label: "Gaze", roi: false, enableSwitch: true },
    { name: "heat_map", label: "Heat Map", roi: false, enableSwitch: true },

  ])
  const [modelsState, setModelsState] = useState({
    "desk": false,
    "objects": false,
    "head": false,
    "deskNumber": false,
    "visualfield": false,
    "gaze": false,
    "heat_map": false,
  });
  const toggleConfigDrawer = () => {
    setIsConfigOpen((prevState) => !prevState)

    // if (!isConfigOpen) {
    // getYmlConfig();
    // }
  }

  const handleGetConfig = async () => {
    try {
      const res = await axios.get(`${constants.pythonBaseUrl}/stream/get_config`);
      if (res.data.success) {
        let data = res.data.config;
        setModelsState({
          "desk": data.desk_roi_drawing == 0 ? false : true,
          "objects": data.objects_drawing == 0 ? false : true,
          "head": data.head_bbox_drawing == 0 ? false : true,
          "deskNumber": data.desk_number_drawing == 0 ? false : true,
          "visualfield": data.visual_field_drawing == 0 ? false : true,
          "gaze": data.gaze == 0 ? false : true,
          "heat_map": data.heat_map == 0 ? false : true,
        })
      } else {
        alert("Error getting config");
      }

    } catch (error) {
      console.error("Error getting config:", error);
      alert("Error getting config");
    }
  }
  const handleConfigSave = async () => {

    setIsBackendRestarting(true)
    setDisableSaveButton(true)

    try {
      const res = await axios.get(`${constants.pythonBaseUrl}/stream/change_config?desk_roi_drawing=${modelsState.desk == true ? 1 : 0}&objects_drawing=${modelsState.objects == true ? 1 : 0}&head_bbox_drawing=${modelsState.head == true ? 1 : 0}&desk_number_drawing=${modelsState.deskNumber == true ? 1 : 0}&visual_field_drawing=${modelsState.visualfield == true ? 1 : 0}&gaze=${modelsState.gaze == true ? 1 : 0}&heat_map=${modelsState.heat_map == true ? 1 : 0}`);

      if (res.data.success) {
        setIsBackendRestarting(false)
        // setDisableSaveButton(true)
      } else {
        alert("Error saving config")
        setIsBackendRestarting(false)
        // setDisableSaveButton(true)
      }

    } catch (error) {
      console.error("Error saving config:", error);
      await Swal.fire({ icon: "error", title: "Error", text: "Something went wrong!", })
        .then(() => { setIsConfigUpdating(false) })
      setIsConfigUpdating(false)
      setDisableSaveButton(true)
    }
  }

  const handleSwitchChange = (modelName, isChecked) => {
    setModelsState((prevState) => ({
      ...prevState,
      [modelName]: isChecked
    }))
    setDisableSaveButton(false)
  };

  return (
    <div className="mainBox"
      style={{
        position: "relative",
        left: langReducer == "en" ? `${sideBarWidth}px` : "initial",
        // right: langReducer == "ar" ? `${sideBarWidth}px` : "initial",
        width: `calc(100vw - ${sideBarWidth}px)`,
        height: `calc(100vh - ${headerHeight}px)`,
        direction: langReducer == "en" ? "ltr" : "rtl",
        fontFamily: langReducer == "en" ? englishFont : arabicFont,
      }}>

      <Box className={`settingsIconBox ${langReducer == "en" ? 'settingsIconBoxltr' : 'settingsIconBoxrtl'}`}>
        {isBackendRestarting && (
          <CircularProgress size={50} thickness={4} sx={{ position: "absolute", color: "#952D98" }} />
        )}
        <SettingsIcon onClick={!isBackendRestarting ? toggleConfigDrawer : () => { }}
          sx={{
            background: "#fff", borderRadius: "50%", fontSize: 40, color: "#183E61", cursor: "pointer", transition: "all 0.1s ease",
            ...(!isBackendRestarting && {
              '&:hover': {
                opacity: 0.85,
                transition: "all 0.1s ease",
              }
            }),
            opacity: isBackendRestarting ? 0.5 : 1
          }}
        />

      </Box>

      <Drawer
        open={isConfigOpen}
        onClose={toggleConfigDrawer}
        direction={langReducer == "en" ? 'right' : 'left'}
        size={300}
        duration={300}
        overlayOpacity={0.4}
        overlayColor={"#000"}
        enableOverlay={true}
        zIndex={100}
        children={null}
        className={"configDrawer"}
        overlayClassName={undefined}
        lockBackgroundScroll={false}
      >
        {/* Header */}
        <div className="offcanvas-header border-bottom">
          <div className="">
            <h5 className="mb-0" style={{ fontSize: "1.5rem", fontWeight: 500, lineHeight: 1.2, paddingBottom: 0 }}>{t('configuration')}</h5>
          </div>
          <a href="javascript:;" className="primaery-menu-close">
            <CloseIcon
              onClick={toggleConfigDrawer}
              sx={{
                color: "#c7cad2",
                padding: "5px",
                fontSize: "2.2rem",
                transition: "all 0.1s ease",
                '&:hover': {
                  background: "#39404d75 !important",
                  borderRadius: "50%",
                  transition: "all 0.1s ease",
                }
              }}
            />
          </a>
        </div>
        {/* Header */}

        <div className="offcanvas-body border-2 h-full justify-between">
          <div className='w-full flex flex-col gap-2 '>
            <div className="configItemTitle">{t('show-hide-bounding-boxes')}</div>
            {
              configOptions.map((item, i) => {

                return (
                  <div key={item.name + "" + i} style={{ border: "1px solid #8080803d", borderRadius: 5, padding: "5px 12px" }}>
                    <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "Roboto", fontWeight: 400, fontSize: "0.9em" }}>{t(item.label.replaceAll(" ", "-").toLowerCase())}</span>
                      {item.enableSwitch &&
                        <span dir="rtl">
                          <Switch
                            color='success'
                            checked={modelsState[item.name]}
                            onChange={(e) => handleSwitchChange(item.name, e.target.checked)}
                            inputProps={{ 'aria-label': 'controlled' }}
                            disabled={isBackendRestarting}
                          />
                        </span>
                      }
                    </div>
                  </div>
                )
              })
            }
          </div>



          <div className='w-full flex flex-col gap-4'>
            <LoadingButton
              loading={isConfigUpdating}
              loadingPosition="start"
              startIcon={langReducer == "en" ? <SaveIcon /> : null}
              endIcon={langReducer == "ar" ? <SaveIcon /> : null}
              variant="contained"
              disabled={isBackendRestarting || disableSaveButton}
              onClick={handleConfigSave}
              sx={{ background: "#183E61", direction: "ltr", height: "40px", '&:hover': { background: '#183E61', opacity: 0.9 } }}
            >{t('save')} </LoadingButton>
          </div>
        </div>
      </Drawer>

      <div className="cardsParentBox"
        style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>

          {/* Start/Stop Button */}
          <span className={classes.heading}>{t('live-attention')}</span>

          {/* <div style={{ display: "flex", gap: 10 }}>
            <Button variant="contained" onClick={showToast}>Toast</Button>
            <Button variant="contained" onClick={closeAllNotifications}>Close</Button>
          </div> */}

          {isChartRunning ? (
            <Button variant="contained" style={{ padding: 0, borderRadius: "5px !important" }} onClick={handleStopChart}>{t('stop')}</Button>
          ) : (
            <Button variant="contained" style={{ padding: 0, borderRadius: "5px !important" }} onClick={handleStartChart}>{t('start')}</Button>
          )}

        </div>
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-evenly", alignItems: "center", gap: "10px" }}>

          <DataCard
            impressionOn="ATTENTIVE"
            icon={<SportsScoreIcon sx={{ fontSize: "3.5vw" }} />}
            // percentage={camera1StreamInfo?.data?.length ? camera1StreamInfo?.data[1][activeDeskIndex].Att_Score?.toFixed(2) + "%" : "None"}
            // percentage={camera1StreamInfo?.data ? camera1StreamInfo?.data['analytics'][activeDeskIndex].Att_Score?.toFixed(2) + "%" : "None"}
            percentage={
              camera1StreamInfo?.data ?
                (camera1StreamInfo.data['absent']['card_resetting'][activeDeskIndex] ?
                  t('none') :
                  camera1StreamInfo?.data['analytics'][activeDeskIndex].Att_Score?.toFixed(2) + "%") :
                t('none')
            }
          />

          <DataCard
            impressionOn="NON ATTENTIVE"
            icon={<PendingIcon sx={{ fontSize: "3.5vw" }} />}
            // percentage={camera1StreamInfo?.data ? camera1StreamInfo.data['analytics'][activeDeskIndex]["Other"].toString() + "%" : "None"}
            percentage={
              camera1StreamInfo?.data ?
                (camera1StreamInfo.data['absent']['card_resetting'][activeDeskIndex] ?
                  t('none') :
                  camera1StreamInfo.data['analytics'][activeDeskIndex]["Other"].toString() + "%") :
                t('none')
            }
          />
          <AnomalyDataCard
            title="BEHAVIOUR"
            // icon={<TroubleshootIcon sx={{ fontSize: 42 }} />}
            // camera1StreamInfo={camera1StreamInfo?.data ? camera1StreamInfo.data['behaviour'][activeDeskIndex - 1] : "None"}
            camera1StreamInfo={
              camera1StreamInfo?.data ?
                (camera1StreamInfo.data['absent']['card_resetting'][activeDeskIndex] ?
                  "None" :
                  camera1StreamInfo.data['behaviour'][activeDeskIndex - 1]) :
                "None"
            }
            // anomalies={anomalies}
            onClick={() => handleChartModalOpen()}
          />
        </div>
      </div>

      <div className="streamParentBox" >

        <div style={{ width: "100%", height: "100%" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>

            {/* Header --- Stream */}
            <span className={classes.heading}>{t('stream')}</span>

          </div>

          {/* Displaying stream */}
          <div style={{ height: "calc(100% - 30px)", display: "flex", gap: "10px", width: "100%", position: "relative" }}>
            <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", }}>

              {/* <img src="/images/exHall.png" alt="Stream" style={{ height: "calc(99%)", width: "100%", objectFit: "contain" }} /> */}

              {(camera1StreamInfo.stream) ?
                <img src={camera1StreamInfo.stream} alt="Stream" style={{ height: "calc(99%)", width: "100%", objectFit: "contain" }} />
                :
                <div style={{ width: "100%", height: "100%", background: "rgba(24, 62, 97, 0.1)", borderRadius: 20, display: "flex", justifyContent: "center", alignItems: "center", color: "gray", fontSize: 22 }}>
                  {
                    (isStreamLoading) ?
                      <Box sx={{ display: 'flex' }}>
                        <CircularProgress sx={{ color: "rgba(24, 62, 97, 1)" }} size={50} thickness={7} />
                      </Box>
                      : t('stream-is-offline')
                  }

                </div>
              }
            </div>


          </div>
        </div>


        {/* <div style={{ width: "30%", height: "100%" }}>
          <div style={{ display: "flex", height: "100%", flexDirection: "column", justifyContent: "space-between" }}>

            <span className={classes.heading}>Notifications</span>
            <div style={{ background: "#e2f1ff", height: "calc(100% - 30px)", borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: "0px", width: "100%", position: "relative" }}>

              <div style={{
                background: "#fff",
                borderRadius: 10,
                width: "90%",
                height: "40px",
                margin: "10px",
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "0px 5px",
                boxShadow: " 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05)",
                animation: "0.35s cubic-bezier(0.21, 1.02, 0.73, 1) 0s 1 normal forwards running go2645569136"
              }}>
                <div>
                  🔔
                </div>
                <div style={{ fontSize: "1.1vw" }}>Something went wrong</div>
              </div>

              <div style={{
                background: "#fff",
                borderRadius: 10,
                width: "90%",
                height: "40px",
                margin: "10px",
                display: "flex",
                gap: 10,
                alignItems: "center",
                padding: "0px 5px",
                boxShadow: " 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05)",
                animation: "0.35s cubic-bezier(0.21, 1.02, 0.73, 1) 0s 1 normal forwards running go2645569136"
              }}>
                <div>
                  🔔
                </div>
                <div style={{ fontSize: "1.1vw" }}>Something went wrong</div>
              </div>
            </div>
          </div>
        </div> */}
      </div>

      <ImageModal
        openImageModal={openImageModal}
        closeModal={handleImageModalClose}
        img={detectedImage}
        title={t(imageModalTitle.replaceAll(" ", "-").toLocaleLowerCase())}
      />
      {memoizedActionChart}
      <Toaster containerStyle={{ zIndex: "999" }} />
    </div>
  );
}

export default ExaminationHallV2;