import { useEffect, useState } from "react";
import {
  Table,
  ScrollArea,
  Card,
  LoadingOverlay,
  Avatar,
  Text,
  createStyles,
  Grid,
  Flex,
  Group,
  Button,
  Box,
  Select,
} from "@mantine/core";
import { IconMinus, IconPhone, IconPlus } from "@tabler/icons";
import { useForm } from "@mantine/form";

import { useViewportSize } from "@mantine/hooks";
import { useMutation, useQuery } from "@apollo/client";
import { GET_DRIVERS } from "apollo/queries";
import { showNotification } from "@mantine/notifications";
import { ACCEPT_SHIPMENT_REQUEST } from "apollo/mutuations";

const useStyles = createStyles((theme) => ({
  root: {
    padding: theme.spacing.xl * 1.5,
  },
  diff: {
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
  },
}));

const ShipmentDetail = ({refetch,setOpenedDetail, row }) => {
  const { classes } = useStyles();
  const { height } = useViewportSize();
  const [driversDropDownData, setDriversDropDownData] = useState([]);
  const [searchValue, setSearchValue] = useState("");

 console.log(row)
  const form = useForm({
    initialValues: {
      driver_id: "",
      shipment_id: ""
    },
  });
  const { loading: driversLoading } = useQuery(GET_DRIVERS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let drivers = data.drivers;
      let driversArray = [];

      // loop over regions data to structure the data for the use of drop down
      drivers.data.forEach((driver, index) => {
        driversArray.push({
          label: driver?.name,
          value: driver?.id,
        });
      });

      // put it on the state
      setDriversDropDownData([...driversArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });


  // Flatten all items from each order into a single array
  const allItems = row?.items?.flatMap(
    (shipmentItem) => shipmentItem.shipment_itemable?.order?.items || []
  );

  const processedItems = allItems.reduce((acc, item, index) => {
    // Group items into pairs
    if (index % 2 === 0) {
      const firstItem = item;
      const secondItem = allItems[index + 1];

      acc.push(
        <tr key={`shipment-item-${index}`}>
          <td>{firstItem?.product_sku?.product?.name || ""}</td>
          <td>
            <Avatar.Group>
              {firstItem?.product_sku?.product?.images?.map((image, imgIdx) => (
                <Avatar key={imgIdx} src={image.original_url} />
              ))}
            </Avatar.Group>
          </td>
          {secondItem && (
            <>
              <td>{secondItem?.product_sku?.product?.name || ""}</td>
              <td>
                <Avatar.Group>
                  {secondItem?.product_sku?.product?.images?.map(
                    (image, imgIdx) => (
                      <Avatar key={imgIdx} src={image.original_url} />
                    )
                  )}
                </Avatar.Group>
              </td>
            </>
          )}
          {!secondItem && (
            <>
              <td></td>
              <td></td>
            </>
          )}
        </tr>
      );
    }
    return acc;
  }, []);
  const setDriverDropDownValue = (val) => {
    form.setFieldValue("driver_id", val);
  };
  const [assignDriver, { loading: assignDriverLoading }] =
    useMutation(ACCEPT_SHIPMENT_REQUEST);

 
  const submit = () => {
    assignDriver({
      variables: {
        driver_id: form.values.driver_id,
        shipment_id: row?.id 
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Driver Assigned  Successfully",
        });
        refetch();
        setOpenedDetail(false);
      },
      onError(error) {
        setOpenedDetail(false);
        const errorMessage = error?.graphQLErrors?.[0]?.extensions?.errors?.message;

      if (errorMessage === "The shipment already assigned to other driver") {
        showNotification({
          color: "red",
          title: "Error",
          message: "Unable to assign shipment. The shipment is already assigned to another driver.",
        });
      } else {
        showNotification({
          color: "red",
          title: "Error",
          message: "Driver Not Assigned Successfully",
        });
      }
      },
    });
  };

  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <div style={{ width: "98%", margin: "auto" }}>
        <LoadingOverlay
          visible={row === null || driversLoading || assignDriverLoading}
          color="blue"
          overlayBlur={2}
          loader={<div>Loading...</div>}
        />
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            p: 1,
            m: 1,
            bgcolor: "background.paper",
            borderRadius: 1,
          }}
        >
          <Card style={{ width: "40%", marginRight:"30px" }} shadow="sm" radius="md" withBorder>
            <div style={{ paddingLeft: "20px" }}>
              <Flex
                mih="100%"
                gap="xl"
                justify="center"
                align="center"
                direction="row"
                wrap="wrap"
              >
                <Group>
                  <Button variant="light" color="green" fullWidth radius="md">
                    From: {row?.from.name}
                  </Button>

                  <Button variant="light" color="blue" fullWidth radius="md">
                    To: {row?.to.name}
                  </Button>
                </Group>
              </Flex>

              <Flex
                mih="100%"
                gap="xl"
                justify="center"
                align="center"
                direction="row"
                wrap="wrap"
              >
                <Button
                  style={{ marginTop: "10px" }}
                  leftIcon={<IconPhone />}
                  color="green"
                  variant="green"
                >
                  Call Driver
                </Button>
              </Flex>
            </div>
          </Card>
          {row?.status === "DRIVER_REQESTING" &&
          <Card
            style={{ width: "30%" , marginLeft:"30px" }}
            shadow="sm"
            radius="md"
            withBorder
          >
             <form onSubmit={form.onSubmit(() => submit())}>
             <Select
                  data={driversDropDownData}
                  value={form.getInputProps("driver_id")?.value.toString()}
                  onChange={setDriverDropDownValue}
                  label="Drivers"
                  placeholder="Pick a Driver to be Assign"
                  searchable
                  nothingFound="No drivers found"
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                />
                 <Button
                  style={{
                    width: "25%",
                    marginTop: "15px",
                    backgroundColor: "#FF6A00", 
                    color: "#FFFFFF",
                  }}
                  type="submit"
                  
                  fullWidth
                >
                  Assign
                </Button>
                </form>
          </Card>
}
        </Box>
        <Card style={{ marginTop: "30px" }} shadow="sm" p="lg">
          <ScrollArea>
            <Text size="md" weight={500} className={classes.diff}>
              <span>Product Items</span>
            </Text>
            <Table
              horizontalSpacing="md"
              verticalSpacing="xs"
              sx={{ tableLayout: "fixed", minWidth: 700 }}
            >
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>{processedItems}</tbody>
            </Table>
          </ScrollArea>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default ShipmentDetail;
