import { useSelector, useDispatch } from "react-redux";
import Chart from 'react-apexcharts';
import { Button, Icon } from "@mui/material";
import { makeStyles } from '@material-ui/core/styles';

import "./ExaminationHall.css";
import ImageModal from "../../components/imageModal/ImageModal.jsx";
import { useEffect, useState } from "react";
import { constants } from "../../constants/constants.js";

function ExaminationHall() {


  const useStyles = makeStyles({
    playStopIcon: {
      fontSize: "60px !important",
      color: '#fff',
      cursor: 'pointer',
      opacity: 0.1,
      transition: 'opacity 0.1s ease', // Adding transition for smooth effect
      '&:hover': {
        opacity: 1,
      },
    },

    heading: {
      fontSize: "1.2em", fontWeight: "bold", color: "rgba(255,255,255,0.5)", textDecoration: "underline"
    }
  });
  const classes = useStyles();


  const chartTimer = 333.333;
  // const chartTimer = 1000;
  const flashAlertTimer = 3000;




  let sideBarWidth = useSelector((data) => data.sideBarWidth)
  let headerHeight = useSelector((data) => data.headerHeight)
  const activeDesk = useSelector(data => data.activeDesk);
  let dispatch = useDispatch();

  const [openImageModal, setOpenImageModal] = useState(false);
  const handleImageModalOpen = () => setOpenImageModal(true);
  const handleImageModalClose = () => setOpenImageModal(false);

  // function handleAttentionAlert() {
  //   dispatch({ type: "SETDESKALERT", payload: { desk: "desk2", alert: 3 } });
  // }

  function handleMarkerClick(event, chartContext, { seriesIndex, dataPointIndex }) {

    // console.log("event:", event);
    // console.log("chartContext:", chartContext);
    // console.log("seriesIndex:", seriesIndex);
    // console.log("dataPointIndex:", dataPointIndex);


    const category = areaChartData[seriesIndex].categories[dataPointIndex];
    const value = areaChartData[seriesIndex].data[dataPointIndex];
    const image = areaChartData[seriesIndex].images[dataPointIndex];

    if (value > 1 && value < 5) {
      handleImageModalOpen()
    }
  }

  const handleStartChart = () => {
    setIsChartRunning(true);
    // fetchVideoStream1();
  };

  const handleStopChart = () => {
    setIsChartRunning(false);
    // cleanupStreamControllers();
  };
  const [isChartRunning, setIsChartRunning] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [areaChartData, setareaChartData] = useState([
    {
      name: 'Student Attention',
      data: [],
      categories: [],
      images: []
    }
  ]);


  useEffect(() => {
    let sequenceIndex = 0;

    const getRandomNumber = () => {
      const sequence = [1, 1, 2, 1, 4, 1, 1, 1, 3, 1, 1, 1, 2]; // Define the desired sequence
      const number = sequence[sequenceIndex];
      sequenceIndex = (sequenceIndex + 1) % sequence.length; // Increment index and wrap around if it exceeds sequence length
      return number;
    };

    let interval;
    let flashTimeout;

    if (isChartRunning) {
      interval = setInterval(() => {
        const newDataPoint = getRandomNumber(1, 4);

        if (newDataPoint > 1) {
          dispatch({ type: "TOGGLEFLASH", payload: { desk: activeDesk, flash: true } });

          // Clear existing timeout
          if (flashTimeout) {
            clearTimeout(flashTimeout);
          }

          // Set new timeout to turn off flash after 3 seconds
          flashTimeout = setTimeout(() => {
            dispatch({ type: "TOGGLEFLASH", payload: { desk: activeDesk, flash: false } });
          }, flashAlertTimer);
        }

        setareaChartData(prevSeries => {
          const newData = [...prevSeries[0].data, newDataPoint];
          const newCategories = [...prevSeries[0].categories, currentTime.toLocaleTimeString()];
          const newImages = [...prevSeries[0].images, "image" + newDataPoint];
          return [{ ...prevSeries[0], data: newData, categories: newCategories, images: newImages }];
        });
      }, chartTimer);
    } else {
      // If the chart is stopped, clear the interval and set flash to false
      clearInterval(interval);
      clearTimeout(flashTimeout);
      dispatch({ type: "TOGGLEFLASH", payload: { desk: activeDesk, flash: false } });
    }

    return () => {
      clearInterval(interval);
      clearTimeout(flashTimeout);
    };
  }, [isChartRunning]);



  const areaChartOptions = {
    chart: {
      id: 'area-chart',
      fontFamily: "'Rubik', sans-serif",
      zoom: {
        type: "x",
        enabled: true,
        autoScaleYaxis: false,
      },
      toolbar: {
        show: isChartRunning ? false : true,
        // autoSelected: 'zoom',
      },
      events: {
        markerClick: handleMarkerClick

      },
      animations: {
        enabled: true,
        easing: 'linear',
        speed: 100,
        animateGradually: {
          enabled: true,
          delay: 10
        },
        dynamicAnimation: {
          enabled: true,
          speed: 10
        }
      }
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '14px',
        fontFamily: 'Helvetica, Arial, sans-serif',
        fontWeight: 'bold',
        colors: [function (opts) {
          let value = opts.series[0][opts.dataPointIndex]
          if (value == 1) {
            return "green"
          }
          else if (value == 2) {
            return "red"
          }
          else if (value == 3) {
            return "#F9C846"
          }
          else if (value == 4) {
            return "#C200FB"
          }
          else if (value == 5) {
            return "#01BAEF"
          }
        }
        ]
      },

    },
    stroke: {
      width: '3',
      curve: 'smooth',
      // colors:"red"
    },
    grid: {
      show: false,
      borderColor: 'rgba(0,0,0,0.1)',
    },
    colors: ['#06d79c', '#745af2'],
    tooltip: {
      theme: 'dark',
      fillSeriesColor: false,
    },
    xaxis: {
      type: 'category',
      categories: areaChartData[0].categories,
      // min: 0,
      // max:10,
      range: 14,
      labels: {
        formatter: function (value) {
          return value;
        },
        style: {
          colors: "rgba(255,255,255,0.5)",
          fontSize: '12px',
        }
      },
      crosshairs: {
        show: false,
        width: 10,
        position: 'back',
        opacity: 0.9,
        stroke: {
          color: '#b6b6b6',
          width: 0,
          dashArray: 0,
        },
        fill: {
          type: 'solid',
          color: '#B1B9C4',
          gradient: {
            colorFrom: '#D8E3F0',
            colorTo: '#BED1E6',
            stops: [0, 100],
            opacityFrom: 0.4,
            opacityTo: 0.5,
          },
        },
        dropShadow: {
          enabled: false,
          top: 0,
          left: 0,
          blur: 1,
          opacity: 0.4,
        },
      },
    },
    yaxis: {
      min: 0,
      max: 5,
      tickAmount: 5,
      stepSize: undefined,
      forceNiceScale: true,
      opposite: false,
      labels: {
        show: true,
        align: 'left',
        style: {
          colors: "rgba(255,255,255,0.5)",
          fontSize: '12px',
        },
        formatter: function (value) {
          switch (value) {
            case 0:
              return "Offline";
            case 1:
              return "Screen";
            case 2:
              return "Mobile";
            case 3:
              return "Document";
            case 4:
              return "Others";
            case 5:
              return "Left";
            default:
              return value;
          }
        }
      },
    },
    legend: {
      show: false,
      position: 'bottom',
      width: '50px',
      fontFamily: "'Montserrat', sans-serif",
      labels: {
        colors: '#8898aa',
      },
    },

  };

  // const seriesarea = areaChartData;


  const [controller1, setController1] = useState(new AbortController());

  const cameraUrl = `${constants.pythonBaseUrl}/stream/video_feed`

  // const fetchData = async () => {
  //   fetchVideoStream1(cameraUrl, controller1);
  // };


  const cleanupStreamControllers = () => {
    controller1.abort();
  };


  const fetchVideoStream1 = async () => {
    console.log(" in fetchVideoStream1");
    console.log(cameraUrl);

    try {

      let jsonData = ""

      const response = await fetch(cameraUrl, { signal: controller1.signal });
      const reader = response.body.getReader();
      let imageData = "";

      while (true) {

        const { done, value } = await reader.read();

        if (done) break;
        const parts = new TextDecoder("utf-8").decode(value).split("\r\n\r\n");
        console.log(parts);
        if (parts.length == 2) {
          imageData += parts[1];
        } else if (parts.length == 1) {
          imageData += parts[0];
        } else if (parts.length == 4) {
          try {
            // // let jsonData = JSON.parse(parts[2]);
            // let temp = JSON.parse(parts[2]);
            // if (temp.side_1 == undefined) {

            // } else {

            //   // temp = {
            //   //   ...temp,
            //   //   side_1_F: oldData.side_1_F + temp.side_1_F,
            //   //   side_1_M: oldData.side_1_M + temp.side_1_M,
            //   //   side_2_F: oldData.side_2_F + temp.side_2_F,
            //   //   side_2_M: oldData.side_2_M + temp.side_2_M,
            //   // }
            //   // jsonData = temp
            //   jsonData = temp
            // }

            // imageData += parts[0];
            // if (!parts[0].startsWith("--frame")) {
            //   let base64Img = "data:image/png;base64, " + imageData;

            //   // setCamera1StreamInfo({
            //   //   stream: base64Img,
            //   //   data: jsonData

            //   // })
            // }
            // imageData = "";

          } catch (error) {
            console.log("Error parsing JSON data 1");
          }


        } if (parts.length == 5) {

          try {
            // let jsonData = JSON.parse(parts[3]);
            let temp = JSON.parse(parts[3]);
            if (temp.side_1 == undefined) {
            } else {

              jsonData = temp
            }

            imageData += parts[1];
            if (!parts[1].startsWith("--frame")) {
              let base64Img = "data:image/png;base64, " + imageData;

              // setCamera1StreamInfo({
              //   stream: base64Img,
              //   data: jsonData

              // })
            }
            imageData = "";

          } catch (error) {
            console.log("Error parsing JSON data");
          }

        }
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Fetch request aborted");
      } else {
        console.error("Error:", error.message);
      }
    }

    console.log("got the data for previous intersection count");

  };





  return (
    <div className="mainBox"
      style={{
        position: "relative",
        left: `${sideBarWidth}px`,
        width: `calc(100vw - ${sideBarWidth}px)`,
        height: `calc(100vh - ${headerHeight}px)`
      }}>

      <div className="streamParentBox">
        <div style={{ display: "flex", justifyContent: "space-between" }}>

          {/* Header --- Stream */}
          <span className={classes.heading}>Stream</span>
          {isChartRunning ? (
            <Button variant="contained" style={{ padding: 0, borderRadius: "5px !important" }} onClick={handleStopChart}>Stop</Button>
          ) : (
            <Button variant="contained" style={{ padding: 0, borderRadius: "5px !important" }} onClick={handleStartChart}>Start</Button>
          )}
        </div>

        {/* Displaying stream */}
        {/* <div style={{ border: "1px solid red", height: "calc(100% - 30px)", display: "flex", gap: "10px", width: "100%", position: "relative" }}> */}
        <div style={{ height: "calc(100% - 30px)", display: "flex", gap: "10px", width: "100%", position: "relative" }}>


          {/* <div style={{ width: "60%", display: "flex", justifyContent: "center", alignItems: "center", }}> */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", }}>
            <img src="/images/exHall.png" alt="Stream" style={{ height: "calc(99%)", width: "100%", objectFit: "contain" }} />

            {/* <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}>
            {isChartRunning ? (
              <Icon
                className={classes.playStopIcon}
                onClick={handleStopChart}
              >stop_circle_outline</Icon>
            ) : (
              <Icon
                className={classes.playStopIcon}
                onClick={handleStartChart}
              >play_circle_outline</Icon>
            )}
          </div> */}
          </div>

          {/* <div style={{ border: "1px solid #fff", boxSizing: "border-box", width: "40%" }}>
            <div>

            </div>
          </div> */}
        </div>
      </div>

      <div className="chartsParentBox">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span className={classes.heading}>
            Attention Graph
          </span>

        </div>
        <Chart options={areaChartOptions} series={areaChartData} type="area" height="86%" width="99%" />
      </div>

      <ImageModal openImageModal={openImageModal} closeModal={handleImageModalClose} />
    </div>
  );
}

export default ExaminationHall;
