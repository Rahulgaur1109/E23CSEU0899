import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#00695C",
    },
    secondary: {
      main: "#3949AB",
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

export default theme;
