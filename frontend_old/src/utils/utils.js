import i18next from "i18next";

export const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Add leading 0 if necessary
    const day = String(today.getDate()).padStart(2, '0'); // Add leading 0 if necessary
    return `${year}/${month}/${day}`;
};





export const formatNumberForLocale = (number) => {
    const currentLocale = i18next.language;
    if (currentLocale === 'ar') {
        // Format as Arabic numbers
        return new Intl.NumberFormat('ar-EG').format(number);
    }
    // For other locales, use default Western numbering
    return new Intl.NumberFormat(currentLocale).format(number);
};


export const structureActionChartData = (cameraCount, deskKeys, actionChartHeaderLabel) => {
    const data = deskKeys.reduce((acc, deskKey) => {
        const cameras = {};
        // Loop to create camera keys (camera_1 to camera_n)
        for (let i = 1; i <= cameraCount; i++) {
            const cameraKey = `camera_${i}`;
            cameras[cameraKey] = [];
        }

        acc[deskKey] = {
            "name": actionChartHeaderLabel, // Replace this with your actual header label
            "data": cameras,
            "categories": { ...cameras },
            "ids": { ...cameras }
        };

        return acc;
    }, {});

    return data; // Ensure the function returns the generated structure
};
