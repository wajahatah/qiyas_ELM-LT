import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import raisingHand from "/images/raise-hand.png"
import eyes from "/images/eyes.png"
import streetView from "/images/street-view.png"
import usingMobilePhone from "/images/touch.png"
import interaction from "/images/interaction.png"
import normal from "/images/computer-worker.png"
import none from "/images/no-stopping.png"
import { useTranslation } from 'react-i18next';

export default function AnomalyDataCard(props) {
    let { title, camera1StreamInfo, onClick } = props;
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


    // if (camera1StreamInfo["raising hand"]) {
    //     alertText = "RAISING HAND"
    // }
    // else if (camera1StreamInfo["standing up"]) {
    //     alertText = "STANDING UP"
    // }
    // else if (camera1StreamInfo["looking backward"]) {
    //     alertText = "LOOKING BACKWARD"
    // }
    // else if (camera1StreamInfo["using mobile phone"]) {
    //     alertText = "USING MOBILE PHONE"
    // }
    // else if (camera1StreamInfo["looking around"]) {
    //     alertText = "LOOKING AROUND"
    // }
    // else if ((camera1StreamInfo["student interacting with invigilator"])) {
    //     alertText = "INTERACTING WITH INVIGILATOR"
    // }
    // else if (
    //     (camera1StreamInfo["use mouse/keyboard"]) ||
    //     (camera1StreamInfo["sitting"]) ||
    //     (camera1StreamInfo["writing on tablet"]) ||
    //     (camera1StreamInfo["drinking water"])
    // ) {
    //     alertText = "Normal"
    // }
    // else { alertText = "None" }

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
            },
        }}
            onClick={onClick}
        >
            <CardContent sx={{ padding: 1, position: "relative", width: "100%", height: "100% !important", textWrap: "nowrap" }}>
                <Typography sx={{ fontSize: "1vw", color: "#183E61", fontWeight: "bold" }} gutterBottom >
                    {(title.toLowerCase() === "total score") || (title.toLowerCase() === "behaviour")
                        ?
                        // `${title}`
                        `${t(title.replaceAll(" ", "-").toLowerCase())}`
                        :
                        `Attention on ${title}`
                    }
                </Typography>

                <Box style={{ width: "100%", height: "calc(100% - 14px)", display: "flex", justifyContent: "space-between", gap: 0, alignItems: "center" }}>
                    {/* {icon} */}
                    <Typography color="text.secondary" gutterBottom
                        sx={{ margin: "auto 0px", padding: "0px 5px", fontSize: "1.5vw", fontWeight: "bold", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", display: "flex", alignItems: "center", gap: 2 }}                    >
                        <span>
                            {alertText && <img src={icons[alertText.toLowerCase()].icon} alt="img" style={{ width: "3vw" }} />}
                            {/* {alertText && <img src={usingMobilePhone} alt="img" style={{ width: "3vw" }} />} */}
                        </span>
                        <span>
                            {/* {alertText} */}
                            {/* {t('none')} */}
                            {alertText && t(alertText.replaceAll(" ", "-").toLocaleLowerCase())}
                        </span>
                    </Typography>
                </Box>

            </CardContent>

        </Card >
    );
}
