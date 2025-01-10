import React, { useEffect, useState } from "react";
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
import axios from "axios";
import { API, formatNumber } from "utiles/url";

export const TopDrivers = () => {
  const [timeRange, setTimeRange] = useState("this_weeks");
  const [result, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState(5); // Default selected badge

  useEffect(() => {
    fetchDataTopRetailers(); // Fetch data on component mount
  }, []);

  const fetchDataTopRetailers = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        `${API}/top-drivers?limit=${selectedBadge}&date_range=${timeRange}`,
        config
      );
      if (data) {
        setData(data);
        console.log(data);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBadgeClick = async (badgeValue) => {
    setSelectedBadge(badgeValue);
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        `${API}/top-drivers?limit=${badgeValue}&date_range=${timeRange}`,
        config
      );
      if (data) {
        setData(data);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = async (value) => {
    setTimeRange(value);
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(
        `${API}/top-drivers?limit=${selectedBadge}&date_range=${value}`,
        config
      );
      if (data) {
        setData(data);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <div
    style={{
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      padding: "20px",
      marginBottom: "20px",
    }}
  >
      <Group position="apart">
        <Title order={4}>Top Drivers</Title>
        <Select
          data={[
            { value: "this_weeks", label: "This Week" },
            { value: "this_month", label: "This Month" },
            { value: "this_six_months", label: "Six Months" },
            { value: "this_year", label: "This Year" },
            { value: "all_time", label: "All" },
          ]}
          value={timeRange}
          onChange={handleTimeRangeChange}
          size="xs"
          placeholder="Select Range"
          style={{ width: "110px" }}
        />
      </Group>
      <Group spacing="xs" mb="md">
        {[5, 10, 15].map((badge) => (
          <Badge
            key={badge}
            color={badge === selectedBadge ? "green" : "blue"}
            variant="light"
            onClick={() => handleBadgeClick(badge)}
            style={{ cursor: "pointer" }}
          >
            {badge}
          </Badge>
        ))}
      </Group>

      <List spacing="md" size="sm">
        {result.length > 0 ? (
          result.map((item, index) => (
            <List.Item
              key={index}
              style={{ display: "flex", alignItems: "center" }}
            >
              <Group spacing="sm" style={{ flex: 1 }}>
                <Avatar color="blue" radius="xl">
                  {item.driver?.name[0]}
                </Avatar>
                <Box style={{ display: "flex", flex: 1, minWidth: 0 }}>
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
                    {item.driver?.name}
                  </Text>
                  <Box style={{ marginLeft: "auto", flexShrink: 0 }}>
                    <Text size="sm" color="green" weight={700}>
                      {formatNumber(item.total_cost)}
                    </Text>
                  </Box>
                </Box>
              </Group>
            </List.Item>
          ))
        ) : (
          <Text>No data available</Text>
        )}
      </List>
  </div>
  );
};
