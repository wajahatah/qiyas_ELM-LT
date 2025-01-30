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
    lang: "en",
    desks: [
        { name: "Desk", desk: "desk1", active: true, alert: 5, flash: false, disabled: false },
        { name: "Desk", desk: "desk2", active: false, alert: null, flash: false, disabled: false },
        { name: "Desk", desk: "desk3", active: false, alert: 2, flash: false, disabled: false },
        { name: "Desk", desk: "desk4", active: false, alert: null, flash: false, disabled: false }
    ]
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



    return state;
}