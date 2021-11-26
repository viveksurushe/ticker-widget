import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import { makeStyles } from "@mui/styles";
import Button from "@mui/material/Button";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

var w;

const useStyles = makeStyles({
  card: {
    backgroundColor: "rgb(14 31 44)",
    color: "white",
    padding: "20px",
    '@media (min-width: 401px)' : {
      fontSize: '16px'
    },
    '@media (max-width: 400px)' : {
      fontSize: '12px'
    }
  },
  img: {
    width: "40px",
    height: "40px",
    marginRight: "15px",
    marginTop: "12px",
    color: "white",
  },
  textAlignLeft: {
    textAlign: "left",
  },
  textAlignRight: {
    textAlign: "right",
  },
  mb5: {
    marginBottom: "5px",
  },
  success: {
    borderRadius: "5px",
    color: "green",
  },
  danger: {
    borderRadius: "5px",
    color: "red",
  },
});

const Ticker = (props) => {
  const classes = useStyles();
  const [isConnected, setIsConnected] = useState(false);
  const [tickerData, setTickerData] = useState({
    BID: 0,
    BID_SIZE: 0,
    ASK: 0,
    ASK_SIZE: 0,
    DAILY_CHANGE: 0,
    DAILY_CHANGE_RELATIVE: 0,
    LAST_PRICE: 0,
    VOLUME: 0,
    HIGH: 0,
    LOW: 0,
    isUp: false,
  });

  useEffect(() => {
    const getDataFromApi = () => {
      fetch("/v2/tickers?symbols=tBTCUSD")
        .then((res) => res.json())
        .then((data) => {
          data[0].shift();
          updatetickerData(...data[0]);
        })
        .catch((error) => {
          console.log("Error", error);
        });
    };
    getDataFromApi();
    return () => {
      // clean up
    };
  }, []);

  const connectToWebsocket = () => {
    w = new WebSocket("wss://api-pub.bitfinex.com/ws/2");

    w.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data && data[1] && Array.isArray(data[1])) {
        updatetickerData(...data[1]);
      }
    };

    let msg = JSON.stringify({
      event: "subscribe",
      channel: "ticker",
      symbol: "tBTCUSD",
    });

    w.onopen = () => {
      setIsConnected(true);
      w.send(msg);
    };
    w.onclose = function (event) {
      console.log("WebSocket is closed now.");
      setIsConnected(false);
    };
  };

  const closeConnection = () => {
    w.close();
  };

  const updatetickerData = (
    BID,
    BID_SIZE,
    ASK,
    ASK_SIZE,
    DAILY_CHANGE,
    DAILY_CHANGE_RELATIVE,
    LAST_PRICE,
    VOLUME,
    HIGH,
    LOW
  ) => {
    setTickerData({
      BID: parseInt(BID, 10).toLocaleString("en-US", { minimumFractionDigits: 0}),
      BID_SIZE,
      ASK,
      ASK_SIZE,
      DAILY_CHANGE: parseInt(-DAILY_CHANGE, 10).toLocaleString("en-US", { minimumFractionDigits: 2}),
      DAILY_CHANGE_RELATIVE: Number(DAILY_CHANGE_RELATIVE * 100).toFixed(2),
      LAST_PRICE,
      VOLUME: parseInt(VOLUME, 10).toLocaleString("en-US", { minimumFractionDigits: 0}),
      HIGH: parseInt(HIGH, 10).toLocaleString("en-US", { minimumFractionDigits: 0}),
      LOW: parseInt(LOW, 10).toLocaleString("en-US", { minimumFractionDigits: 0 }),
      isUp: DAILY_CHANGE_RELATIVE > 0 ? true : false,
    });
  };

  return (
    <>
      <Grid container direction="row" justifyContent="space-between" mb={3}>
        <div style={{ paddingTop: "8px" }}>
          Status:{" "}
          {isConnected ? (
            <span className={classes.success}>Connected</span>
          ) : (
            <span className={classes.danger}>Disconnected</span>
          )}{" "}
        </div>

        {isConnected ? (
          <Button variant="contained" onClick={closeConnection}>
            Disconnect
          </Button>
        ) : (
          <Button variant="contained" onClick={connectToWebsocket}>
            Connect
          </Button>
        )}
      </Grid>

      <Grid
        className={classes.card}
        container
        direction="row"
        justifyContent="space-between"
      >
        <Grid>
          <Grid container>
            <img
              className={classes.img}
              alt="logo"
              src="https://static.bitfinex.com/images/icons/BTC-alt.svg"
            />
            <div className={classes.textAlignLeft}>
              <div className={classes.mb5}>BTC/USD</div>
              <div className={classes.mb5}>
                VOL {tickerData.VOLUME} <u>BTC</u>
              </div>
              <div>LOW {tickerData.LOW}</div>
            </div>
          </Grid>
        </Grid>
        <Grid className={classes.textAlignRight}>
          <div className={classes.mb5}>{tickerData.BID}</div>
          <div>
            {tickerData.isUp ? (
              <div className={classes.mb5} style={{ color: "#5bca9c" }}>
                <span>{tickerData.DAILY_CHANGE}</span> <ArrowDropUpIcon style={{height: '18px'}} fontSize="small" viewBox="0 0 20 18"/>
                <span>({tickerData.DAILY_CHANGE_RELATIVE}%)</span>
              </div>
            ) : (
              <div className={classes.mb5} style={{ color: "#d84944" }}>
                <span>{tickerData.DAILY_CHANGE}</span> <ArrowDropDownIcon style={{height: '18px'}} fontSize="small" viewBox="0 0 20 18"/>
                <span>({-tickerData.DAILY_CHANGE_RELATIVE}%)</span>
              </div>
            )}
            <div>HIGH {tickerData.HIGH}</div>
          </div>
        </Grid>
      </Grid>
    </>
  );
};

export default Ticker;
