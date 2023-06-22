import { Card, CardContent } from "@mui/material";
import { useState } from "react";
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import Crown from "./Crown";
import './QuoteCard.css';

function QuoteCard({ quote, idx }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <Card>
      <CardContent>
            <Crown idx={idx + 1} sx={{flex: "0 1 auto" }}/>
        <Typography sx={{flex: "1 1 auto" }} variant="h5" component="div">
          {quote.text}
        </Typography>
        <Typography sx={{ fontSize: 14, flex: "0 1 auto" }} color="text.secondary" gutterBottom>
          {"ETH: " + quote.tipFee}
        </Typography>
        <Button aria-describedby={id} variant="outlined" onClick={handleClick}
         sx={{flex: "0 1 auto", minWidth: "0", marginRight: "2em"}}>
          <MoreVertIcon/>
        </Button>
        <Popover
          id={id}
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
        >
          <Typography sx={{ p: 2 }}>{`Said by: ${quote.sender ? quote.sender : "Unknown"}, Index: ${quote.index}`}</Typography>
        </Popover>
      </CardContent>
    </Card>
  )
}

export default QuoteCard;