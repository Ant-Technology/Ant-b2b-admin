import { useState } from "react";
import {
  createStyles,
  ScrollArea,
  Navbar,
  Group,
  Code,
  Burger,
  Avatar,
  Tooltip,
  Popover,
} from "@mantine/core";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import {
  IconDashboard,
  IconApps,
  IconSwitchHorizontal,
  IconLogout,
  IconShoppingCart,
  IconGeometry,
  IconBuildingWarehouse,
  IconCurrentLocation,
  IconBrandShopee,
  IconLayoutDistributeHorizontal,
  IconBuildingStore,
  IconShip,
  IconWallet,
  IconTruck,
  IconTruckDelivery,
  IconUser,
  IconUsers,
  IconTruckLoading,
} from "@tabler/icons";

import { Link, useNavigate } from "react-router-dom";
import { authDataVar } from "apollo/store";
import { useMutation } from "@apollo/client";
import { LOGOUT } from "apollo/mutuations";
import { showNotification } from "@mantine/notifications";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    bg: {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.gray : theme.colors.gray[2],
    },
    header: {
      paddingBottom: theme.spacing.md,
      marginBottom: theme.spacing.md * 1.5,
      borderBottom: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    footer: {
      paddingTop: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderTop: `1px solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2]
      }`,
    },

    link: {
      ...theme.fn.focusStyles(),
      display: "flex",
      alignItems: "center",
      textDecoration: "none",
      fontSize: theme.fontSizes.sm,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[1]
          : theme.colors.gray[7],
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 500,

      "&:hover": {
        backgroundColor:
          theme.colorScheme === "dark"
            ? theme.colors.dark[6]
            : theme.colors.gray[0],
        color: theme.colorScheme === "dark" ? theme.white : theme.black,

        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : theme.black,
        },
      },
    },

    linkIcon: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      marginRight: theme.spacing.sm,
    },

    linkIconShort: {
      ref: icon,
      color:
        theme.colorScheme === "dark"
          ? theme.colors.dark[2]
          : theme.colors.gray[6],
      margin: "auto",
    },

    linkActive: {
      "&, &:hover": {
        backgroundColor: theme.fn.variant({
          variant: "light",
          color: theme.primaryColor,
        }).background,
        color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
          .color,
        [`& .${icon}`]: {
          color: theme.fn.variant({
            variant: "light",
            color: theme.primaryColor,
          }).color,
        },
      },
    },
  };
});

const data = [
  { link: "/", label: "Dashboard", icon: IconDashboard },
  { link: "/users", label: "User Management", icon: IconUsers },
  { link: "/categories", label: "Categories", icon: IconApps },
  { link: "/products", label: "Products", icon: IconShoppingCart },
  { link: "/productvariants", label: "Product Variant", icon: IconGeometry },
  { link: "/warehouses", label: "Ware House", icon: IconBuildingWarehouse },
  { link: "/regions", label: "Regions", icon: IconCurrentLocation },
  { link: "/retailers", label: "Retailers", icon: IconBrandShopee },
  { link: "/drivers", label: "Drivers", icon: IconUser },
  { link: "/vehicle_types", label: "Vehicle Types", icon: IconTruck },
  { link: "/vehicles", label: "Vehicles", icon: IconTruckDelivery },
  { link: "/dropoffs", label: "Drop Offs", icon: IconTruckLoading },
  {
    link: "/distributors",
    label: "Distributers",
    icon: IconLayoutDistributeHorizontal,
  },
  { link: "/stocks", label: "Stocks", icon: IconBuildingStore },
  { link: "/orders", label: "Orders", icon: IconShoppingCart },
  { link: "/shipments", label: "Shipments", icon: IconShip },
  { link: "/wallets", label: "Wallet", icon: IconWallet },
];

