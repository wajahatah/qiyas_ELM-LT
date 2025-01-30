
export const constants = {
    siteName: "[Site Name]",
    pythonBaseUrl: "http://localhost:8004",
    pythonDbUrl: "http://localhost:8005",


    helperBaseUrl: "http://192.168.18.36:8005",
    webSocketUrl: "ws://192.168.18.36:8005/stream/ws",
    
    clusterUrlPrefix: "http://",
    clusterSocketPrefix: "ws://",
    clusterSocketSuffix: "/stream/ws",
    
    byPassInitialApiCalling: true,
    defaultDeskName: "Desk",


    cameraLinks: [
        "video_1.mp4",
        "video_2.mp4",
        "video_3.mp4",
        "video_4.mp4",
        "video_5.mp4"
    ],


    flashAlertTime: 3000, // 3 sec
    coolDownTime: 10000, // 10 sec


    //------ Notificatins Alerts (snackbars)
    notificationBufferTime: 2000, // 2 sec
    notificationDuration: 3000,
    notificationPosition: 'bottom-right'
}