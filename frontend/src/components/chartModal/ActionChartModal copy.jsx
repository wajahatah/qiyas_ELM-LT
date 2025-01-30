import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { useSelector } from 'react-redux';

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

const ActionChartModal = React.memo(function ChartModal(props) {
    const {
        openChartModal,
        closeChartModal,
        areaChartData,
        handleMouseDown,
        handleMouseUp,
        handleHighChartMarkerClick,
        activeDeskIndex,
    } = props;

    let selectedCameraIndex = useSelector((data) => data.cameraIndex)
    const chartComponentRef = useRef(null); // Reference for Highcharts instance
    var activeDesk = useSelector(data => data.activeDeskIndex);



    // console.log("areaChartDatadd:", areaChartData[0]);

    const [behaviourHighChartOptions, setBehaviourHighChartOptions] = useState({
        chart: {
            backgroundColor: "white",
            type: "area",
            animation: false,
            marginTop: 60,

        },
        title: {
            text: "",
            // style: {
            //     color: "#183e61",
            //     fontSize: "16px",
            //     fontWeight: "bold",
            // }
        },
        subtitle: {},
        rangeSelector: {
            selected: 1
        },
        plotOptions: {
            series: {
                animation: {
                    duration: `50`
                }, // Disable animation for series updates

                point: {
                    events: {
                        click: (e) => {
                            let x = e.point.category;
                            let y = e.point.y;
                            let seriesIndex = e.point.index;
                            handleHighChartMarkerClick(x, y, seriesIndex, activeDesk);
                        }
                    }
                },
                fillColor: {
                    linearGradient: [0, 0, 0, 300],
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [
                            1,
                            Highcharts.color(Highcharts.getOptions().colors[0])
                                .setOpacity(0)
                                .get("rgba"),
                        ],
                    ],
                },
            },
        },
        series: [{
            name: 'Behaviour',
            data: [],
            type: 'area',
            threshold: null,
            tooltip: {
                valueDecimals: 2
            },
        }],
        xAxis: {
            categories: [],
            zoomEnabled: true,
            max: areaChartData[0].data[selectedCameraIndex].length > 5 ? 5 : null,

        },
        yAxis: {
            min: 0,
            max: 4,
            offset: 220,
            title: {
                enabled: false,
                text: "Behaviour"
            },
            labels: {
                align: "left",
                x: 0,
                crossing: 0,
                formatter: function (e) {
                    switch (e.value) {
                        case 0: return ".";
                        case 1: return "LOOKING AROUND";
                        // case 2: return "LOOKING BACKWARD";
                        case 2: return "USING MOBILE PHONE";
                        // case 4: return "STANDING UP";
                        case 3: return "RAISING HAND";
                        case 4: return "INTERACTING WITH INVIGILATOR";
                        default: return e.value;
                    }
                }
            },
            tickPositions: [0, 1, 2, 3, 4], // Ensure all labels are displayed
            tickInterval: 1, // Ensure there is a tick for each level
        },
        responsive: {
            rules: [{
                condition: {},
                chartOptions: {
                    subtitle: {},
                    navigator: {
                        enabled: false
                    },
                    scrollbar: {
                        enabled: true
                    },
                    legend: {
                        enabled: false
                    },
                    rangeSelector: {
                        enabled: false
                    },
                    xAxis: {
                        labels: {
                            enabled: true,
                            formatter: function () {
                                return this.value;
                            }
                        }
                    }
                }
            }]
        },
        credits: {
            enabled: false,
        },
        accessibility: { enabled: false },
    });

    const updateChartOptions = (data) => {
        const dataLength = data[0].data[selectedCameraIndex].length;
        const newMax = dataLength > 5 ? 5 : null; // Determine new max value for xAxis
        setBehaviourHighChartOptions((prevOptions) => ({
            ...prevOptions,
            series: [{
                ...prevOptions.series[0],
                name: 'Behaviour',
                data: data[0].data[selectedCameraIndex],
                type: 'area',
                threshold: null,
                tooltip: {
                    valueDecimals: 2
                },
            }],
            xAxis: {
                ...prevOptions.xAxis,
                categories: data[0].categories[selectedCameraIndex],
                zoomEnabled: true,
                max: newMax, // Set max value dynamically
            },
            plotOptions: {
                ...prevOptions.plotOptions,
                series: {
                    ...prevOptions.plotOptions.series,
                    point: {
                        events: {
                            click: (e) => {
                                let x = e.point.category;
                                let y = e.point.y;
                                let seriesIndex = e.point.index;
                                handleHighChartMarkerClick(x, y, seriesIndex, activeDesk);
                            }
                        }
                    }
                }
            }
        }));

        const chart = chartComponentRef.current?.chart;
        if (chart) {
            const dataLength = data[0].data[selectedCameraIndex].length;
            const newMax = dataLength > 5 ? dataLength - 1 : 5;
            const currentExtremes = chart.xAxis[0].getExtremes();
            if (currentExtremes.max < newMax) {
                chart.xAxis[0].setExtremes(newMax - 5, newMax, true, false);
            }
            chart.series[0].setData(data[0].data[selectedCameraIndex], true, false, false); // Update data without animation
            chart.redraw();
        }
    };

    useEffect(() => {

        if (areaChartData.length >= 0 && chartComponentRef.current) {
            const chart = chartComponentRef.current.chart;

            // Update the series data
            chart.series[0].setData(areaChartData[0].data[selectedCameraIndex], false);

            // Update the xAxis categories
            chart.xAxis[0].setCategories(areaChartData[0].categories[selectedCameraIndex], false);

            // Optionally, adjust the extremes
            const dataLength = areaChartData[0].data[selectedCameraIndex].length;
            const newMax = dataLength > 5 ? dataLength - 1 : 5;
            const currentExtremes = chart.xAxis[0].getExtremes();
            if (currentExtremes.max < newMax) {
                chart.xAxis[0].setExtremes(newMax - 5, newMax, true, false);
            }

            // Redraw the chart with the updated data and categories
            chart.redraw();
        }
    }, [areaChartData, openChartModal, selectedCameraIndex]);

    useEffect(() => {
        if (openChartModal && areaChartData.length > 0) {
            updateChartOptions(areaChartData);
        }
    }, [openChartModal]);

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
                                padding: "20px 15px"
                            }}
                        >
                            ALERTS FOR DESK {activeDeskIndex} 
                        </Typography>
                        <div
                            className="chartsParentBox"
                            onMouseEnter={handleMouseDown}
                            onMouseLeave={handleMouseUp}
                        >
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={behaviourHighChartOptions}
                                ref={chartComponentRef} // Attach the reference here
                                immutable={false} // Allow updates to be handled directly
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
    return prevProps.openChartModal === nextProps.openChartModal &&
        prevProps.areaChartData === nextProps.areaChartData;
});

export default ActionChartModal;
