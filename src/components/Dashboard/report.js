import React, { useState } from "react";
import {
  Container,
  Grid,
  Card,
  Text,
  List,
  Avatar,
  Group,
  Badge,
  Box,
  Title,
  Select,
} from "@mantine/core";

const data = {
  agents: [
    { name: "Hagos", sales: 16359090 },
    { name: "Hayem", sales: 4188520 },
    { name: "Markos Wodajo", sales: 3025365 },
    { name: "Tadesse Mekonnen", sales: 2873400 },
    { name: "Bereket Sadiq", sales: 2421845 },
  ],
  distributors: [
    { name: "Hagos", sales: 7687790 },
    { name: "Ashenafi Hailu", sales: 960130 },
    { name: "Tadesse Hagos", sales: 852500 },
    { name: "Yared Yelima", sales: 809410 },
    { name: "Markos Wodajo", sales: 787000 },
  ],
};

const SalesList = ({ title, items }) => {
  const [timeRange, setTimeRange] = useState("month");

  return (
    <Card shadow="sm" radius="md" padding="lg" style={{ position: "relative" }}>
      {/* Card Header */}
      <Group position="apart">
        <Title order={4}>{title}</Title>
        <Select
          data={[
            { value: "week", label: "One Week" },
            { value: "month", label: "Month" },
            { value: "year", label: "Year" },
          ]}
          value={timeRange}
          onChange={(value) => setTimeRange(value)}
          size="xs"
          placeholder="Select Range"
          style={{ width: "100px" }}
        />
      </Group>

      {/* Subtitle */}
      <Text size="sm" color="dimmed" mt="xs" mb="md">
        Last 30 days
      </Text>

      {/* Number Badges */}
      <Group spacing="xs" mb="md">
        <Badge color="blue" variant="light">
          5
        </Badge>
        <Badge color="blue" variant="light">
          10
        </Badge>
        <Badge color="blue" variant="light">
          15
        </Badge>
      </Group>

      {/* Sales List */}
      <List spacing="md" size="sm">
        {items.map((item, index) => (
          <List.Item
            key={index}
            style={{ display: "flex", alignItems: "center" }}
          >
            <Group spacing="sm" style={{ flex: 1 }}>
              {/* Circular Initial */}
              <Avatar color="blue" radius="xl">
                {item.name[0]}
              </Avatar>

              {/* Name and Sales with Fixed Width */}
              <Box style={{ display: "flex", flex: 1, minWidth: 0 }}>
                {/* Fixed-width name */}
                <Text
                  size="sm"
                  weight={600}
                  style={{
                    width: "145px",
                    whiteSpace: "normal",
                    wordBreak: "break-word",
                    overflow: "visible",
                  }}
                >
                  {item.name}
                </Text>

                {/* Sales Value */}
                <Box style={{ marginLeft: "auto", flexShrink: 0 }}>
                  <Text size="sm" color="green" weight={700}>
                    {item.sales.toLocaleString()}
                  </Text>
                </Box>
              </Box>
            </Group>
          </List.Item>
        ))}
      </List>
    </Card>
  );
};

const SalesDashboard = () => (
  <Container>
    <Grid>
      <Grid.Col span={4}>
        <SalesList title="Top 5 Driver" items={data.agents} />
      </Grid.Col>
      <Grid.Col span={4}>
        <SalesList title="Top 5 Retailer" items={data.distributors} />
      </Grid.Col>
    </Grid>
  </Container>
);

export default SalesDashboard;
