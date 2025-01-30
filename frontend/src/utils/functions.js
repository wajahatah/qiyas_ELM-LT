import axios from "axios"
import { constants } from "../constants/constants"

export const get_ocr_data = async () => {
    return axios.get(constants.pythonBaseUrl + "/stream/get_desk_name")
        .then(response => {
            // console.log("-----------------------------");
            // console.log("response");
            // console.log(response);
            // console.log("-----------------------------");
            if (response.data.length > 0) {
                return response.data[0];
            } else {
                return constants.defaultDeskName;
            }
        })
        .catch(error => {
            console.error("Error fetching OCR data:", error);
            throw error;
        });

};

export const get_cameras = async () => {
    return axios.get(constants.pythonBaseUrl + "/stream/get_ids")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.error("Error fetching OCR data:", error);
            throw error;
        });

};

