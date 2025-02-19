import React, { useEffect, useState } from "react";
import { createStyles, Navbar, Tooltip, Badge, Collapse } from "@mantine/core";
import Pusher from "pusher-js";
import FeedbackIcon from "@mui/icons-material/Feedback";
import { useMediaQuery, useViewportSize } from "@mantine/hooks";
import {
  IconDashboard,
  IconApps,
  IconShoppingCart,
  IconGeometry,
  IconBuildingWarehouse,
  IconCurrentLocation,
  IconBrandShopee,
  IconBuildingStore,
  IconShip,
  IconWallet,
  IconTruck,
  IconTruckDelivery,
  IconUser,
  IconUsers,
  IconTruckLoading,
  IconChevronDown,
  IconSettings,
  IconChevronUp,
  IconReport,
  IconBox ,
  IconSteeringWheel,
  IconUserPlus
} from "@tabler/icons";

import { Link, useNavigate } from "react-router-dom";
import { authDataVar } from "apollo/store";
import { useMutation } from "@apollo/client";
import { LOGOUT } from "apollo/mutuations";
import {
  NotificationsProvider,
  showNotification,
} from "@mantine/notifications";
import NotificationExample from "./showNotification";

const useStyles = createStyles((theme, _params, getRef) => {
  const icon = getRef("icon");
  return {
    bg: {
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.gray : "#ffffff",
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
        theme.colorScheme === "dark" ? theme.colors.dark[1] : "rgb(20, 61, 89)",
      padding: `${theme.spacing.xs}px ${theme.spacing.sm}px`,
      borderRadius: theme.radius.sm,
      fontWeight: 600,
      "&:hover": {
        color: theme.colorScheme === "dark" ? theme.white : "#FF6A00",
        [`& .${icon}`]: {
          color: theme.colorScheme === "dark" ? theme.white : "#FF6A00",
        },
      },
    },
    linkIcon: {
      ref: icon,
      color: theme.colorScheme === "dark" ? theme.colors.dark[2] : "#FF6A00",
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
        backgroundColor: "#FF6A00", // Background color
        color: "#FFFFFF", // Text color
        [`& .${icon}`]: {
          color: "#FFFFFF", // Icon color
        },
      },
    },
  };
});

