import { useState } from "react";
import {
  AppShell,
  Navbar,
  Header,
  createStyles,
  Text,
  MediaQuery,
  Burger,
  useMantineTheme,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import NavbarSimple from "../navigation";
import { useMutation } from "@apollo/client";
import { LOGOUT } from "apollo/mutuations";
import { Link, useNavigate } from "react-router-dom";
import {
  NotificationsProvider,
  showNotification,
} from "@mantine/notifications";
import { IconLogout } from "@tabler/icons";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark" ? theme.colors.dark[1] : "rgb(20, 61, 89)",
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 600,
    },

    linkIcon: {
      ref: icon,
      color: theme.colorScheme === "dark" ? theme.colors.dark[2] : "#FFFFFF",
      marginRight: theme.spacing.sm,
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: "#FF6A00", // Background color
        color: "#FFFFFF", // Text color
        [`& .${icon}`]: {
          color: "#FFFFFF", // Icon color
        },
      },
    },
  };
});

const Layout = ({ children, setPosition }) => {
  const { classes } = useStyles();

  const [signout] = useMutation(LOGOUT);
  const navigate = useNavigate();

  const { width } = useViewportSize();
  const largeScreen = useMediaQuery("(min-width: 800px)");

  const theme = useMantineTheme();
  const [opened, setOpened] = useState(true);
  const logout = () => {
    signout({
      onCompleted() {
        localStorage.removeItem("auth_token");
        navigate("/login");
        showNotification({
          color: "green",
          title: "Success",
          message: "Logged Out!",
        });
      },

      onError(err) {
        showNotification({
          color: "red",
          title: "Error",
          message: "something went wrong!",
        });
      },
    });
  };
  return (
    <AppShell
      styles={{
        main: {
          paddingLeft: opened ? width / 5 : width / 14,
          background:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
          transition: "all .2s ease-in",
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!opened}
          // width={{ sm: 200, lg: 200 }}
          style={{ maxWidth: width / 14 }}
        >
          <NavbarSimple
            opened={opened}
            setOpened={setOpened}
            setPosition={setPosition}
          />
        </Navbar>
      }
      header={
        !largeScreen ? (
          <Header height={70} p="md">
            <div
              style={{ display: "flex", alignItems: "center", height: "100%" }}
            >
              <MediaQuery largerThan="sm" styles={{ display: "none" }}>
                <Burger
                  opened={opened}
                  onClick={() => setOpened((o) => !o)}
                  size="sm"
                  color={theme.colors.gray[6]}
                  mr="xl"
                />
              </MediaQuery>
            </div>
          </Header>
        ) : (
          <div
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Header
              style={{
                color: "#FFFFFF",
                backgroundColor: "#FF6A00",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
              height={70}
              p="md"
            >
              <Text style={{marginLeft:"15px"}}>ACT B2B</Text>

              <Burger
                style={{ marginLeft: "80px", paddingLeft: "100px" }}
                opened={false}
                onClick={() => setOpened((o) => !o)}
                size="md"
                color={"#FFFFFF"}
                mr="auto"
                ml={opened ? 0 : "sm"}
              />

              <Link
                href="#"
                className={classes.link}
                onClick={(event) => {
                  event.preventDefault();
                  logout();
                }}
              >
                <IconLogout className={classes.linkIcon} stroke={1.5} />
                <span style={{ color: "#FFFFFF" }}>Logout</span>
              </Link>
            </Header>
          </div>
        )
      }
    >
      {children}
    </AppShell>
  );
};

export default Layout;