const NavbarSimple = ({ opened, setOpened }) => {
  const { width } = useViewportSize();

  const { classes, cx, theme } = useStyles();
  const [active, setActive] = useState("Billing");
  const mobScreen = useMediaQuery("(max-width: 500px)");

  const navigate = useNavigate();

  const [signout] = useMutation(LOGOUT);

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

  const links = data.map((item, index) => (
    <>
      {opened ? (
        <Link
          key={index}
          className={cx(classes.link, {
            [classes.linkActive]: item.label === active,
          })}
          to={item.link}
          onClick={(event) => {
            event.preventDefault();
            setActive(item.label);
            navigate(item.link);
          }}
        >
          <item.icon
            className={opened ? classes.linkIcon : classes.linkIconShort}
            stroke={1.5}
          />
          <div style={{ overflow: "hidden" }}>
            {opened ? <span>{item.label}</span> : null}
          </div>
        </Link>
      ) : (
        <Tooltip
          key={index}
          label={!opened ? item.label : null}
          position="right"
          withArrow
        >
          <Link
            key={index}
            className={cx(classes.link, {
              [classes.linkActive]: item.label === active,
            })}
            to={item.link}
            onClick={(event) => {
              event.preventDefault();
              setActive(item.label);
              navigate(item.link);
            }}
          >
            <item.icon
              className={opened ? classes.linkIcon : classes.linkIconShort}
              stroke={1.5}
            />
            <div style={{ overflow: "hidden" }}>
              {opened ? <span>{item.label}</span> : null}
            </div>
          </Link>
        </Tooltip>
      )}
    </>
  ));

  const handleNameAvatar = () => {
    if (authDataVar().auth) {
      const text = authDataVar().auth.name;
      const new_splitted_text = text.split(" ");
      // alert(new_splitted_text[0]);
      const NL = new_splitted_text[0].charAt(0);
      const FL = new_splitted_text[1].charAt(0);

      return NL + " " + FL;
    }
  };

  return (
    <Navbar
      style={{
        maxWidth: opened ? (mobScreen ? "100%" : width / 5) : width / 14,
        transition: "all .2s ease-in",
      }}
      p="md"
      className={classes.bg}
    >
      <Navbar.Section mt="xs">
        <Group className={classes.header} position="apart">
          {/* Hamburger Here */}
          {!mobScreen && (
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              size="md"
              color={theme.colors.gray[6]}
              mr="auto"
              ml={opened ? 0 : "sm"}
            />
          )}
          {opened ? <Code sx={{ fontWeight: 700 }}>Act B2B</Code> : null}
        </Group>
      </Navbar.Section>

      <Navbar.Section
          grow
          style={{
              overflowY: "auto",
              maxHeight: "calc(100vh - 100px)",
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(155, 155, 155, 0.5) rgba(255, 255, 255, 0.1)",
              scrollbarTrackColor: "rgba(255, 255, 255, 0.1)",
              scrollbarThumbColor: "rgba(155, 155, 155, 0.5)",
              WebkitScrollbarWidth: "2px", // Adjust this value as needed
          }}
      >
        {links}
      </Navbar.Section>

      <Navbar.Section className={classes.footer}>
        <Tooltip
          disabled={opened ? true : false}
          label="Profile"
          position="right"
          withArrow
        >
          <Link
            to="#"
            className={classes.link}
            onClick={(event) => event.preventDefault()}
          >
            <Avatar
              className={opened ? classes.linkIcon : classes.linkIconShort}
              size="sm"
              color="cyan"
              radius="xl"
            >
              {handleNameAvatar()?.toUpperCase()}
            </Avatar>{" "}
            {opened ? (
              <span className="">{authDataVar().auth?.name}</span>
            ) : null}
          </Link>
        </Tooltip>

        <Popover width={300} position="right" withArrow shadow="md">
          <Tooltip
            disabled={opened ? true : false}
            label="Change Account"
            position="right"
            withArrow
          >
            <Popover.Target>
              <Link
                to="#"
                className={classes.link}
                onClick={(event) => event.preventDefault()}
              >
                <IconSwitchHorizontal
                  className={opened ? classes.linkIcon : classes.linkIconShort}
                  stroke={1.5}
                />
                {opened ? <span>Change account</span> : null}
              </Link>
            </Popover.Target>
          </Tooltip>
          <Popover.Dropdown>
            <p>DISTRIBUTOR</p>
            <p>DRIVER</p>
            <p>RETAILER</p>
          </Popover.Dropdown>
        </Popover>

        <Tooltip
          disabled={opened ? true : false}
          label="Logout"
          position="right"
          withArrow
        >
          <Link
            href="#"
            className={classes.link}
            onClick={(event) => {
              event.preventDefault();
              logout();
            }}
          >
            <IconLogout
              className={opened ? classes.linkIcon : classes.linkIconShort}
              stroke={1.5}
            />
            {opened ? <span>Logout</span> : null}
          </Link>
        </Tooltip>
      </Navbar.Section>
    </Navbar>
  );
};

export default NavbarSimple;
