import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  MantineProvider,
  ColorSchemeProvider,
  LoadingOverlay,
} from "@mantine/core";
import {
  NotificationsProvider,
  showNotification,
} from "@mantine/notifications";
import { useHotkeys, useLocalStorage } from "@mantine/hooks";
import Pusher from 'pusher-js';
import RoutesComp from "./routes";
import Layout from "components/layout/Layout";
import { useQuery } from "@apollo/client";
import { AUTH } from "apollo/queries";
import { authDataVar } from "apollo/store";
import { customLoader } from "components/utilities/loader";

function App() {
  let location = useLocation();
  let navigate = useNavigate();
  const[position,setPosition] = useState(null);

  const { loading } = useQuery(AUTH, {
    onCompleted(data) {
      authDataVar(data);
      let token = localStorage.getItem("auth_token");
      if (!token) {
        navigate("/login");
      } else {
        navigate("/");
      }
    },
    onError() {
      showNotification({
        color: "red",
        title: "Error",
        message: "Something Went Wrong While fetching Used Data",
      });
      localStorage.removeItem("auth_token");
      navigate("/login");
    },
  });

  useEffect(() => {
    if (!authDataVar().auth) {
      console.log("noauthdata");
    }

    // eslint-disable-next-line
  }, []);

  const [colorScheme, setColorScheme] = useLocalStorage({
    key: "mantine-color-scheme",
    defaultValue: "light",
    getInitialValueInEffect: true,
  });

  const toggleColorScheme = (value) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useHotkeys([["mod+J", () => toggleColorScheme()]]); 
  return loading ? (
    <LoadingOverlay
      visible={loading}
      color="blue"
      overlayBlur={2}
      loader={customLoader}
    />
  ) : (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme,
          breakpoints: {
            xs: 500,
            sm: 800,
            md: 1000,
            lg: 1200,
            xl: 1400,
          },
        }}
      >
        {position?
        <NotificationsProvider position={position} setPosition={setPosition} >
          {location.pathname !== "/login" ? (
            <Layout setPosition={setPosition}>
              <RoutesComp />
            </Layout>
          ) : (
            <RoutesComp />
          )}
        </NotificationsProvider>:
          <NotificationsProvider>
          {location.pathname !== "/login" ? (
            <Layout setPosition={setPosition}>
              <RoutesComp />
            </Layout>
          ) : (
            <RoutesComp />
          )}
        </NotificationsProvider>
}
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
