import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { DatePicker, TimeInput } from "@mantine/dates";

import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { CREATE_SHIPMENT } from "apollo/mutuations";
import { GET_DISTRIBUTORS, GET_SHIPMENT, GET_WARE_HOUSES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";

import { useEffect, useState } from "react";

const ShipmentManageModal = ({ editId, setOpenedEdit }) => {
  const [whdropdown, setWhdropdown] = useState([]);
  const [distDropDown, setdistDropDown] = useState([]);

   useQuery(GET_WARE_HOUSES, {
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
  const form = useForm({
    initialValues: {
      departure_date: "2022-09-09",
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

  const { loading: editShipLoading } = useQuery(GET_SHIPMENT, {
    variables: {
      id: editId,
    },
    onCompleted(data) {
      const arrival_time = new Date(data.shipment.arrival_time);
      const departure_time = new Date(data.shipment.departure_time);
      form.setFieldValue(
        "departure_date",
        String(departure_time.getFullYear()).padStart(2, "0") +
          "-" +
          String(departure_time.getMonth()).padStart(2, "0") +
          "-" +
          String(departure_time.getDay()).padStart(2, "0")
      );
      form.setFieldValue(
        "arrival_date",
        String(arrival_time.getFullYear()).padStart(2, "0") +
          "-" +
          String(arrival_time.getMonth()).padStart(2, "0") +
          "-" +
          String(arrival_time.getDay()).padStart(2, "0")
      );
    },
  });

  useEffect(() => {}, []);

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
        setOpenedEdit(false);
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
      <form onSubmit={form.onSubmit(() => submit())}>
        <LoadingOverlay
          visible={editShipLoading || distributorloading || shipmentCreateLoading }
          color="blue"
          overlayBlur={2}
          loader={customLoader}
        />
        <Stack>
          <Grid>
            <Grid.Col span={6}>
              <DatePicker
                required
                placeholder="Pick date"
                label="Departure Date"
                dropdownType="modal"
                inputFormat="YYYY-MM-DD"
                defaultValue={new Date(form.values.departure_date)}
                clearable={false}
                onChange={(val) => setDepartureDate(val)}
              />
              <TimeInput
                required
                label="Departure time"
                withSeconds
                defaultValue={new Date()}
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
                defaultValue={new Date(form.values.arrival_date)}
                onChange={(val) => setArrivalDate(val)}
              />
              <TimeInput
                required
                label="Arrival time"
                defaultValue={new Date()}
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
      </form>
    </>
  );
};

export default ShipmentManageModal;