const NavbarSimple = ({ opened, setOpened, setPosition }) => {
  const { width } = useViewportSize();
  const { classes, cx, theme } = useStyles();
  const mobScreen = useMediaQuery("(max-width: 500px)");

  const [active, setActive] = useState("Billing");
  const [orderCount, setOrderCount] = useState(
    localStorage.getItem("orderCount") || 0
  );
  const [shipments, setShipments] = useState(
    localStorage.getItem("shipments") || 0
  );
  const [wallets, setWallets] = useState(localStorage.getItem("wallets") || 0);
  const [dropoffs, setDropoffs] = useState(
    localStorage.getItem("dropoffs") || 0
  );

  const [openSection, setOpenSection] = useState(""); // New state for tracking open section

  const navigate = useNavigate();
  const [signout] = useMutation(LOGOUT);
  const [permissions, setPermissions] = useState([]);
  useEffect(() => {
    const pusher = new Pusher("83f49852817c6b52294f", { cluster: "mt1" });
    const channel = pusher.subscribe("nav-counter");
    const notificationChannel = pusher.subscribe("notification");

    channel.bind("nav-counter", function (data) {
      localStorage.setItem("orderCount", data.data.orders);
      localStorage.setItem("wallets", data.data.wallets);
      localStorage.setItem("shipments", data.data.shipments);
      localStorage.setItem("dropoffs", data.data.drop_offs);
      setOrderCount(data.data.orders);
      setWallets(data.data.wallets);
      setShipments(data.data.shipments);
      setDropoffs(data.data.drop_offs);
    });

    notificationChannel.bind("new-item-created", function (data) {
      showNotification({
        color: data.type === "Error" ? "red" : "green",
        title: data.type,
        message: data.message,
        position: {
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
        autoClose: 5000,
      });
    });

    setPosition(null);
    return () => {
      pusher.disconnect();
    };
  }, []); // notification

  const handleSectionToggle = (sectionLabel) => {
    setOpenSection(openSection === sectionLabel ? "" : sectionLabel);
  };
  useEffect(() => {
    const storedPermissions =
      JSON.parse(localStorage.getItem("permissions")) || [];
    setPermissions(storedPermissions);
  }, []);
  if (permissions.length === 0) {
    return <div>Loading...</div>; // Show loading state
  }
  let data = [];
  if (permissions.length > 0) {
    data.push({ link: "/", label: "Dashboard", icon: IconDashboard });

    if (permissions.some((perm) => perm.name === "dropoffs-view")) {
      data.push({
        link: "/dropoffs",
        label: "Drop Offs",
        icon: IconTruckLoading,
      });
    }

    if (permissions.some((perm) => perm.name === "orders-view")) {
      data.push({ link: "/orders", label: "Orders", icon: IconShoppingCart });
    }
    if (permissions.some((perm) => perm.name === "shipments-view")) {
      data.push({ link: "/shipments", label: "Shipments", icon: IconShip });
    }
    if (permissions.some((perm) => perm.name === "users-view")) {
      data.push({ link: "/users", label: "User Management", icon: IconUsers });
    }
    if (permissions.some((perm) => perm.name === "wallets-view")) {
      data.push({ link: "/wallets", label: "Deposit Slip", icon: IconWallet });
    }
    if (permissions.some((perm) => perm.name === "categories-view")) {
      data.push({ link: "/categories", label: "Categories", icon: IconApps });
    }

    if (permissions.some((perm) => perm.name === "products-view")) {
      data.push({
        link: "/products",
        label: "Products",
        icon: IconBox,
      });
    }

    if (permissions.some((perm) => perm.name === "productvariants-view")) {
      data.push({
        link: "/productvariants",
        label: "Product Variant",
        icon: IconGeometry,
      });
    }

    if (permissions.some((perm) => perm.name === "warehouses-view")) {
      data.push({
        link: "/warehouses",
        label: "Warehouse",
        icon: IconBuildingWarehouse,
      });
    }

    if (permissions.some((perm) => perm.name === "regions-view")) {
      data.push({
        link: "/regions",
        label: "Regions",
        icon: IconCurrentLocation,
      });
    }

    if (permissions.some((perm) => perm.name === "retailers-view")) {
      data.push({
        link: "/retailers",
        label: "Retailers",
        icon: IconBrandShopee,
      });
    }

    if (permissions.some((perm) => perm.name === "drivers-view")) {
      data.push({ link: "/drivers", label: "Drivers", icon: IconSteeringWheel });
    }

    if (permissions.some((perm) => perm.name === "vehicle_types-view")) {
      data.push({
        link: "/vehicle_types",
        label: "Vehicle Types",
        icon: IconTruck,
      });
    }

    if (permissions.some((perm) => perm.name === "vehicles-view")) {
      data.push({
        link: "/vehicles",
        label: "Vehicles",
        icon: IconTruckDelivery,
      });
    }

    if (permissions.some((perm) => perm.name === "distributors-view")) {
      data.push({
        link: "/distributors",
        label: "Distributors",
        icon: IconApps,
      });
    }

    if (permissions.some((perm) => perm.name === "stocks-view")) {
      data.push({ link: "/stocks", label: "Stocks", icon: IconBuildingStore });
    }

    if (permissions.some((perm) => perm.name === "sales-show")) {
      data.push({ link: "/sales", label: "Sales Person", icon: IconUserPlus });
    }

    if (
      permissions.some((perm) => perm.name === "roles-view") ||
      permissions.some((perm) => perm.name === "configs-view") ||
      permissions.some((perm) => perm.name === "permissions-view")
    ) {
      data.push({
        label: "Settings",
        icon: IconSettings,
        initiallyOpened: false,
        links: [
          ...(permissions.some((perm) => perm.name === "roles-view")
            ? [{ link: "/roles", label: "Roles" }]
            : []),
          ...(permissions.some((perm) => perm.name === "configs-view")
            ? [{ link: "/config", label: "Configuration" }]
            : []),
          ...(permissions.some((perm) => perm.name === "permissions-view")
            ? [{ link: "/payment-types", label: "Payment Types" }]
            : []),
        ],
      });
    }
    if (
      permissions.some((perm) => perm.name === "feedbacks-view") ||
      permissions.some((perm) => perm.name === "feedback-types-show")
    ) {
      data.push({
        label: "Feedback",
        icon: FeedbackIcon,
        initiallyOpened: false,
        links: [
          ...(permissions.some((perm) => perm.name === "feedbacks-view")
            ? [{ link: "/feedbacks", label: "Feedbacks" }]
            : []),
          ...(permissions.some((perm) => perm.name === "feedback-types-show")
            ? [{ link: "/feedback-types", label: "Feedback Types" }]
            : []),
        ],
      });
    }

    data.push({
      label: "Report",
      icon: IconReport,
      initiallyOpened: false,
      links: [
        ...(permissions.some((perm) => perm.name === "reports-sales")
          ? [{ link: "/sales-report", label: "Sales Report" }]
          : []),
        ...(permissions.some((perm) => perm.name === "reports-retailers")
          ? [{ link: "/retailer-report", label: "Retailer Report" }]
          : []),
          ...(permissions.some((perm) => perm.name === "reports-retailers")
          ? [{ link: "/payment-report", label: "Payment Report" }]
          : [])
      ],
    });
  }

  const links = data.map((item, index) => (
    <React.Fragment key={index}>
      {item.links ? (
        <>
          <div
            style={{ cursor: "pointer" }}
            className={cx(classes.link, {
              [classes.linkActive]: item.label === active,
            })}
            onClick={() => handleSectionToggle(item.label)}
          >
            {item.icon && (
              <item.icon
                className={opened ? classes.linkIcon : classes.linkIconShort}
                stroke={1.5}
              />
            )}
            <div style={{ overflow: "hidden" }}>
              {opened ? (
                <span
                  style={{
                    fontWeight:
                      item.label === "Settings" || item.label === "Feedback" || "Report"
                        ? "bold"
                        : "normal",
                  }}
                >
                  {item.label}
                  <Badge
                    style={{ marginLeft: "10px" }}
                    size="xs"
                    variant="filled"
                  >
                    {openSection === item.label ? (
                      <IconChevronUp size={16} />
                    ) : (
                      <IconChevronDown size={16} />
                    )}
                  </Badge>
                </span>
              ) : null}
            </div>
          </div>
          <Collapse in={openSection === item.label}>
            {item.links.map((subItem, subIndex) => (
              <Link
                key={subIndex}
                className={cx(classes.link, {
                  [classes.linkActive]: subItem.label === active,
                })}
                to={subItem.link}
                onClick={(event) => {
                  event.preventDefault();
                  setActive(subItem.label);
                  navigate(subItem.link);
                }}
                style={{ paddingLeft: theme.spacing.lg }}
              >
                {subItem.icon && (
                  <subItem.icon
                    className={
                      opened ? classes.linkIcon : classes.linkIconShort
                    }
                    stroke={1.5}
                  />
                )}
                <div style={{ overflow: "hidden" }}>
                  {opened ? <span>{subItem.label}</span> : null}
                </div>
              </Link>
            ))}
          </Collapse>
        </>
      ) : (
        <>
          {opened ? (
            <Link
              className={cx(classes.link, {
                [classes.linkActive]: item.label === active,
              })}
              to={item.link}
              onClick={(event) => {
                event.preventDefault();
                setActive(item.label);
                navigate(item.link);
              }}
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <item.icon
                className={opened ? classes.linkIcon : classes.linkIconShort}
                stroke={1.5}
              />
              <div style={{ overflow: "hidden" }}>
                {opened ? (
                  <span>
                    {item.label}{" "}
                    {item.link === "/orders" &&
                    orderCount &&
                    parseInt(orderCount) > 0 ? (
                      <Badge
                        style={{
                          backgroundColor: "#FF6A00",
                          marginLeft: "40px",
                          color: "#FFFFFF",
                        }}
                        size="md"
                        variant="danger"
                        circle
                      >
                        {orderCount}
                      </Badge>
                    ) : null}
                    {item.link === "/shipments" &&
                    shipments &&
                    parseInt(shipments) > 0 ? (
                      <Badge
                        style={{
                          backgroundColor: "#FF6A00",
                          marginLeft: "18px",
                          color: "#FFFFFF",
                        }}
                        size="md"
                        variant="danger"
                        circle
                      >
                        {shipments}
                      </Badge>
                    ) : null}
                    {item.link === "/wallets" &&
                    wallets &&
                    parseInt(wallets) > 0 ? (
                      <Badge
                        style={{
                          backgroundColor: "#FF6A00",
                          marginLeft: "15px",
                          color: "#FFFFFF",
                        }}
                        size="md"
                        variant="danger"
                        circle
                      >
                        {wallets}
                      </Badge>
                    ) : null}
                    {item.link === "/dropoffs" &&
                    dropoffs &&
                    parseInt(dropoffs) > 0 ? (
                      <Badge
                        style={{
                          backgroundColor: "#FF6A00",
                          marginLeft: "26px",
                          color: "#FFFFFF",
                        }}
                        size="md"
                        variant="danger"
                        circle
                      >
                        {dropoffs}
                      </Badge>
                    ) : null}
                  </span>
                ) : null}
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
      )}
    </React.Fragment>
  ));

  const handleNameAvatar = () => {
    if (authDataVar().auth) {
      const text = authDataVar().auth.name;
      const new_splitted_text = text.split(" ");
      const NL = new_splitted_text[0].charAt(0);
      const FL = new_splitted_text[1]?.charAt(0) || ""; // Handle case where there might not be a second name

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
      <Navbar.Section mt="xs"></Navbar.Section>

      <Navbar.Section
        grow
        style={{
          overflowY: "auto",
          maxHeight: "calc(100vh - 100px)",
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(155, 155, 155, 0.5) rgba(255, 255, 255, 0.1)",
          scrollbarTrackColor: "rgba(255, 255, 255, 0.1)",
          scrollbarThumbColor: "rgba(155, 155, 155, 0.5)",
          WebkitScrollbarWidth: "2px",
        }}
      >
        {links}
      </Navbar.Section>
    </Navbar>
  );
};

export default NavbarSimple;
