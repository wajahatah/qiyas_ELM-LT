import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';





export default function DataCard(props) {
    let { impressionOn, icon, percentage, onClick } = props;
    const { t } = useTranslation();


    // console.log("impression on:", impressionOn);
    // console.log("percentage:", percentage);


    // const borderBottomColor = ((impressionOn.toLowerCase() === "attentive") || (percentage == "None")) ?
    //     ((percentage == "0%") || (percentage == "0.00%") || percentage == "None") ? "7px solid red" : "7px solid #03ff03"
    //     :
    //     ((percentage == "0%") || (percentage == "0.00%") || percentage == "None") ? "7px solid #03ff03" : "7px solid red"
    const borderBottomColor = ((impressionOn.toLowerCase() === "attentive") || (percentage == "None")) ?
        ((percentage == "0%") || (percentage == "0.00%") || percentage == "None") ? "7px solid red" : "7px solid #03ff03"
        :
        ((percentage == "0%") || (percentage == "0.00%") || percentage == "None") ? "7px solid #03ff03" : "7px solid red"

    // const borderBottomColorNonAttentive = ((percentage == "0%") || (percentage == "0.00%") || percentage == "None") ? "7px solid #03ff03" : "7px solid red"

    return (
        <Card sx={{

            display: "flex",
            minWidth: 150,
            width: "100%",
            height: "100%",
            transition: "all .2s ease",
            background: "#dbd7f682",
            borderBottom: borderBottomColor,
            // borderBottom: (impressionOn.toLowerCase() === "attentive") ? borderBottomColor : borderBottomColorNonAttentive,
            cursor: "pointer",
            '&:hover': {
                opacity: 0.9,
            },
        }}
            onClick={onClick}

        >
            <CardContent sx={{ padding: 1, position: "relative", height: "100%", width: "100%", textWrap: "nowrap" }}>
                <Typography sx={{ fontSize: "1vw", color: "#183E61", fontWeight: "bold" }}
                    // color="text.secondary"
                    gutterBottom
                >
                    {(impressionOn.toLowerCase() === "total score") || (impressionOn.toLowerCase() === "status") ?
                        `${impressionOn}` :
                        // `Attention on ${impressionOn}`
                        `${t(impressionOn.replaceAll(" ", "-").toLowerCase())}`
                    }
                </Typography>

                <Box style={{ width: "100%", height: "calc(100% - 14px)", display: "flex", justifyContent: "", gap: 20, alignItems: "center" }}>
                    {icon}
                    <Typography sx={{ margin: "auto 0px", fontSize: "1.5vw", fontWeight: "bold" }} color="text.secondary" gutterBottom>
                        {percentage}
                    </Typography>

                </Box>

            </CardContent>

        </Card>
    );
}
