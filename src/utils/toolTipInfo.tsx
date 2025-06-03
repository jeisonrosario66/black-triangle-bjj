import React, { useState } from "react";
import InfoOutlineIcon from "@mui/icons-material/InfoOutline";
import {
  IconButton,
  Grid,
  Tooltip,
  Box,
  ClickAwayListener,
} from "@mui/material";

type ToolTipInfoProps = {
  content: string;
};

const ToolTipInfo: React.FC<ToolTipInfoProps> = ({content}) => {
  const [open, setOpen] = useState(false);
  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };
  return (
    <>
      <Grid>
        <ClickAwayListener onClickAway={handleTooltipClose}>
          <Box>
            <Tooltip
              onClose={handleTooltipClose}
              open={open}
              disableFocusListener
              disableHoverListener
              disableTouchListener
              title={content}
              placement="top-end"
              arrow
              slotProps={{
                popper: {
                  disablePortal: true,
                },
              }}
            >
              <IconButton onClick={handleTooltipOpen}>
                <InfoOutlineIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </ClickAwayListener>
      </Grid>
    </>
  );
};

export default ToolTipInfo;
