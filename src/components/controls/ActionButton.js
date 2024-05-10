import { Button, Tooltip } from "@mui/material";
import React from "react";

import { makeStyles } from "@mui/styles";
const useStyles = makeStyles((theme) => ({
  root: {
    minWidth: 0,
    margin: theme.spacing(0.5),
    boxSizing: "border-box",
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#CCC",
  },
  secondary: {
    backgroundColor: "red",
    "& .MuiButton-label": {
      color: theme.palette.secondary.contrastText,
    },
    "&:hover": {
      backgroundColor: theme.palette.secondary.main,
      "& .MuiButton-label": {
        color: theme.palette.secondary.contrastText,
      },
    },
  },
  primary: {
    backgroundColor: "#F1F1F1",
    color: "#000",
    "&:hover": {
      borderColor: "#FF6A00" /* Primary border color on hover */,
      color: "#FF6A00",
      backgroundColor: "#F1F1F1",
    },
  },
}));

export default function ActionButton(props) {
  const { color, children, onClick, title = "add" } = props;

  const classes = useStyles();

  return (
    <Tooltip title={title} aria-label="add">
      <Button className={`${classes.root} ${classes[color]}`} onClick={onClick}>
        {children}
      </Button>
    </Tooltip>
  );
}
