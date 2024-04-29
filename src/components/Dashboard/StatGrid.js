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
import { useQuery } from "@apollo/client";
import { GET_ANALYTICS } from "apollo/queries";

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },

  value: {
    fontSize: 24,
    fontWeight: 700,
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
      <Paper style={{backgroundColor:"#FF6A00",color:"#FFFFFF"}} withBorder p="md" radius="md" key={stat.title}>
        <Group position="apart">
          <Text size="xs"  className={classes.title}>
            {stat.title}
          </Text>
          <Icon  size={22} />
        </Group>

        <Group align="flex-end" spacing="xs" mt={25}>
          <Text className={classes.value}>{stat.value}</Text>
          <Text
            color={stat.diff > 0 ? "teal" : "red"}
            size="sm"
            weight={500}
            className={classes.diff}
          >
            <span>{stat.diff}%</span>
            <DiffIcon size={16} />
          </Text>
        </Group>

        <Text size="xs"  mt={7}>
          Compared to previous month
        </Text>
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
