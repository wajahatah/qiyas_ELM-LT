import React, { memo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

import Chart from 'react-apexcharts';




const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "90vw",
    bgcolor: 'background.paper',
    boxShadow: 24,
    display: "flex",
    flexDirection: "column",
};

const ChartModal = memo(function ChartModal(props) {

    var { openChartModal, closeChartModal, areaChartOptions, areaChartData, classes, chartRef, handleMouseDown, handleMouseUp } = props;


    // areaChartData = [
    //     {
    //         "name": "Student Attention",
    //         "data": [
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4,
    //             4
    //         ],
    //         "categories": [
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:09",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:10",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:11",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:12",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:13",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:14",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:15",
    //             "17:16:16",
    //             "17:16:16",
    //             "17:16:16",
    //             "17:16:16",
    //             "17:16:16",
    //             "17:16:16",
    //             "17:16:16",
    //             "17:16:16",
    //             "17:16:16"
    //         ],
    //         "images": []
    //     }
    // ]

    return (
        <div>
            <Modal
                open={openChartModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{ padding: "0px !important" }}
            >
                <Box sx={style}>
                    <Box>
                        <Typography id="modal-modal-title" variant="h6" component="h2"
                            sx={{
                                background: "#183e61",
                                color: "#fff",
                                padding: "10px"
                            }}
                        >
                            Attention Chart
                        </Typography>

                        {/* /////////////////////////////// */}
                        {/* //// Area Chart */}
                        <div
                            className="chartsParentBox"
                            onMouseEnter={handleMouseDown}
                            onMouseLeave={handleMouseUp}
                        >
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                <span className={classes.heading}>
                                    Attention Graph
                                </span>

                            </div>
                            <Chart
                                ref={chartRef}
                                options={areaChartOptions}
                                series={areaChartData}
                                type="area"
                                height="86%"
                                width="99%"
                            />
                        </div>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "end", background: "#c0cbd5", padding: "10px" }}>
                        <Button variant='contained' color='error' onClick={closeChartModal}>Close</Button>
                    </Box>
                </Box>
            </Modal>
        </div>
    );
}, (prevProps, nextProps) => {
    // Custom comparison function
    return prevProps.areaChartData === nextProps.areaChartData;
});
export default ChartModal;