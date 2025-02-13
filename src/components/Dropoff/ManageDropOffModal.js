import { useQuery } from "@apollo/client";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Center,
  Flex,
  Group,
  LoadingOverlay,
  ScrollArea,
  Text,
} from "@mantine/core";
import { IconCaretDown } from "@tabler/icons";
import { GET_DROPOFF } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import React, { useEffect, useState } from "react";

const ManageDropOffModal = ({ editId, setOpenedEdit }) => {
  const [dropOffData, setDropOffData] = useState(null);
  const [collapse, setCollapse] = useState(null);
  // queries
  const { loading } = useQuery(GET_DROPOFF, {
    variables: { id: editId },
    onCompleted(data) {
      setDropOffData(data);
    },
    onError(data) {
      console.log("drop off data errror", data);
    },
});

console.log("drop off data ", dropOffData);
  useEffect(() => {
    console.log(collapse);
  }, [collapse]);

  return (
    <>
      <LoadingOverlay
        visible={loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: "90vh", marginY: 20 }}>
        <Card shadow="sm" p="lg" radius="md" withBorder>
          <Button variant="light" color="blue" fullWidth mt="md" radius="md">
            Driver Information
          </Button>

          <Group position="apart" mt="md" mb="xs">
            <Text weight={500}>
              Name:{" "}
              {dropOffData && dropOffData.dropoff.driver !== null
                ? dropOffData?.dropoff.driver?.name
                : "unknown"}
            </Text>
            <Badge color="green" variant="light">
              City:{" "}
              {dropOffData && dropOffData.dropoff.driver !== null
                ? dropOffData?.dropoff.driver?.city
                : "unknown"}
            </Badge>
          </Group>

          <Text size="sm" color="dimmed">
            Phone:{" "}
            {dropOffData && dropOffData.dropoff.driver !== null
              ? dropOffData?.dropoff.driver?.phone
              : "unknown"}{" "}
            <br />
            Address:{" "}
            {dropOffData && dropOffData.dropoff.driver !== null
              ? dropOffData?.dropoff.driver?.address
              : "unknown"}
          </Text>
        </Card>

        {dropOffData && dropOffData.dropoff.driver !== null
          ? dropOffData?.dropoff.dropoff_order.map((data, idx) => (
              <Card key={idx} shadow="sm" p="lg" my="md" radius="md" withBorder>
                <Group position="apart" mt="md" mb="xs">
                  <Text weight={500}>
                    Retailer :{" "}
                    {dropOffData && data.order.retailer !== null
                      ? data.order.retailer?.name
                      : "unknown"}
                  </Text>
                <Badge color={data.received ? "green" : "red"} variant="light">
                    
                    {dropOffData && data.received
                      ? "Recieved"
                      : "Not Recieved"}
                  </Badge>
                 
                  <Badge color="yellow" variant="light">
                    Items: {data.order.items.length}{" "}
                  </Badge>
                </Group>

                <Text size="sm" color="dimmed">
                  Phone:{" "}
                  {dropOffData && data.order.retailer !== null
                    ? data.order.retailer.contact_phone
                    : "unknown"}{" "}
                  <br />
                  Address:{" "}
                  {dropOffData && data.order.retailer !== null
                    ? data.order.retailer.address
                    : "unknown"}
                </Text>
                <Text size="sm" color="dimmed">
                    City:{" "}
                    {dropOffData && data.order.retailer !== null
                      ? data.order.retailer?.city
                      : "unknown"}
                  </Text>
                <Button
                  variant="light"
                  color="yellow"
                  fullWidth
                  mt="md"
                  radius="md"
                >
                  Order Price : {data.order.total_price}
                </Button>
                <Center mt="md">
                  <Button
                    onClick={() => setCollapse(idx)}
                    fullWidth
                    variant="outline"
                  >
                    <IconCaretDown />
                  </Button>
                </Center>
                {collapse === idx ? (
                  <ScrollArea style={{ width: "40vw", margin: "auto" }}>
                    <div >
                      <Flex
                        mih={150}
                        gap="md"
                        justify="center"
                        align="center"
                        direction="row"
                        
                      >
                        {data.order.items.map((data, id) => (
                          <>
                          <Card
                       
                            key={id}
                            shadow="lg"
                            p="lg"
                            my="md"
                            radius="md"
                           style={{ width: "250px", height: "200px"}}
                            withBorder
                            >
                            <Avatar.Group>
                              {data.product_sku.product.images?.map((data, id) => (
                                <Avatar key={id} src={data.original_url} />
                                // console.log(data)
                              ))}
                            </Avatar.Group>
                            <Text>{data.product_sku.product.name}</Text>
                          </Card>
                        
                                </>
                       
                        ))}
                      </Flex>
                    </div>
                  </ScrollArea>
                ) : (
                  ""
                )}
              </Card>
            ))
          : ""}
      </ScrollArea>
    </>
  );
};

export default ManageDropOffModal;
