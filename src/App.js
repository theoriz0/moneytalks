import React, { useEffect, useState } from "react";
import { MoneyTalks } from "./abi/abi";
import Web3 from "web3";
import "./App.css";

let injectedProvider = false

if (typeof window.ethereum !== 'undefined') {
  injectedProvider = true
  console.log(window.ethereum)
}


const isMetaMask = injectedProvider ? window.ethereum.isMetaMask : false

// Access our wallet inside of our dapp
const web3 = new Web3("https://sepolia.infura.io/v3/0702977a8f3c4ebb82606e5e86171ab6");

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
    const post = await moneyTalks.methods.write(note).send({
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
    setData(note);
  };

  const eventGet = () => {
    moneyTalks.getPastEvents("Said", { fromBlock: 1 })
      .then(results => {
        let newEvents = results.map(e => e.returnValues)
        
        newEvents.sort((a, b) => {
          console.log(a)
          console.log(b)
          if ((a.withFee - b.withFee) === 0n) {
            console.log("withFee the same")
            return ((a.index - b.index) > 0n ? 1 : -1);
          } else if ((a.withFee - b.withFee) > 0n) {
            console.log("a withFee bigger")
            return -1;
          } else {
            console.log("b withFee bigger")
            return 1;
          }
        })
        setEvents(newEvents)
      })
      .catch(err => { throw err });
  }

  useEffect(() => {
    eventGet()
  }, []);

  return (
    <div className="main">
      <ul>
        {events.map(e => <li>Note: {e.Quote}, TipFee: {e.withFee.toString()}, Index:{e.index.toString()}</li>)}
      </ul>
      <div className="card">
        <h2>Injected Provider {injectedProvider ? 'DOES' : 'DOES NOT'} Exist</h2>
        {isMetaMask &&
          <button>Connect MetaMask</button>
        }
        <h1>Write</h1>
        <form className="form" onSubmit={noteSet}>
          <label>
            Note:
            <input
              className="input"
              type="text"
              name="name"
              onChange={(t) => setNote(t.target.value)}
              placeholder="Note"
            />
            <input
              className="input"
              type="text"
              name="name"
              onChange={(t) => setValue(parseFloat(t.target.value))}
              placeholder="Tip"
            />
          </label>
          <button className="button" type="submit" value="Write">
            Write
          </button>
        </form>
        <hr></hr>
        <h1>Read</h1>
        <form className="form" onSubmit={dataGet}>
          <label>
            Index of Note:
            <input
              className="input"
              type="number"
              name="name"
              onChange={(t) => setIndex(parseInt(t.target.value))}
            />
          </label>
          <button className="button" type="submit" value="Read">
            Read
          </button>
        </form>
        {JSON.stringify(data, (key, value) =>
          typeof value === 'bigint' ? value.toString() : value
        )}
        <button className="button" value="Events" onClick={eventGet}>
          Reload Events
        </button>
      </div>
    </div>
  );
}

export default App;