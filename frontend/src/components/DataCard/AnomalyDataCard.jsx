import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import raisingHand from "/images/raise-hand.png"
import eyes from "/images/eyes.png"
import usingMobilePhone from "/images/touch.png"
import interaction from "/images/interaction.png"
import normal from "/images/computer-worker.png"
import none from "/images/no-stopping.png"
import { useTranslation } from 'react-i18next';
import { formatNumberForLocale } from '../../utils/utils';

export default function AnomalyDataCard(props) {
    let { title, noOfAlerts, camera1StreamInfo, onClick } = props;

    const { t } = useTranslation();

    const [icons, setIcons] = React.useState({
        "looking around": { icon: eyes },
        "raising hand": { icon: raisingHand },
        "using mobile phone": { icon: usingMobilePhone },
        "student interacting with invigilator": { icon: interaction },
        "none": { icon: none },
        "normal": { icon: normal },
    })
    let alertText = "None"
    alertText = camera1StreamInfo
    return (
        <Card sx={{
            display: "flex",
            minWidth: 150,
            width: "100%",
            height: "100%",
            transition: "all .2s ease",
            background: "#dbd7f682",
            borderBottom: (alertText == "Normal") ? "7px solid #03ff03" : "7px solid red",
            cursor: "pointer",
            '&:hover': {
                opacity: 0.9,
                scale: 1.01,
                transition: "all .2s ease",
            },
        }}
            onClick={onClick}
        >
            <CardContent sx={{ padding: 1, position: "relative", width: "100%", height: "100% !important", textWrap: "nowrap" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>

                    <Typography sx={{ fontSize: "1vw", color: "#183E61", fontWeight: "bold" }} gutterBottom >
                        {(title.toLowerCase() === "total score") || (title.toLowerCase() === "behaviour")
                            ? `${t(title.replaceAll(" ", "-").toLowerCase())}`
                            :
                            `${title}`
                        }
                    </Typography>
                    {
                        noOfAlerts && <span style={{ fontSize: 14, fontWeight: "500", width: "max-content", display: "flex", justifyContent: "end", alignItems: "center", padding: "0px 10px", borderRadius: "6px", background: "#0056a6b8", color: "white" }}>
                            {`${t('no. of alerts').toUpperCase()}:`} &nbsp; <span style={{ padding: "0px 0px" }}>{formatNumberForLocale(noOfAlerts)}</span>
                        </span>
                    }

                </div>
                <Box style={{ width: "100%", height: "calc(100% - 14px)", display: "flex", justifyContent: "space-between", gap: 0, alignItems: "center" }}>

                    <Box
                        sx={{
                            margin: "auto 0px",
                            padding: "0px 5px",
                            fontSize: "1.5vw",
                            fontWeight: "bold",
                            overflow: "hidden",
                            whiteSpace: "nowrap",
                            textOverflow: "ellipsis",
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                        }}
                    >
                        <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <img
                                src={icons[alertText.toLowerCase()].icon}
                                alt="img"
                                style={{ width: "3vw", flexShrink: 0 }} // Prevent shrinking
                            />
                        </span>
                        <span style={{ overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>

                            {/* Student Interacting with Invigilator */}
                            {alertText && t(alertText.replaceAll(" ", "-").toLocaleLowerCase())}
                        </span>
                    </Box>
                </Box>


            </CardContent>

        </Card >
    );
}
