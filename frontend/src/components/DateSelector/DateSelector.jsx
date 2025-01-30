import React, { useEffect } from "react";
import dayjs from "dayjs";
import { DemoContainer, DemoItem } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function DateSelector({
  label,
  dateType,
  historyDate,
  setHistoryDate,
  enabledDates,
  setDefaultFilePath,
  setEnabledDates,
  cameraIndex,
  setGroupChartData,
  baseUrl8001,
  //enabledDates = ["2024-02-11","2024-02-12","2024-02-13"], // Array of dates to be enabled
}) {

  useEffect(() => {

    let categories = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23"]
    let approxCountFemale = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    let approxCountMale = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    // let approxCountFemale = [
    //   18063,
    //   10205,
    //   13207,
    //   9601,
    //   17332,
    //   2014,
    //   3762,
    //   7760,
    //   1376,
    //   5995,
    //   48439,
    //   2965,
    //   1115,
    //   7154,
    //   5048,
    //   4679,
    //   958,
    //   1490,
    //   2554,
    //   5998,
    //   16328,
    //   30815,
    //   12891,
    //   4430
    // ]

    // let approxCountMale = [
    //   11744,
    //   6084,
    //   18564,
    //   2772,
    //   5913,
    //   1360,
    //   730,
    //   2879,
    //   6947,
    //   2281,
    //   50623,
    //   2041,
    //   4868,
    //   4964,
    //   5164,
    //   2809,
    //   1237,
    //   11921,
    //   5236,
    //   5221,
    //   15807,
    //   3487,
    //   12907,
    //   7757
    // ]

    const getDatesForAvailableData = async () => {
      try {
        // Set timeout value in milliseconds (e.g., 5000 ms for 5 seconds)
        const fetchRequest = fetch(`${baseUrl8001}/stream/get_intersection?camera=camera_${cameraIndex}`);

        const response = await Promise.race([fetchRequest]);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        // Extract dates from the JSON response     
        const dates = data.map(item => item.name);
        setEnabledDates(dates);

        if (data.length > 0) {
          setDefaultFilePath(data[0]['path'])
        }
      } catch (error) {
        console.error('Error fetching data:', error);

        const localStorageHistoryData = localStorage.getItem("chartData");

        if (localStorageHistoryData) {
          try {
            const { jsonData } = JSON.parse(localStorageHistoryData);
            let display_date = jsonData[0]["date_"].split('-');
            display_date = display_date[0] + "-" + display_date[1] + "-" + display_date[2];

            const categories_localstorage = jsonData.map(entry => entry.date_);
            const approx_count_side_1_M = jsonData.map(entry => entry[`approx_count_side_1_M`]);
            const approx_count_side_1_F = jsonData.map(entry => entry[`approx_count_side_1_F`]);

            setGroupChartData((prevState) => ({
              ...prevState,
              data: [
                {
                  x: categories_localstorage,
                  y: approx_count_side_1_M,
                  name: 'Male',
                  type: 'bar',
                  marker: { color: '#2a6ebb' }
                },
                {
                  x: categories_localstorage,
                  y: approx_count_side_1_F,
                  name: 'Female',
                  type: 'bar',
                  marker: { color: '#ff00ff' }
                }
              ],
              layout: {
                ...prevState.layout,
                barmode: 'group',
                title: {
                  text: "display_date111", // Use actual display_date variable here
                  x: 0.5,
                  y: 0.95,
                  xanchor: 'left',
                  yanchor: 'top',
                  font: {
                    size: 14,
                    color: '#263238',
                    weight: 'bold',
                  },
                },
                margin: {
                  autoexpand: true,
                  l: 40,
                  t: 30,
                  b: 0,
                  r: 0,
                  pad: 0
                },
                autosize: true,
                hovermode: 'x unified',
                legend: {
                  orientation: 'h',
                },
              },
            }));
          } catch (error) {
            console.error('Error parsing JSON from localStorage:', error);
          }
        } else {
          console.log('No data found in localStorage.');

          setGroupChartData((prevState) => ({
            ...prevState,
            data: [
              {
                x: categories,
                y: approxCountMale,
                name: 'Male',
                type: 'bar',
                // color: '#2a6ebb',
                marker: { color: '#2a6ebb' }
              },
              {
                x: categories,
                y: approxCountFemale,
                name: 'Female',
                type: 'bar',
                // color: '#ff00ff',
                marker: { color: '#ff00ff' }
              }
            ],
            layout: {
              ...prevState.layout,
              barmode: 'group',
              title: {
                text: "display_date",
                x: 0.5,
                y: 0.95,
                xanchor: 'left',
                yanchor: 'top',
                font: {
                  size: 14,
                  color: '#263238',
                  family: undefined,
                  weight: 'bold',
                },
              },
              margin: {
                autoexpand: true,
                l: 40,
                t: 30,
                b: 0,
                r: 0,
                pad: 0
              },
              autosize: true,
              hovermode: 'x unified',
              legend: {
                orientation: 'h',
              },

            },
          }));
          // }
        }
      }

    };

    if (cameraIndex == 1 || cameraIndex == 2) {
      getDatesForAvailableData();
    } else {
      console.log("in dateSelector cam index other than 1 and 2");
    }
  }, [cameraIndex]); // Empty dependency array ensures the effect runs only once


  const handleChange = (date) => {
    const selectedDate = date.format("YYYY-MM-DD");
    setHistoryDate((prevState) => ({
      ...prevState,
      [dateType]: selectedDate, // Update the specified date type
    }));

  };

  const shouldDisableDate = (date) => {
    return !enabledDates.includes(date.format("YYYY-MM-DD"));
  };

  return (

    <LocalizationProvider dateAdapter={AdapterDayjs} sx={{ padding: 0 }}>
      <DemoContainer
        components={[
          "DatePicker",
          "MobileDatePicker",
          "DesktopDatePicker",
          "StaticDatePicker",
        ]}
        sx={{ padding: 0 }}
      >
        <DemoItem label={label} sx={{ padding: 0 }}>
          <DatePicker
            defaultValue={dayjs(historyDate.startDate)}
            value={dayjs(historyDate[dateType])}
            onChange={handleChange}
            shouldDisableDate={shouldDisableDate}
            disableFuture={true}
          />
        </DemoItem>
      </DemoContainer>
    </LocalizationProvider>
  );
}

export default DateSelector;



