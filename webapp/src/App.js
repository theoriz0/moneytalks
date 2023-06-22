import React, { useEffect, useState } from "react";
import env from "react-dotenv";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import List from '@mui/material/List';
import { MoneyTalks } from "./abi/abi";
import { ethers } from "ethers";
import "./App.css";
import QuoteCard from "./QuoteCard";
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff9100',
    },
    secondary: {
      main: '#f50057',
    },
  },
});

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Made by '}
      <Link color="inherit" href="https://github.com/theoriz0">
        theoriz0
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

let signer = null;

let provider;
if (window.ethereum == null) {

    console.log("MetaMask not installed; using read-only defaults");
    let url = `https://sepolia.infura.io/v3/${env.API_SECRET}`;
    provider = new ethers.JsonRpcProvider(url);
} else {

    provider = new ethers.BrowserProvider(window.ethereum);
    signer = await provider.getSigner();
}

// Contract address of the deployed smart contract
const contractAddress = "0x7CD3D1CB7ff444717b93EB783956D2c6667AdaDD";
const moneyTalks = new ethers.Contract(contractAddress, MoneyTalks, provider)

function App() {
  const [data, setData] = useState("")
  const [index, setIndex] = useState(0)
  const [value, setValue] = useState(0)
  const [note, setNote] = useState("")
  const [events, setEvents] = useState([])



  const noteSet = async (t) => {
    t.preventDefault();
    // Get permission to access user funds to pay for gas fees
    // const gas = await moneyTalks.methods.write(note).estimateGas();
    if (signer == null) {
      if (window.ethereum == null) {
        alert("Please install MetaMask");
        return;
      }
      provider = new ethers.BrowserProvider(window.ethereum);
      signer = await provider.getSigner();
    };
    try {
      let tx = await moneyTalks.connect(signer).write(note, {
        value: ethers.parseEther(value),
      });
      await tx.wait();
      alert("Write success!");
      setNote("");
      setValue();
      eventGet();
    } catch (e) {
      alert(e.code);
    }
    
  };

  const dataGet = async (t) => {
    t.preventDefault();
    try {
      const note = await moneyTalks.quotes(index);
      setData({text: note.text, tipFee: ethers.formatEther(note.tipFee)});
    } catch(e) {
      console.log(e);
      alert("Something went wrong, probably wrong index.");
    }
  };

  const eventGet = async () => {
    let eventFilter = moneyTalks.filters.Said();
    let events = await moneyTalks.queryFilter(eventFilter);
    let notes = events.map(e => {
      return {
        text: e.args.text,
        tipFee: ethers.formatEther(e.args.tipFee),
        index: e.args.index.toString(),
        sender: e.args.sender,
      }
    });

    notes.sort((a, b) => {
      if ((a.tipFee - b.tipFee) === 0) {
        return (a.index > b.index ? 1 : -1);
      } else if (a.tipFee > b.tipFee) {
        return -1;
      } else {
        return 1;
      }
    });
    setEvents(notes)
  }


  useEffect(() => {
    eventGet()
  }, []);

  return (
    <ThemeProvider theme={theme}>
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid
        item
        xs={12}
        sm={4}
        md={7}
        sx={{
          backgroundRepeat: 'no-repeat',
          backgroundColor: (t) =>
            t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
          }}>
          <Typography component="h1" variant="h3" sx={{ color: "white"}}>MoneyTalks!!</Typography>
          <Typography component="p" variant="h6" sx={{ color: "white"}}>More ETH sent &gt;&gt;&gt; Higher on List!</Typography>
          <Typography component="p" variant="h6" sx={{ color: "gray"}}>(If same ETH value, earlier &gt;&gt;&gt; higher.)</Typography>
          <List sx={{ paddingTop: "2em"}}>
            {events.map((e, i) => <QuoteCard quote={e} idx={i} key={e.index}/>)}
          </List>
        </Box>
      </Grid>
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}>
          <Typography component="h1" variant="h5">WRITE NOW!</Typography>
          <Box component="form" noValidate onSubmit={noteSet} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="note"
              label="Message"
              name="note"
              onChange={(t) => setNote(t.target.value)}
              autoFocus
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="tip"
              label="ETH to send (0.05, 0.1...)"
              type="string"
              id="tip"
              onChange={(t) => setValue(t.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Write
            </Button>
          </Box>
          <Typography component="h1" variant="h5" sx={{ mt: 7 }}>Validate on Chain</Typography>
          <Box component="form" noValidate onSubmit={dataGet} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="index"
              label="Index"
              name="index"
              onChange={(t) => setIndex(parseInt(t.target.value))}
              autoFocus
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Validate
            </Button>
          </Box>
          <Typography component="p" sx={{ mt: 1, fontSize: 10 }}>
          Quote: {data.text}, tipFee: {data.tipFee}
            </Typography>
          <Typography component="h1" variant="h5" sx={{ mt: 7 }}>Reload All</Typography>
          <Box sx={{ mt: 1 }}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              onClick={eventGet}
            >
              Reload
            </Button>
          </Box>
          <Box
            sx={{
              my: 8,
              mx: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Copyright sx={{ mt: 5 }} />
          </Box>
        </Box>
      </Grid>
    </Grid>
    </ThemeProvider>
  );
}

export default App;