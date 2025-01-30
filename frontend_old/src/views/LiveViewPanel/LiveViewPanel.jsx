import React from 'react'
import { useNavigate } from "react-router";
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import style from "./style.module.css";
import DenseAppBar from '../../components/header/DenseAppBar'
import { formatNumberForLocale } from '../../utils/utils';
import { useAnomalyAlerts } from '../../contexts/AnomalyAlertsContext.jsx';


import { Box } from "@mui/material";
import { styled } from "@mui/system";
import { anomalyConstants } from '../../constants/anomalyConstants.js';
export default function LiveViewPanel() {
    let arabicFont = useSelector((data) => data.arabicFont)
    let englishFont = useSelector((data) => data.englishFont)
    let langReducer = useSelector((data) => data.lang)

    const navigate = useNavigate()
    const { t } = useTranslation();

    const { cameras, setCameras, isSocketConnected } = useAnomalyAlerts()

    const handleCameraCardClick = async (camId, camIndex, clusterUrl, totalNotificationCount) => {
        let deskNames = Object.keys(cameras.filter((camera, index) => camera.cam_id === camId)[0].deskAlerts)
        navigate("/stream", { state: { camera: camId, camIndex: camIndex, deskNames: deskNames, clusterUrl: clusterUrl, totalNotificationCount: totalNotificationCount } })
    }



    const isCameraDisabled = (cameraId, index) => {
        // console.log("cameras:", cameras);

        if (cameras.length === 0) return false; // If no camera data, assume not disabled
        const camera = cameras[index];
        // return camera && camera._id === cameraId && camera.disabled;
        return camera && camera.cam_id === cameraId && camera.enable == "false";
    };

    const onCardClick = (cameraId, index, clusterUrl, totalNotificationCount) => {
        if (!isCameraDisabled(cameraId, index)) {
            const camIndex = index + 1
            handleCameraCardClick(`camera_${camIndex}`, camIndex, clusterUrl, totalNotificationCount);
        }
    };

    return (
        <div className={style.mainBox} style={{ direction: langReducer == "ar" && "rtl", isolation: 'isolate' }}>
            <DenseAppBar />

            <div className={style.mainLabel} style={{ fontFamily: langReducer == "en" ? englishFont : arabicFont, zIndex: -1 }}>{t('live_view_panel')}</div>

            <div className={style.gridContainer}>
                {cameras.map((item, index) => {

                    

                    const disabled = isCameraDisabled(item.cam_id, index);

                    const totalNotificationCount = Object.values(item.deskAlerts).reduce((sum, item) => sum + item.count, 0);

                    return (
                        
                        <div key={`${item.cam_id}_${item.alertsCount}`}
                            onClick={() => onCardClick(item.cam_id, index, item.clusterUrl, totalNotificationCount)}
                            className={`${style.gridItemBase} ${(disabled) ? style.gridItemDisabled : style.gridItem} ${(item.alertsCount && item.alertsCount > 0 && !disabled) && style.shake}`}
                        >
                            <div className={style.gridItemContentLabel} style={{ fontFamily: langReducer === "en" ? englishFont : arabicFont }}>
                                {t('camera', { count: formatNumberForLocale(index + 1) }).toUpperCase()}
                            </div>
                            <div className={style.gridItemIconDiv}>

                                {Object.keys(item.activeDesk).map((desk, deskIndex) => {

                                    const mappedDeskIndex = Object.keys(item.activeDesk)[deskIndex]

                                    const isAlert = item.deskAlerts[mappedDeskIndex]?.count > 0;
                                    const deskAlertCount = item.deskAlerts[mappedDeskIndex].count || 0;
                                    const isDeskActive = item.activeDesk[mappedDeskIndex]
                                    const lookingAroundCount = item.deskAlerts[mappedDeskIndex].alert[anomalyConstants.lookingAround] || 0;
                                    const studentInteractingWithInvigilatorCount = item.deskAlerts[mappedDeskIndex].alert[anomalyConstants.studentInteractingWithInvigilator] || 0;
                                    const raisingHandCount = item.deskAlerts[mappedDeskIndex].alert[anomalyConstants.raisingHand] || 0;
                                    const anomalyCountDeskWise = [
                                        raisingHandCount > 0,
                                        lookingAroundCount > 0,
                                        studentInteractingWithInvigilatorCount > 0,
                                    ].filter(Boolean).length

                                    return (
                                        <div key={deskIndex} style={{ transition: "1.5s all linear forward", width: "100%", position: "relative", display: "flex", flexDirection: "column", gap: "0px", alignItems: "center" }} className={`${(!isDeskActive && !disabled) && style.disabledDesk}`}>
                                            <div className={`${style.deskIconBox} ${(isDeskActive && !disabled) && style.rainbow} ${(isDeskActive && !disabled) && style.deskBoxShadow}`} style={{ "--border-color": isAlert ? "#FF0000" : "#00FF9C", "--shadowColor": "rgba(255, 255, 255, 0.35)", "--delay": `${-Math.random() * 2}s` }}>
                                                <img src="/images/computer-worker.png" alt="Camera Icon" className={`${style.gridItemImg} ${(isDeskActive && !disabled) && style.deskImgBg}`} />
                                            </div>
                                            <span style={{ fontFamily: langReducer === "en" ? englishFont : arabicFont, fontSize: "12px", color: "#fff" }}>
                                                {t('desk', { count: formatNumberForLocale(mappedDeskIndex) }).toUpperCase()}
                                            </span>
                                            {
                                                (!disabled) && (
                                                    <AlertBox
                                                        zeroCounts={raisingHandCount === 0 && lookingAroundCount === 0 && studentInteractingWithInvigilatorCount === 0}
                                                        anomalyCountDeskWise={anomalyCountDeskWise}>
                                                        <Box sx={{ width: "100%", height: "36px", padding: "0px 3px", fontSize: "10px", fontWeight: "bold", color: "#333", display: "flex", justifyContent: anomalyCountDeskWise > 2 ? "space-between" : "center", gap: anomalyCountDeskWise <= 2 ? "8px" : "0px" }}>
                                                            {
                                                                (raisingHandCount > 0) &&
                                                                <div className={`w-max flex flex-col justify-center items-center gap-0`} title="Raising Hand">
                                                                    <span style={{ fontSize: 10, color: "black" }}>{raisingHandCount}</span>
                                                                    <img src="images/raise-hand.png" alt="alerts" className={`object-cover w-4 h-4`} />
                                                                </div>
                                                            }
                                                            {
                                                                (lookingAroundCount > 0) &&
                                                                <div className={`w-max flex flex-col justify-center items-center gap-0`} title="Looking Around">
                                                                    <span style={{ fontSize: 10, color: "black" }}>{lookingAroundCount}</span>
                                                                    <img src="images/eyes.png" alt="alerts" className={`object-cover w-4 h-4`} />
                                                                </div>
                                                            }
                                                            {
                                                                (studentInteractingWithInvigilatorCount > 0) &&
                                                                <div className={`w-max flex flex-col justify-center items-center gap-0`} title="Student Interacting With Invigilator">
                                                                    <span style={{ fontSize: 10, color: "black" }}>{studentInteractingWithInvigilatorCount}</span>
                                                                    <img src="images/interaction.png" alt="alerts" className={`object-cover w-4 h-4`} />
                                                                </div>
                                                            }
                                                        </Box>
                                                    </AlertBox>
                                                )
                                            }
                                            {(isAlert && !disabled) &&
                                                <div className={`${style.deskItemAlertDiv} ${langReducer === "en" ? style.deskItemAlertDivEn : style.deskItemAlertDivAr}`}
                                                    style={{ fontFamily: langReducer === "en" ? englishFont : arabicFont }} >
                                                    {deskAlertCount}
                                                </div>
                                            }
                                        </div>
                                    )
                                }
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {
                !isSocketConnected && <LoadingBox />
            }

        </div >
    )
}

const AlertBox = styled(Box)(({ theme, zeroCounts, anomalyCountDeskWise }) => ({
    backgroundColor: zeroCounts ? "transparent" : "#5B9BD5",
    boxShadow: zeroCounts ? "none" : "0 4px 8px rgba(0, 0, 0, 0.2)",
    borderRadius: "2px",
    display: "flex",
    alignItems: "center",
    gap: "2px",
    zIndex: 99999,
    overflow: "hidden",
    width: (anomalyCountDeskWise > 2) ? "100%" : "max-count",
}));

const LoadingBox = () => {
    return (
        <div style={{ position: "absolute", top: 0, left: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", width: "100%", zIndex: 9999, opacity: 0.8, backgroundColor: "gray" }}>
            <span style={{ color: "black", fontSize: 25 }}>CONNECTING...</span>
            {/* <span style={{ color: "black", fontSize: 12 }}>connection is in progress</span> */}
        </div>
    );
};



