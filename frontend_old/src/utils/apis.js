import axios from "axios";
import { constants } from "../constants/constants";

export const handleGeneratePdf = async (date) => {
    // console.log("in apis / handleGeneratePdf");
    try {
        const url = `${constants.pythonDbUrl}/stream/download_pdf`;
        const params = { date_select: date };
        const headers = { accept: 'application/json' };
        const response = await axios.get(url, { params, headers, responseType: 'blob' });

        if (response.headers['content-type'] === 'application/pdf') {

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
        return true;

    } catch (error) {
        console.log("error:", error);
        return false;
    }
}