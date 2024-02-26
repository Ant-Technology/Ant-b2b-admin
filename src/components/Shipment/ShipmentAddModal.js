import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  ScrollArea,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";

import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { GET_DISTRIBUTORS, GET_WARE_HOUSES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { CREATE_SHIPMENT } from "apollo/mutuations";
import { useViewportSize } from "@mantine/hooks";

export const ShipmentAddModal = ({ setOpened }) => {
  const [whdropdown, setWhdropdown] = useState([]);
  const [distDropDown, setdistDropDown] = useState([]);

  const { loading: warehouseloading } = useQuery(GET_WARE_HOUSES, {
    variables: {
      first: 10000,
      page: 1,
    },
    onCompleted(data) {
      const wareHouses = [];
      data.warehouses.data.forEach((item) => {
        wareHouses.push({ label: item.name, value: item.id });
      });

      setWhdropdown(wareHouses);
    },
  });

  const { loading: distributorloading } = useQuery(GET_DISTRIBUTORS, {
    variables: {
      first: 10000,
      page: 1,
    },
    onCompleted(data) {
      const Distributor = [];
      data.distributors.data.forEach((item) => {
        Distributor.push({ label: item.name, value: item.id });
      });

      setdistDropDown(Distributor);
    },
  });

  const { height } = useViewportSize();

  const form = useForm({
    initialValues: {
      departure_date: "",
      arrival_date: "",
      departure_time: "",
      arrival_time: "",
      cost: "",
      from: {
        connect: {
          type: "WAREHOUSE",
          id: "",
        },
      },
      to: {
        connect: {
          type: "DISTRIBUTOR",
          id: "",
        },
      },
    },
  });

  const [createShipment, { loading: shipmentCreateLoading }] =
    useMutation(CREATE_SHIPMENT);

  const submit = () => {
    createShipment({
      variables: {
        arrival_time: form.values.arrival_date + " " + form.values.arrival_time,
        departure_time:
          form.values.departure_date + " " + form.values.departure_time,
        cost: parseInt(form.values.cost),
        from: {
          connect: {
            type: "WAREHOUSE",
            id: form.values.from.connect.id,
          },
        },
        to: {
          connect: {
            type: "DISTRIBUTOR",
            id: form.values.to.connect.id,
          },
        },
      },
      onCompleted(data) {
        setOpened(false);
        showNotification({
          color: "green",
          title: "Success",
          message: "Shipment Created Successfully",
        });
      },
      onError(data) {
        showNotification({
          color: "red",
          title: "Error",
          message: `${data}`,
        });
      },
    });
  };

  const setWareHouseValue = (val) => {
    form.setFieldValue("from.connect.id", val);
  };

  const setDistributorValue = (val) => {
    form.setFieldValue("to.connect.id", val);
  };

  const setDepartureTime = (val) => {
    form.setFieldValue(
      "departure_time",
      String(val.getHours()).padStart(2, "0") +
        ":" +
        String(val.getUTCMinutes()).padStart(2, "0") +
        ":" +
        String(val.getUTCSeconds()).padStart(2, "0")
    );
  };

  const setArrivalTime = (val) => {
    form.setFieldValue(
      "arrival_time",
      String(val.getHours()).padStart(2, "0") +
        ":" +
        String(val.getUTCMinutes()).padStart(2, "0") +
        ":" +
        String(val.getUTCSeconds()).padStart(2, "0")
    );
  };
  const setDepartureDate = (val) => {
    form.setFieldValue(
      "departure_date",
      val.getFullYear() + "-" + (val.getUTCMonth() + 1) + "-" + val.getDay()
    );
  };

  const setArrivalDate = (val) => {
    form.setFieldValue(
      "arrival_date",
      val.getFullYear() + "-" + (val.getUTCMonth() + 1) + "-" + val.getDay()
    );
  };

  return (
    <>
      <LoadingOverlay
        visible={
          warehouseloading || distributorloading || shipmentCreateLoading
        }
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <DatePicker
                  required
                  placeholder="Pick date"
                  label="Departure Date"
                  dropdownType="modal"
                  inputFormat="YYYY-MM-DD"
                  onChange={(val) => setDepartureDate(val)}
                />
                <TimeInput
                  required
                  label="Departure time"
                  withSeconds
                  onChange={(val) => setDepartureTime(val)}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <DatePicker
                  required
                  placeholder="Pick date"
                  label="Arrival Date"
                  dropdownType="modal"
                  inputFormat="YYYY-MM-DD"
                  onChange={(val) => setArrivalDate(val)}
                />
                <TimeInput
                  required
                  label="Arrival time"
                  onChange={(val) => setArrivalTime(val)}
                  withSeconds
                  // value={form.values.arrival_time}
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={12}>
                <TextInput
                  required
                  type="number"
                  label="Cost"
                  placeholder="Cost"
                  {...form.getInputProps("cost")}
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Select
                  data={whdropdown}
                  onChange={setWareHouseValue}
                  label="Ware house"
                  placeholder="Pick the departure warehouse"
                />
              </Grid.Col>
              <Grid.Col span={12}>
                <Select
                  data={distDropDown}
                  onChange={setDistributorValue}
                  label="Distributor"
                  placeholder="Pick reciving distributor"
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={12}>
                <Button type="submit" color="blue" variant="outline" fullWidth>
                  Submit
                </Button>
              </Grid.Col>
            </Grid>
          </Stack>
        </form>{" "}
      </ScrollArea>
    </>
  );
};
