// import { constants } from "../../constants/constants";

const INITIAL_STATE = {
    themeMode: "light",
    sideBarWidth: 220,
    headerHeight: 62,
    isLoggedIn: false,
    activeDesk: "desk1",
    activeDeskIndex: 1,
    selectedCamera: "",
    cameraIndex: "camera_1",
    arabicFont: "Readex Pro, sans-serif",
    englishFont: "Roboto, sans-serif",
    downloadPDFModal: false,
    lang: "en",
    desks: [
        { name: "Desk", desk: "desk1", active: true, alert: 5, flash: false, disabled: false },
        { name: "Desk", desk: "desk2", active: false, alert: null, flash: false, disabled: false },
        { name: "Desk", desk: "desk3", active: false, alert: 2, flash: false, disabled: false },
        { name: "Desk", desk: "desk4", active: false, alert: null, flash: false, disabled: false }
    ],
    camerasList: [],
    actionChartState: {}
};


export default (state = INITIAL_STATE, action) => {

    if (action.type === "SETDESKALERT") {
        const { desk, alert } = action.payload;

        const updatedDesks = state.desks.map(item => {
            if (item.desk === desk) {
                return { ...item, alert };
            }
            return item;
        });
        return { ...state, desks: updatedDesks };
    }
    else if (action.type === "SETACTIVEDESK") {
        const { desk, active } = action.payload;

        // Set all desks' active property to false
        const updatedDesks = state.desks.map(item => {
            return { ...item, active: false };
        });

        // Find the desk to set as active and update its active property
        const deskIndex = updatedDesks.findIndex(item => item.desk === desk);
        if (deskIndex !== -1) {
            updatedDesks[deskIndex] = { ...updatedDesks[deskIndex], active };
        }
        return { ...state, activeDesk: desk, desks: updatedDesks };
    }
    else if (action.type === "SETACTIVEDESKINDEX") {
        const { activeDeskIndex } = action.payload;
        return { ...state, activeDeskIndex: activeDeskIndex };
    }
    else if (action.type === "TOGGLEFLASH") {
        const { desk, flash } = action.payload;
        const updatedDesks = state.desks.map(item => {
            if (item.desk === desk) {
                return { ...item, flash };
            }
            return item;
        });
        return { ...state, desks: updatedDesks };
    }
    else if (action.type === "REMOVEFLASHALERS") {
        const updatedDesks = state.desks.map((item, index) => {
            if (index == 0) {
                return { ...item, active: true, alert: 0, flash: false, disabled: false };
            } else {
                return { ...item, active: false, alert: 0, flash: false, disabled: false };
            }
        });
        return { ...state, desks: updatedDesks };
    }
    else if (action.type === "SETOCRCAM1") {
        const { name } = action.payload;
        const updatedDesks = state.desks.map((item, index) => {
            // if (index === 0) {
            return { ...item, name };
            // }
            // return item;
        });
        return { ...state, desks: updatedDesks };
    }
    else if (action.type === "SETSELECTEDCAMERA") {
        const { selectedCamera, cameraIndex } = action.payload;
        return { ...state, selectedCamera: selectedCamera, cameraIndex: cameraIndex };
    }
    else if (action.type === "SETLANGUAGE") {
        const { lang } = action.payload;
        return { ...state, lang: lang };
    }
    else if (action.type === "SETDOWNLOADPDFMODAL") {
        const { downloadPDFModal } = action.payload;
        return { ...state, downloadPDFModal: downloadPDFModal };
    }
    // else if (action.type === "UPDATE_CAMERA_ALERTS") {
    //     const { camId, newAlertsCount } = action.payload; // Pass only the new alerts count
    //     const updatedCameras = state.cameras.map((camera) =>
    //         camera.cam_id === camId
    //             ? {
    //                 ...camera,
    //                 alert: newAlertsCount > 0, // Alert is active if there are new alerts
    //                 alertsCount: newAlertsCount, // Increment count only by new alerts
    //                 checked: false
    //             }
    //             : camera
    //     );
    //     return { ...state, cameras: updatedCameras };
    // }
    // else if (action.type === "CLEAR_CAMERA_ALERTS") {
    //     const { camId } = action.payload; // Pass the specific camera ID to reset
    //     const updatedCameras = state.cameras.map((camera) =>
    //         camera.cam_id === camId
    //             ? {
    //                 ...camera,
    //                 alert: false,        // Reset the alert flag
    //                 alertsCount: 0,      // Reset the alerts count
    //                 checked: true,       // Mark it as checked
    //             }
    //             : camera
    //     );
    //     return { ...state, cameras: updatedCameras };
    // }
    // else if (action.type === "RESET_ALL_CAMERAS") {
    //     const initialCameras = [
    //         { cam_id: "camera_1", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_2", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_3", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_4", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_5", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_6", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_7", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_8", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_9", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_10", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_11", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_12", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_13", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_14", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_15", alert: false, alertsCount: 0, checked: false, disabled: false },
    //         { cam_id: "camera_16", alert: false, alertsCount: 0, checked: false, disabled: false }
    //     ];

    //     return { ...state, cameras: initialCameras }; // Reset cameras to initial state
    // }
    else if (action.type === "SETCAMERASLIST") {
        const { camerasList } = action.payload;
        return { ...state, camerasList: camerasList };
    }
    else if (action.type === "SETACTIONCHARTSTATE") {
        const { cameraCount, deskKeys } = action.payload;
        console.log("cameraCount", cameraCount);
        console.log("deskKeys", deskKeys);

        return { ...state, actionChartState: { cameraCount, deskKeys } };
    }


    return state;
}