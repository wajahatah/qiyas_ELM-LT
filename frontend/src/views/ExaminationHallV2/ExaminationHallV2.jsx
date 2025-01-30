import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { Box, CircularProgress, Switch } from "@mui/material";

import { makeStyles } from '@material-ui/core/styles';
import toast, { Toaster } from 'react-hot-toast';

import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css';

import ImageModal from "../../components/imageModal/ImageModal.jsx";
import { constants } from "../../constants/constants.js";

import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import SaveIcon from '@mui/icons-material/Save';
import LoadingButton from '@mui/lab/LoadingButton';
import AnomalyDataCard from "../../components/DataCard/AnomalyDataCard.jsx";
import ActionChartModal from "../../components/chartModal/ActionChartModal.jsx";
import axios from "axios";
import "./ExaminationHallV2.css";
import { formatNumberForLocale, getTodayDate, structureActionChartData } from "../../utils/utils.js";
import DownloadPDFModal from "../../components/DownloadPDFModal/DownloadPDFModal.jsx";
import { useAnomalyAlerts } from "../../contexts/AnomalyAlertsContext.jsx";
import { anomalyConstants } from "../../constants/anomalyConstants.js";


function ExaminationHallV2() {

  const location = useLocation();
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

  const { cameras, setCameras } = useAnomalyAlerts()


  const camIndex = location.state.camIndex
  const [extractedDeskAlerts, setExtractedDeskAlerts] = useState({});

  useEffect(() => {
    setExtractedDeskAlerts(cameras[camIndex - 1]?.deskAlerts || {});
  }, [cameras])




  // let sideBarWidth = useSelector((data) => data.sideBarWidth)
  let headerHeight = useSelector((data) => data.headerHeight)

  // var activeDeskIndex = useSelector(data => data.activeDeskIndex);
  // let selectedCameraIndex = useSelector((data) => data.cameraIndex)
  let langReducer = useSelector((data) => data.lang)
  let arabicFont = useSelector((data) => data.arabicFont)
  let englishFont = useSelector((data) => data.englishFont)
  let downloadPDFModal = useSelector((data) => data.downloadPDFModal)
  // let actionChartState = useSelector((data) => data.actionChartState)
  const actionChartHeaderLabel = 'Student Attention'



  const deskNo = useRef(1);
  const deskNoMapped = useRef(null);
  const [imageModalTitle, setImageModalTitle] = useState("");
  const [openImageModal, setOpenImageModal] = useState(false);
  const handleImageModalOpen = () => setOpenImageModal(true);
  const handleImageModalClose = () => setOpenImageModal(false);

  const clearTotalNotificationCount = (deskNoMapped) => {

    setCameras((prevCameras) => {
      const updatedCameras = [...prevCameras];

      if (!updatedCameras[camIndex - 1]) {
        console.error("Invalid camera index");
        return prevCameras; // Return the original state if index is invalid
      }

      const previousDeskAlerts = updatedCameras[camIndex - 1]?.deskAlerts || {};

      // Create a new deskAlerts object
      const updatedDeskAlerts = Object.keys(previousDeskAlerts).reduce((acc, key) => {

        if (key.toString() === deskNoMapped.toString()) {
          acc[key] = {
            count: 0,
            alert: {
              [anomalyConstants.lookingAround]: 0,
              [anomalyConstants.raisingHand]: 0,
              [anomalyConstants.studentInteractingWithInvigilator]: 0,
            },
          };
        } else {
          // Retain other keys if needed
          acc[key] = previousDeskAlerts[key];
        }

        return acc;
      }, {});

      updatedCameras[camIndex - 1] = {
        ...updatedCameras[camIndex - 1],
        alert: false,
        alertsCount: 0,
        deskAlerts: updatedDeskAlerts,
      };

      return updatedCameras;
    });

  }

  const [openChartModal, setOpenChartModal] = useState(false);
  const handleChartModalOpen = (deskNoClicked, deskNoMappedContinous) => {
    clearTotalNotificationCount(deskNoMappedContinous)
    // setDeskNo(deskNoClicked)
    deskNo.current = deskNoClicked;


    deskNoMapped.current = location.state.deskNames[deskNoClicked - 1];
    fetchDatesForAlertsChartDropdown();
    handleActionChartDropDownChange(getTodayDate());
    setOpenChartModal(true)
  };
  const handleChartModalClose = () => setOpenChartModal(false);

  const [isChartRunning, setIsChartRunning] = useState(false);
  const [detectedImage, setDetectedImage] = useState(null);

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




  let [mapActions, setMapActions] = useState({
    "looking around": 1,
    // "looking backward": 2,
    // "using mobile phone": 2,
    // "standing up": 4,
    "raising hand": 2,
    "student interacting with invigilator": 3,
    "Normal": 4,
  })
  let [mapActionsReverse, setMapActionsReverse] = useState({
    "0": "",
    "1": "looking around",
    // "2": "looking backward",
    // "2": "using mobile phone",
    // "4": "standing up",
    "2": "raising hand",
    "3": "Student Interacting with Invigilator",
    "4": "Normal"
  })

  const [camera1StreamInfo, setCamera1StreamInfo] = useState({ stream: null, data: null })
  // const [controller1, setController1] = useState(new AbortController());
  const controller1 = useRef(new AbortController());




  const handleStopChart = async () => {
    console.log("In handleStopChart");

    setIsChartRunning(false);
    cleanupStreamControllers();
    // setController1(new AbortController())
    controller1.current = new AbortController();

  };

  const cleanupStreamControllers = () => {
    // controller1.abort();

    controller1.current.abort();
  };


  useEffect(() => {
    return async () => {
      controller1.current.abort();
    };
  }, [])


  const [isStreamLoading, setIsStreamLoading] = useState(false)

  let selectedCamera = useSelector((data) => data.selectedCamera)


  useEffect(() => {
    dispatch({ type: "REMOVEFLASHALERS" });

    ////// this should be uncommented when the stream is ready
    setCamera1StreamInfo({ stream: null, data: null })
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


  function handleHighChartMarkerClick(x, y, position) {

    const id = actionChartData[0][deskNo.current].ids[location.state.camera][position];
    let url = `${constants.clusterUrlPrefix}${location.state.clusterUrl}/stream/get_image?file_name=${id}`;

    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: url,
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
      url: `${constants.helperBaseUrl}/stream/get_alert_dates?cam_id=${location.state.camera}`,
      headers: {}
    };
    setAlertChartDropdownDates([])
    axios.request(config)
      .then((response) => {
        // console.log("response", response);

        if (response.status === 200) {

          // const parsedData = JSON.parse(response.data)
          const parsedData = response.data
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

  async function handleActionChartDropDownChange(date) {
    setActionChartSelectedDate(date)



    // const { cameraCount, deskKeys } = actionChartState;
    // const data = structureActionChartData(cameraCount, deskKeys, actionChartHeaderLabel);




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
      // url: `${constants.helperBaseUrl}/stream/get_chart_alerts?date=${date.replaceAll("/", "-")}&cam_id=${location.state.camera}`,
      url: `${constants.helperBaseUrl}/stream/get_chart_alerts?date=${date.replaceAll("/", "-")}&cam_id=${location.state.camera}`,
      headers: {}
    };

    axios.request(config)
      .then((response) => {
        if (response.status === 200) {
<<<<<<< HEAD
          // const parsedData = JSON.parse(response.data)
          const parsedData = response.data
          const data = parsedData.data
=======
          // console.log("response", response);
>>>>>>> 3ed9f83ce9fa652e0cc4d1359d2a68be8beb3955

          const parsedData = response.data

          if (parsedData?.success) {
            const data = parsedData.data
            // console.log("data", data);

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
              let fileName = data[i].image;
              // let image = data[i].image;
              let time = data[i].time;

              // console.log(cam_id, candidate, time);

              tempActionData[0][candidate].data[cam_id].push(mapActions[alert_title.toLowerCase()]);
              tempActionData[0][candidate].categories[cam_id].push(time);
              // tempActionData[0][candidate].ids[cam_id].push(alert_ID);
              tempActionData[0][candidate].ids[cam_id].push(fileName);
            }


            setActionChartData([...tempActionData])

          }
        }
      })
      .catch((error) => { console.log(error) });

  }
  // useEffect(() => {
  //   fetchDatesForAlertsChartDropdown();
  //   handleGetConfig()
  // }, [])
  const memoizedActionChart = useMemo(() => {
    // This function will only re-run if camera1StreamInfo changes
    return <ActionChartModal
      openChartModal={openChartModal}
      closeChartModal={handleChartModalClose}
      areaChartData={[actionChartData[0][deskNo.current]]}
      classes={classes}
      chartRef={chartRef}
      handleHighChartMarkerClick={handleHighChartMarkerClick}
      activeDeskIndex={deskNoMapped.current}
      selectedCameraIndex={location.state.camera}
      alertChartDropdownDates={alertChartDropdownDates}
      setAlertChartDropdownDates={setAlertChartDropdownDates}
      handleActionChartDropDownChange={handleActionChartDropDownChange}
      selectedDate={actionChartSelectedDate}
      setSelectedDate={setActionChartSelectedDate}
      mapActionsReverse={mapActionsReverse}
    />;
  }, [openChartModal, actionChartData, deskNo.current]);



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



  const handleGeneratePdf = async () => {
    console.log("in handleGeneratePdf");
    try {
      // setIsPdfDownloading(true)
      const url = `${constants.pythonDbUrl}/stream/download_pdf`;
      const params = { date_select: "09-08-2024" };
      const headers = { accept: 'application/json' };
      const response = await axios.get(url, { params, headers, responseType: 'blob' });


      if (response.headers['content-type'] === 'application/pdf') {

        // PDF successfully generated, initiate download
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Report.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

      }

      // setIsPdfDownloading(false)
      return true;

    } catch (error) {
      // setIsPdfDownloading(false)
      console.log("error:", error);
      return false;
    }
  }



  const socketRef = useRef(null);
  const connectWebSocket = () => {
    console.log("Connecting to Stream WebSocket server...");

    // socketRef.current = new WebSocket(`${constants.streamWebSocketUrl}/1/${location.state.camera}`);
    let socketUrl = constants.clusterSocketPrefix + location.state.clusterUrl + constants.clusterSocketSuffix + "/1/" + location.state.camera;

    socketRef.current = new WebSocket(socketUrl);

    socketRef.current.onopen = () => {
      console.log("Stream WebSocket connection established");
    };

    socketRef.current.onmessage = (event) => {
      setIsStreamLoading(false);
      const data = JSON.parse(event.data);
      // console.log("Stream WebSocket data received:", data);

      // {
      //   frame:"",
      //   behaviour:[],
      //   absent:{},
      // }
      setIsChartRunning(true);
      let base64Img = "data:image/png;base64, " + data.frame;
      setCamera1StreamInfo({ stream: base64Img, data: { behaviour: data.behaviour, absent: data.absent } })
    };

    socketRef.current.onerror = (error) => {
      console.error("Stream WebSocket error:", error);
      setIsStreamLoading(false);

    };

    socketRef.current.onclose = () => {
      console.log("Stream WebSocket connection closed");
      setIsStreamLoading(false);
    };
  }
  useEffect(() => {
    setIsStreamLoading(true);
    setTimeout(connectWebSocket, 1000);
    return () => {
      console.log("Closing Stream WebSocket connection...");
      console.log(socketRef.current);

      // socketRef.current.close();
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [])

  // useEffect(() => {
  //   console.log("camera1StreamInfo", camera1StreamInfo);
  //   console.log(location.state.deskNames)
  //   if (camera1StreamInfo?.data) {
  //     // console.log("camera1StreamInfo.data['behaviour'][index])", camera1StreamInfo?.data['behaviour'][0]);

  //     location.state.deskNames.map((deskNo, index) => {

  //       // console.log(

  //       //   camera1StreamInfo?.data ?
  //       //     (camera1StreamInfo.data['absent']['card_resetting'][index + 1] ? // {1: false, 2: false, 3: false, 4: false}
  //       //       "None" :
  //       //       camera1StreamInfo.data['behaviour'][index]) : //  ['Normal', 'Normal', 'Normal', 'Normal']
  //       //     "None"
  //       // )

  //       // console.log("camera1StreamInfo?.data:", camera1StreamInfo?.data);
  //       console.log("camera1StreamInfo.data['absent']['card_resetting'][index + 1]:", camera1StreamInfo.data['absent']['card_resetting'][index + 1]);
  //       console.log("camera1StreamInfo.data['behaviour'][index]):", camera1StreamInfo.data['behaviour'][index]);



  //     })
  //     console.log("");

  //   }

  // }, [camera1StreamInfo])



  // useEffect(() => {
  //   console.log("totalNotificationCount:", totalNotificationCount);

  // }, [totalNotificationCount])

  return (
    <div className="mainBox"
      style={{
        position: "relative",
        // left: langReducer == "en" ? `${sideBarWidth}px` : "initial",
        // right: langReducer == "ar" ? `${sideBarWidth}px` : "initial",
        // width: `calc(100vw - ${sideBarWidth}px)`,
        height: `calc(100vh - ${headerHeight}px)`,
        direction: langReducer == "en" ? "ltr" : "rtl",
        fontFamily: langReducer == "en" ? englishFont : arabicFont,
      }}>

      {/* <Button variant="contained" onClick={handleGeneratePdf}
        sx={{ position: "absolute", left: langReducer == "ar" && "85px", right: langReducer == "en" && "95px", top: 10, background: "purple", "&:hover": { background: "purple" } }}>
        PDF
      </Button> */}

      {/* <Box className={`settingsIconBox ${langReducer == "en" ? 'settingsIconBoxltr' : 'settingsIconBoxrtl'}`}>
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

      </Box> */}

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
          {/* <span className={classes.heading}>{t('live-attention')}</span> */}
          <span className={classes.heading} style={{ display: "flex", justifyContent: "start", alignItems: "center", flex: 1 }}>{t('behaviour')}</span>
          <span className={classes.heading} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            {t('camera', { count: formatNumberForLocale(camIndex) }).toUpperCase()}
          </span>
          {/* <span className={classes.heading} style={{ display: "flex", justifyContent: "end", alignItems: "center", border: "2px solid", padding: "0px 10px", borderRadius: "10px", background: "#0056a6b8", color: "white" }}>
            {`${t('no. of alerts', { count: formatNumberForLocale(camIndex) }).toUpperCase()}:`} <b style={{ padding: "0px 10px", fontSize: "22px" }}>{formatNumberForLocale(totalNotificationCount)}</b>
          </span> */}

          {/* <div style={{ display: "flex", gap: 10 }}>
            <Button variant="contained" onClick={showToast}>Toast</Button>
            <Button variant="contained" onClick={closeAllNotifications}>Close</Button>
          </div> */}



        </div>
        <div style={{ width: "100%", height: "100%", display: "flex", justifyContent: "space-evenly", alignItems: "center", gap: "10px" }}>

          {
            location.state.deskNames.map((deskNo, index) => {
              const cardResetting =
                camera1StreamInfo?.data?.absent?.card_resetting?.[index + 1];
              const behaviour =
                camera1StreamInfo?.data?.behaviour?.[index];

              return (
                <AnomalyDataCard
                  key={index}
                  title={t('desk', { count: formatNumberForLocale(deskNo) }).toUpperCase()}
                  noOfAlerts={extractedDeskAlerts[deskNo]?.count ? extractedDeskAlerts[deskNo]?.count : null}
                  camera1StreamInfo={
                    camera1StreamInfo?.data
                      ? (cardResetting != "False" ? "None" : behaviour || "None")
                      : "None"
                  }
                  onClick={() => handleChartModalOpen(index + 1, deskNo)}
                />
              );
            })
          }
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
      </div>

      <ImageModal
        openImageModal={openImageModal}
        closeModal={handleImageModalClose}
        img={detectedImage}
        title={t(imageModalTitle.replaceAll(" ", "-").toLocaleLowerCase())}
      />
      {memoizedActionChart}

      <DownloadPDFModal title="Download PDF" openPDFModal={downloadPDFModal} closePDFModal={() => dispatch({ type: "SETDOWNLOADPDFMODAL", payload: { downloadPDFModal: false } })} />
      <Toaster containerStyle={{ zIndex: "999" }} />
    </div>
  );
}

export default ExaminationHallV2;