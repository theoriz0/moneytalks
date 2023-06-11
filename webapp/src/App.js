import React, { useEffect, useState } from "react";
import env from "react-dotenv";
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';

import ListItemText from '@mui/material/ListItemText';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import { MoneyTalks } from "./abi/abi";
import Web3 from "web3";
import "./App.css";
import { BigNumber } from "@ethersproject/bignumber";

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="https://github.com/theoriz0">
        theoriz0
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function weiToEth(inWei) {
  return BigNumber.from(inWei) / 1e18;
}

// Access our wallet inside of our dapp
const web3 = new Web3(`https://sepolia.infura.io/v3/${env.API_SECRET}`);

// Contract address of the deployed smart contract
const contractAddress = "0x6a445416819625b06564ce3daeba0d38edffd960";
const moneyTalks = new web3.eth.Contract(MoneyTalks, contractAddress);

function App() {
  const [data, setData] = useState("")
  const [index, setIndex] = useState(0)
  const [value, setValue] = useState(0)
  const [note, setNote] = useState("")
  const [events, setEvents] = useState([])



  const noteSet = async (t) => {
    t.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    // Get permission to access user funds to pay for gas fees
    const gas = await moneyTalks.methods.write(note).estimateGas();
    await moneyTalks.methods.write(note).send({
      from: account,
      value: Math.round(value * 10 ** 18),
      gas,
    });
  };

  const dataGet = async (t) => {
    t.preventDefault();
    const accounts = await window.ethereum.enable();
    const account = accounts[0];
    const note = await moneyTalks.methods.notes(index).call({
      from: account
    });
    note.tipFee = weiToEth(note.tipFee)
    setData(note);
  };

  const eventGet = () => {
    moneyTalks.getPastEvents("Said", { fromBlock: 1 })
      .then(results => {
        let newEvents = results.map(e => {
          let withTipEth = weiToEth(e.returnValues.withFee)
          e.returnValues.withFee = withTipEth
          return e.returnValues
        })

        newEvents.sort((a, b) => {
          if ((a.withFee - b.withFee) === 0) {
            return (a.index > b.index ? 1 : -1);
          } else if (a.withFee > b.withFee) {
            return -1;
          } else {
            return 1;
          }
        })
        setEvents(newEvents)
      })
      .catch(err => { throw err });
  }

  // const eventGetDummy = () => {
  //   setEvents([
  //     { Quote: "note1", withFee: 0, index: 0 },
  //     { Quote: "note2", withFee: 1.2, index: 1 },
  //     { Quote: "note3", withFee: 1.3, index: 2 }
  //   ])
  // }

  useEffect(() => {
    eventGet()
    // eventGetDummy()
  }, []);

  return (
    <Grid container component="main" sx={{ height: '100vh' }}>
      <Grid
        item
        xs={12}
        sm={4}
        md={7}
        sx={{
          // backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
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
          <Typography component="h1" variant="h5">MoneyTalks!!</Typography>
          <List>
            <ListItem key="-1">
              <ListItemText primary="Quote" />
              <ListItemText primary="Tip(In Eth)" />
              <ListItemText primary="Index" />
            </ListItem>
            {events.map(e => <ListItem key={e.index.toString()}>
              <ListItemText primary={e.Quote} />
              <ListItemText secondary={e.withFee} />
              <ListItemText secondary={e.index.toString()} />
            </ListItem>)}
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
          <Typography component="h1" variant="h5">Write</Typography>
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
              label="Tip"
              type="string"
              id="tip"
              onChange={(t) => setValue(parseFloat(t.target.value))}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled
            >
              Write (Developing)
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="https://sepolia.etherscan.io/address/0x6a445416819625b06564ce3daeba0d38edffd960#writeContract#F2" variant="body2">
                  Use etherscan.io To Write
                </Link>
              </Grid>
            </Grid>
          </Box>
          <Typography component="h1" variant="h5" sx={{ mt: 7 }}>Read</Typography>
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
              Read One
            </Button>
          </Box>
          <Typography component="p" sx={{ mt: 1, fontSize: 10 }}>
          Quote: {data.text}, tipFee: {data.tipFee}
            </Typography>
          <Typography component="h1" variant="h5" sx={{ mt: 7 }}>Reload All</Typography>
          <Box component="form" noValidate sx={{ mt: 1 }}>
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
  );
}

export default App;