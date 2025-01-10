import React, { useEffect, useState } from "react";
import {
  Card,
  Text,
  Title,
  Group,
  Box,
  Avatar,
  Container,
} from "@mantine/core";
import { IconTruckDelivery, IconBuildingStore } from "@tabler/icons-react";
import axios from "axios";
import { API } from "utiles/url";

const UserStatus = () => {
  const [result, setData] = useState();
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${API}/users-stats`, config);
      if (data) {
        setLoading(false);
        setData(data.userStatistics);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const data = [
    {
      title: "Admin",
      value: result?.admin_count,
      icon: <IconTruckDelivery size={24} color="white" />,
      color: "orange",
    },
    {
      title: "Driver",
      value:  result?.driver_count,
      icon: <IconTruckDelivery size={24} color="white" />,
      color: "orange",
    },
    {
      title: "Retailers",
      value: result?.retailer_count,
      icon: <IconBuildingStore size={24} color="white" />,
      color: "blue",
    },
  ];

  return (
    <Container>
      <Card shadow="sm" radius="md" padding="lg" style={{ marginTop: "20px" }}>
        {/* Title */}
        <Title order={4} mb="xs">
          User Status
        </Title>
        <Group
          spacing="md"
          position="apart"
          noWrap // Ensures all items are in one row
          style={{
            overflowX: "auto", // Enables horizontal scrolling if needed
            whiteSpace: "nowrap", // Prevents line breaks
          }}
        >
          {data.map((item, index) => (
            <Box
              key={index}
              style={{
                display: "inline-flex", // Keeps boxes inline
                alignItems: "center",
                backgroundColor: "#f8f9fa",
                padding: "10px 15px",
                borderRadius: "8px",
                flex: "0 0 auto", // Prevents shrinking
                maxWidth: "150px",
              }}
            >
              {/* Colored Icon */}
              <Avatar
                radius="md"
                size="md"
                color={item.color}
                style={{ marginRight: "12px" }}
              >
                {item.icon}
              </Avatar>

              {/* User Info */}
              <div>
                <Text size="xs" color="dimmed">
                  {item.title}
                </Text>
                <Text size="lg" weight={700}>
                  {item.value}
                </Text>
              </div>
            </Box>
          ))}
        </Group>
      </Card>
    </Container>
  );
};

export default UserStatus;
