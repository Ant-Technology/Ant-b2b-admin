import React from "react";
import {
  createStyles,
  Group,
  Text,
  Avatar,
  Container,
  Box,
  Title,
  Flex,
} from "@mantine/core";
import { useQuery } from "@apollo/client";
import { GET_ANALYTICS } from "apollo/queries";
import {
  IconDashboard,
  IconApps,
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
  IconChevronDown,
  IconSettings,
  IconHistory,
  IconClipboardList,
  IconTimeline,
  IconChevronUp,
} from "@tabler/icons";
import {
  Discount2,
  Receipt2,
  Coin,
  ArrowUpRight,
  ArrowDownRight,
} from "tabler-icons-react";
import UserStatus from "./userStatus";

const useStyles = createStyles((theme) => ({
  statBox: {
    display: "flex",
    backgroundColor: "#f8f9fa",
    padding: theme.spacing.md,
    borderRadius: theme.radius.sm,
    flex: "0 0 auto", // Prevents flex items from shrinking
    maxWidth: "200px", // Ensures consistent width
    margin: `${theme.spacing.xs}px 0`,
  },
  statTitle: {
    fontSize: theme.fontSizes.sm,
    fontWeight: 700,
    color:"#101F0C"
  },
  statValue: {
    color:"#F36825",
    fontSize: theme.fontSizes.lg,
    fontWeight: 700,
    marginTop: 4,
  },
  userStatusWrapper: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
}));

const icons = {
  user: IconShoppingCart,
  discount: Discount2,
  receipt: IconShoppingCart,
  coin: IconShip,
};

export default function StatsGrid({ datas }) {
  const { data, loading } = useQuery(GET_ANALYTICS);
  const { classes } = useStyles();

  const fieldMap = {
    Orders: "orders",
    Shipments: "shipments",
    "Total Sales": "totalSales",
    "Total Active Products": "totalActiveProducts"
  };
  const formatNumber = (value) => {
    if (value === null || value === undefined) return "0";
    return new Intl.NumberFormat().format(value);
  };
  const stats = datas.map((stat) => {
    if (!loading && fieldMap[stat.title]) {
      stat.value = data?.getAnalytics[fieldMap[stat.title]];
    }
    const Icon = icons[stat.icon];
    const DiffIcon = stat.diff > 0 ? ArrowUpRight : ArrowDownRight;

    return (
      <Box className={classes.statBox} key={stat.title}>
        <Avatar radius="sm" size="md" color="blue" style={{ marginRight: 12 }}>
          <Icon size={24} />
        </Avatar>
        <div>
          <Text className={classes.statTitle}>{stat.title}</Text>
          <Text className={classes.statValue}>{formatNumber(stat.value)}</Text>
        </div>
      </Box>
    );
  });

  return (
      <Flex
        gap="md"
        justify="space-between"
        align="flex-start"
        style={{ marginTop: "16px" }}
      >
        <Group
          spacing="md"
          position="apart"
          noWrap
          style={{ flex: 2, overflowX: "auto" }}
        >
          {stats}
        </Group>

        <div className={classes.userStatusWrapper}>
          <UserStatus />
        </div>
      </Flex>
  );
}
