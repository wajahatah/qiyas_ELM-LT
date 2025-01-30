import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { constants } from '../constants/constants';
import { get_camera_info } from '../utils/functions';
import { anomalyConstants } from '../constants/anomalyConstants';
import { useSound } from './SoundContext';


export const AnomalyAlertsContext = createContext();


export const AnomalyAlertsProvider = ({ children }) => {
    const { playSound } = useSound();
    // const [cameras, setCameras] = useState([
    //     {
    //         cam_id: "camera_1", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_2", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_3", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_4", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_5", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_6", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_7", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_8", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_9", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_10", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_11", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_12", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_13", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_14", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_15", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     },
    //     {
    //         cam_id: "camera_16", alert: false, alertsCount: 0,
    //         deskAlerts: {
    //             1: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             2: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             3: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } },
    //             4: { count: 0, alert: { looking_around: 0, hand_raise: 0, Student_Interacting_with_Invigilator: 0 } }
    //         },
    //         activeDesk: { 1: true, 2: true, 3: true, 4: true }
    //     }
    // ])

    const [isSocketConnected, setIsSocketConnected] = useState(false);
    // const [cameras, setCameras] = useState([
    //     {
    //         "cam_id": "camera_1",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "1": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "2": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "3": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "4": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "1": true,
    //             "2": true,
    //             "3": true,
    //             "4": true
    //         }
    //     },
    //     {
    //         "cam_id": "camera_2",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "5": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "6": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "7": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "8": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "5": true,
    //             "6": true,
    //             "7": true,
    //             "8": true
    //         }
    //     },
    //     {
    //         "cam_id": "camera_3",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "9": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "10": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "11": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "12": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "9": true,
    //             "10": true,
    //             "11": true,
    //             "12": true
    //         }
    //     },
    //     {
    //         "cam_id": "camera_4",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "13": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "14": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "15": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "16": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "13": true,
    //             "14": true,
    //             "15": true,
    //             "16": true
    //         }
    //     },
    //     {
    //         "cam_id": "camera_5",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "17": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "18": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "19": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "20": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "17": false,
    //             "18": false,
    //             "19": false,
    //             "20": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_6",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "21": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "22": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "23": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "24": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "21": false,
    //             "22": false,
    //             "23": false,
    //             "24": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_7",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "25": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "26": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "27": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "28": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "25": false,
    //             "26": false,
    //             "27": false,
    //             "28": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_8",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "29": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "30": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "31": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "32": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "29": false,
    //             "30": false,
    //             "31": false,
    //             "32": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_9",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "33": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "34": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "35": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "36": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "33": false,
    //             "34": false,
    //             "35": false,
    //             "36": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_10",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "37": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "38": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "39": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "40": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "37": false,
    //             "38": false,
    //             "39": false,
    //             "40": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_11",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "41": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "42": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "43": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "44": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "41": false,
    //             "42": false,
    //             "43": false,
    //             "44": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_12",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "45": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "46": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "47": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "48": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "45": false,
    //             "46": false,
    //             "47": false,
    //             "48": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_13",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "49": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "50": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "51": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "52": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "49": false,
    //             "50": false,
    //             "51": false,
    //             "52": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_14",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "53": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "54": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "55": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "56": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "53": false,
    //             "54": false,
    //             "55": false,
    //             "56": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_15",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "57": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "58": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "59": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "60": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "57": false,
    //             "58": false,
    //             "59": false,
    //             "60": false
    //         }
    //     },
    //     {
    //         "cam_id": "camera_16",
    //         "alert": false,
    //         "alertsCount": 0,
    //         "enable": "false",
    //         "deskAlerts": {
    //             "61": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "62": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "63": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             },
    //             "64": {
    //                 "count": 0,
    //                 "alert": {
    //                     [anomalyConstants.lookingAround]: 0,
    //                     [anomalyConstants.raisingHand]: 0,
    //                     [anomalyConstants.studentInteractingWithInvigilator]: 0
    //                 }
    //             }
    //         },
    //         "activeDesk": {
    //             "61": false,
    //             "62": false,
    //             "63": false,
    //             "64": false
    //         }
    //     }
    // ])


    const [cameras, setCameras] = useState([]);




    const transformFetchedData = (fetchedData) => {
        const transformedCameras = Object.entries(fetchedData).map(([key, value]) => {
            const deskAlerts = {};
            const activeDesk = {};

            // Initialize desk alerts and active desk states
            Object.entries(value.data).forEach(([deskKey, deskValue]) => {
                deskAlerts[deskValue.desk] = { count: 0, alert: { [anomalyConstants.lookingAround]: 0, [anomalyConstants.raisingHand]: 0, [anomalyConstants.studentInteractingWithInvigilator]: 0 } }; // Initialize alerts count to 0
                activeDesk[deskValue.desk] = value.enable === "true"; // Enable desks based on the "enable" field
            });

            return {
                cam_id: key, // e.g., "camera_1"
                alert: false,
                enable: value.enable,
                alertsCount: 0,
                deskAlerts,
                activeDesk,
                clusterUrl: value.cluster_url,
            };
        });

        return transformedCameras;
    };

    const fetchCameraInfo = async () => {
        try {
            const data = await get_camera_info();
            // console.log("Fetched camera data:", data);

            const transformedData = transformFetchedData(data);
            // console.log("Transformed camera data:", transformedData);

            setCameras(transformedData);
            console.log("transformedData:", transformedData);
            

        } catch (error) {
            console.error('Error fetching OCR data:', error);
        }
    };

    const socketRef = useRef(null);
    const connectWebSocket = () => {
        console.log("Connecting to WebSocket server...");

        socketRef.current = new WebSocket(`${constants.webSocketUrl}/1`);

        // Event: Connection opened
        socketRef.current.onopen = () => {

            fetchCameraInfo();
            setIsSocketConnected(true);
            console.log("WebSocket connection established");
            // setConnectionStatus("Connected");
        };

  
        socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);


            if (data?.cam_id) {
                setCameras((prevCameras) => {
                    const cameraIndex = prevCameras.findIndex((camera) => camera.cam_id === data.cam_id);
                    const updatedCameras = [...prevCameras];
                    if (cameraIndex !== -1) {

                        if (data?.title === "alert") {
                            playSound("/sounds/alert.wav");
                            // console.log("Alert message received:", data);

                            const currentCamera = updatedCameras[cameraIndex];
                            const updatedDeskAlerts = { ...currentCamera.deskAlerts };

                            // console.log("updatedDeskAlerts:", updatedDeskAlerts);
                            data?.alert?.forEach((alertItem) => {
                                for (const deskKey in alertItem) {
                                    // console.log("deskKey:", deskKey);
                                    // console.log("alertItem:", alertItem[deskKey].desk);


                                    if (updatedDeskAlerts[alertItem[deskKey].desk] !== undefined) {

                                        const alertName = alertItem[deskKey].alert_title.replace(/\s/g, '_').toLowerCase();
                                        // console.log("alertName:", alertName);

                                        updatedDeskAlerts[alertItem[deskKey].desk].count += 1;
                                        updatedDeskAlerts[alertItem[deskKey].desk].alert[alertName] += 1;
                                    }
                                }
                            });
                            // console.log("");

                            updatedCameras[cameraIndex] = {
                                ...updatedCameras[cameraIndex],
                                alert: true,
                                alertsCount: updatedCameras[cameraIndex].alertsCount + data.alert.length,
                                deskAlerts: updatedDeskAlerts,
                            };
                        } else if (data?.title === "message") {
                            const currentCamera = updatedCameras[cameraIndex];
                            const updatedActiveDesk = { ...currentCamera.activeDesk };
                            data?.inactive?.forEach((deskKey) => {
                                if (updatedActiveDesk[deskKey] !== undefined) {
                                    updatedActiveDesk[deskKey] = false;
                                }
                            });
                            data?.activate?.forEach((deskKey) => {
                                if (updatedActiveDesk[deskKey] !== undefined) {
                                    updatedActiveDesk[deskKey] = true;
                                }
                            });

                            updatedCameras[cameraIndex] = {
                                ...updatedCameras[cameraIndex],
                                activeDesk: updatedActiveDesk,
                            };
                        }
                    }
                    // console.log("updatedCameras:", updatedCameras);
                    
                    return updatedCameras;
                });
            }
        };





        // Event: Connection error
        socketRef.current.onerror = (error) => {
            setIsSocketConnected(false);
            console.error("WebSocket error:", error);
            // setConnectionStatus("Error");
        };

        // Event: Connection closed
        socketRef.current.onclose = () => {
            setIsSocketConnected(false);
            console.log("WebSocket connection closed");
            // setConnectionStatus("Disconnected");
        };
    }
    useEffect(() => {
        // fetchCameraInfo();
        setTimeout(connectWebSocket, 2000);
        return () => {
            console.log("Closing WebSocket connection...");
            socketRef.current.close();
            if (socketRef.current) {
                socketRef.current.close();
            }
        };
    }, [])

    return (
        <AnomalyAlertsContext.Provider value={{ cameras, setCameras, isSocketConnected }}>
            {children}
        </AnomalyAlertsContext.Provider>
    );
}
export const useAnomalyAlerts = () => useContext(AnomalyAlertsContext);