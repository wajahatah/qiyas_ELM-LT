import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { dir } from 'i18next';



export default function ImageModal(props) {
    const { t } = useTranslation();
    const { openImageModal, closeModal, img, title } = props;

    let langReducer = useSelector((data) => data.lang)

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 800,
        bgcolor: 'background.paper',
        boxShadow: 24,
        display: "flex",
        flexDirection: "column",
        direction: langReducer == "en" ? "ltr" : "rtl"
    };
    return (
        <div >
            <Modal
                open={openImageModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{ padding: "0px !important" }}
            >
                <Box sx={style}>
                    <Box>
                        <Box sx={{ background: "#183e61", display: "flex", justifyContent: "space-between" }}>

                            <Typography id="modal-modal-title" variant="h6" component="h2"
                                sx={{
                                    flex: 1,
                                    background: "#183e61",
                                    color: "#fff",
                                    padding: "20px 15px"
                                }}
                            >
                                {title.toUpperCase()}
                            </Typography>
                            <Box onClick={closeModal}
                                sx={{
                                    display: "flex", justifyContent: "center", alignItems: "center", width: 50, cursor: "pointer",
                                    '&:hover': {
                                        opacity: 0.8,
                                        borderRadius: "50%"
                                    },
                                }}>
                                ❌
                            </Box>
                        </Box>
                        <img src={"data:image/png;base64," + img} alt="Action Recognition"
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain"
                            }}
                        />

                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "end", background: "#c0cbd5", padding: "10px" }}>
                        <Button variant='contained' color='error' onClick={closeModal}>{t('close')}</Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}
