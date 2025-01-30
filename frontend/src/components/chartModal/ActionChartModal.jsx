import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Highcharts from "highcharts/highstock";
import HighchartsReact from "highcharts-react-official";
import { useSelector } from 'react-redux';
import { FormControl, InputLabel, NativeSelect } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { formatNumberForLocale } from '../../utils/utils';

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
    const { t, i18n } = useTranslation();
    let langReducer = useSelector((data) => data.lang)
    const {
        openChartModal,
        closeChartModal,
        areaChartData,
        handleMouseDown,
        handleMouseUp,
        handleHighChartMarkerClick,
        activeDeskIndex,
        alertChartDropdownDates,
        setAlertChartDropdownDates,
        handleActionChartDropDownChange,
        selectedDate,
        setSelectedDate,
        mapActionsReverse
    } = props;

    let selectedCameraIndex = useSelector((data) => data.cameraIndex)
    const chartComponentRef = useRef(null); // Reference for Highcharts instance
    var activeDesk = useSelector(data => data.activeDeskIndex);


    const [behaviourHighChartOptions, setBehaviourHighChartOptions] = useState({
        chart: {
            backgroundColor: "white",
            type: "area",
            animation: false,
            marginTop: 60,

        },
        title: {
            text: "",
            // style: { color: "#183e61", fontSize: "16px", fontWeight: "bold", }
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
            reversed: langReducer == "en" ? false : true, // Reverse the x-axis for RTL

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
                align: langReducer === "en" ? "left" : "right",
                x: 0,
                crossing: 0,
                formatter: function (e) {
                    switch (e.value) {
                        case 0: return t(".");
                        case 1: return t('looking-around');
                        // case 2: return "LOOKING BACKWARD";
                        case 2: return t('using-mobile-phone');
                        // case 4: return "STANDING UP";
                        case 3: return t('raising-hand');
                        case 4: return t('interacting-with-invigilator');
                        default: return e.value;
                    }
                }
            },
            tickPositions: [0, 1, 2, 3, 4], // Ensure all labels are displayed
            tickInterval: 1, // Ensure there is a tick for each level
            opposite: langReducer === "en" ? false : true,


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
                        max: (areaChartData[0]?.data && areaChartData[0]?.data[selectedCameraIndex]) && areaChartData[0]?.data[selectedCameraIndex].length > 5 ? 5 : null,
                        // labels: {
                        //     enabled: true,
                        //     formatter: function () {
                        //         return this.value+"pp";
                        //     }
                        // }
                    }
                }
            }]
        },
        credits: {
            enabled: false,
        },
        accessibility: { enabled: false, },
    });


    const updateChartOptions = (data) => {

        const dataLength = areaChartData[0].data ? data[0].data[selectedCameraIndex].length : 0
        const newMax = dataLength > 5 ? 5 : null; // Determine new max value for xAxis
        const shouldHideLabels = dataLength === 0; // Hide labels if no data
        setBehaviourHighChartOptions((prevOptions) => ({
            ...prevOptions,
            series: [{
                ...prevOptions.series[0],
                name: t('behaviour'),
                data: data[0].data[selectedCameraIndex],
                type: 'area',
                threshold: null,
                tooltip: {
                    valueDecimals: 0,
                    pointFormatter: function () {
                        return t(mapActionsReverse[this.y].replaceAll(" ", "-").toLowerCase());
                    }
                }
            }],
            xAxis: {
                ...prevOptions.xAxis,
                categories: data[0].categories[selectedCameraIndex],
                zoomEnabled: true,
                max: newMax, // Set max value dynamically
                reversed: langReducer == "en" ? false : true, // Reverse the x-axis for RTL
                labels: {
                    enabled: !shouldHideLabels, // Disable labels if no data
                },
            },
            yAxis: {
                ...prevOptions.yAxis,
                opposite: langReducer === "en" ? false : true,
                labels: {
                    ...prevOptions.yAxis.labels,
                    align: langReducer === "en" ? "left" : "right",
                },
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
    }, [openChartModal, areaChartData, langReducer]);

    const handleDateChange = (event) => {
        setSelectedDate(event.target.value); // Update selected date when the user changes it
    };



    return (
        <div style={{ direction: langReducer == "en" ? "ltr" : "rtl" }}>
            <Modal
                open={openChartModal}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
                sx={{ padding: "0px !important", direction: langReducer == "en" ? "ltr" : "rtl" }}
            >
                <Box sx={{ ...style }}>
                    <Box>
                        <Box sx={{ background: "#183e61", display: "flex", justifyContent: "space-between" }}>
                            <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ background: "#183e61", color: "#fff", padding: "20px 15px" }}>
                                {t('alerts-for-desk')} {formatNumberForLocale(activeDeskIndex)}
                            </Typography>
                            <Box onClick={closeChartModal}
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
                        <div className="chartsParentBox" onMouseEnter={handleMouseDown} onMouseLeave={handleMouseUp}>
                            <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 1, ml: 1, p: 1, minWidth: 120, width: 200, mt: 2, display: "flex", justifyContent: "flex-end" }}>
                                <FormControl focused fullWidth>
                                    <InputLabel variant="standard" htmlFor="uncontrolled-native"
                                        sx={{
                                            fontWeight: "bold",
                                            transformOrigin: (langReducer == "ar") && "top right",
                                            width: "100%"
                                        }}>
                                        {t('select-date')}
                                    </InputLabel>
                                    <NativeSelect
                                        value={selectedDate} // Bind selectedDate to the dropdown
                                        onChange={(e) => { handleDateChange(e); handleActionChartDropDownChange(e.target.value) }} // Handle changes to the dropdown
                                        inputProps={{ name: 'dates', id: 'uncontrolled-native', }}
                                    >
                                        {alertChartDropdownDates.map((date, index) => (
                                            <option key={date + "" + index} value={date}>{date}</option>
                                        ))}
                                    </NativeSelect>
                                </FormControl>
                            </Box>
                            <HighchartsReact
                                highcharts={Highcharts}
                                options={behaviourHighChartOptions}
                                ref={chartComponentRef} // Attach the reference here
                                immutable={false} // Allow updates to be handled directly

                            />
                        </div>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "end", background: "#c0cbd5", padding: "10px" }}>
                        <Button variant='contained' color='error' onClick={closeChartModal}>{t('close')}</Button>
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