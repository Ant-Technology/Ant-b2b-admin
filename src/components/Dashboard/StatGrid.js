import React from "react";
import { createStyles, Group, Paper, SimpleGrid, Text } from "@mantine/core";
import {
  UserPlus,
  Discount2,
  Receipt2,
  Coin,
  ArrowUpRight,
  ArrowDownRight,
} from "tabler-icons-react";
import { Clock } from "tabler-icons-react"; // Import the Clock icon

import { useQuery } from "@apollo/client";
import { GET_ANALYTICS } from "apollo/queries";

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },
  paper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    padding: theme.spacing.md,
    backgroundColor: "#FF6A00",
    color: "#FFFFFF",
    borderRadius: theme.radius.md,
  },
  value: {
    fontSize: 15,
    fontWeight: 650,
    lineHeight: 1,
  },

  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },

 

  title: {
    fontWeight: 700,
    textTransform: "uppercase",
  },
}));

const icons = {
  user: UserPlus,
  discount: Discount2,
  receipt: Receipt2,
  coin: Coin,
};

export default function StatsGrid({ datas }) {
  const { data, loading } = useQuery(GET_ANALYTICS);

  const { classes } = useStyles();
  const fieldMap = {
    "Orders": "orders",
    "Shipments": "shipments",
    "Total Sales": "totalSales",
    "Total Active Products": "totalActiveProducts"
  };
  const stats = datas.map((stat) => {
    if (!loading && fieldMap[stat.title]) {
      stat.value = data?.getAnalytics[fieldMap[stat.title]];
    }
    const Icon = icons[stat.icon];
    const DiffIcon = stat.diff > 0 ? ArrowUpRight : ArrowDownRight;

    return (
      <Paper className={classes.paper}withBorder p="md" radius="md" key={stat.title}>
        <Group position="apart">
          <Text size="xs"  className={classes.title}>
            {stat.title}
          </Text>
          <Icon  size={22} />
        </Group>

        <Group align="center" spacing="xs" mt={25}>
          <Text className={classes.value}>{stat.value}</Text>
        
        </Group>

      </Paper>
    );
  });
  return (
    <div className={classes.root}>
      <SimpleGrid
      
        cols={4}
        breakpoints={[
          { maxWidth: "md", cols: 2 },
          { maxWidth: "xs", cols: 1 },
        ]}
      >
        {stats}
      </SimpleGrid>
    </div>
  );
}
