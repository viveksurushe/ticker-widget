import "./App.css";
import Grid from "@mui/material/Grid";
import Ticker from "./Ticker/index";

function App() {
  return (
    <div className="App">
      <h1>Hello </h1>

      <Grid container direction="row" justifyContent="space-around">
        <Grid item xs={12} sm={8} md={6}>
          <Ticker />
        </Grid>
      </Grid>
    </div>
  );
}

export default App;
