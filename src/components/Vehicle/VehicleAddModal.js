import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { CREATE_VEHICLE } from "apollo/mutuations";
import { GET_DRIVERS, GET_VEHICLES, GET_VEHICLE_TYPES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import React, { useState } from "react";

const VehicleAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {


  const form = useForm({
    initialValues: {
      name: "",
      model: "",
      plate_number: "",
      color: "",
      owner_name: "",
      owner_phone: "",
      driver: { connect: 1 },
      vehicle_type: { connect: 1 },
    },
  });

  //states for the drop down
  const [vehicleTypeDropDownData, setVehicleTypeDropDownData] = useState([]);
  const [driverDropDownData, setDriverDropDownData] = useState([]);

  const { loading: vehicle_type_loading } = useQuery(GET_VEHICLE_TYPES, {
    variables: {
      first: 100,
    },
    onCompleted(data) {
      const newArr = [];
      data.vehicleTypes.data.forEach((element) => {
        newArr.push({ label: element.title, value: element.id });
      });

      setVehicleTypeDropDownData(newArr);
    },
    onError() {
      showNotification({
        color: "red",
        title: "Error",
        message: "Something went wrong while fetching vehicle types!",
      });
      setOpened(false);
    },
  });
  const { loading: driver_loading } = useQuery(GET_DRIVERS, {
    variables: {
      first: 100,
    },
    onCompleted(data) {
      const newArr = [];
      data.drivers.data.forEach((element) => {
        newArr.push({ label: element.name, value: element.id });
      });
      setDriverDropDownData(newArr);
    },
    onError() {
      setOpened(false);
      showNotification({
        color: "red",
        title: "Error",
        message: "Something went wrong while fetching drivers!",
      });
    },
  });

  const [addVehicle, { loading }] = useMutation(CREATE_VEHICLE, {
    update(cache, { data: { createVehicle } }) {
      cache.updateQuery(
        {
          query: GET_VEHICLES,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.vehicles.data.length === 10) {
            setTotal(total + 1);
            setActivePage(total + 1);
          } else {
            return {
              vehicles: {
                data: [createVehicle, ...data.vehicles.data],
              },
            };
          }
        }
      );
    },
  });

  const submit = () => {
    addVehicle({
      variables: {
        name: form.getInputProps("name").value,
        model: form.getInputProps("model").value,
        plate_number: form.getInputProps("plate_number").value,
        color: form.getInputProps("color").value,
        owner_name: form.getInputProps("owner_name").value,
        owner_phone: form.getInputProps("owner_phone").value,
        driver: form.getInputProps("driver").value,
        vehicle_type: form.getInputProps("vehicle_type").value,
      },
      onCompleted() {
        showNotification({
          color: "green",
          title: "Success",
          message: "Vehicle Created Successfully",
        });

        setOpened(false);
      },
      onError() {
        setOpened(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Something went wrong while creating vehicle",
        });
      },
    });
  };

  const setVehicleTypeDropDownValue = (val) => {
    form.setFieldValue("vehicle_type.connect", val);
  };

  const setDriverDropDownValue = (val) => {
    form.setFieldValue("driver.connect", val);
  };

  return (
    <>
      <LoadingOverlay
        visible={loading || driver_loading || vehicle_type_loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <form onSubmit={form.onSubmit(() => submit())}>
        <Stack>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                placeholder="Name"
                label="Name"
                {...form.getInputProps("name")}
                withAsterisk
              />

              <TextInput
                placeholder="Model"
                label="Model"
                {...form.getInputProps("model")}
                withAsterisk
              />

              <TextInput
                placeholder="Plate Number"
                label="Plate Number"
                {...form.getInputProps("plate_number")}
                withAsterisk
              />

              <TextInput
                placeholder="Color"
                label="Color"
                {...form.getInputProps("color")}
                withAsterisk
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                placeholder="Owner Name"
                label="Owner Name"
                {...form.getInputProps("owner_name")}
                withAsterisk
              />
              <TextInput
                placeholder="Owner Phone"
                label="Owner Phone"
                {...form.getInputProps("owner_phone")}
                withAsterisk
              />
              {/* pick vehcle type */}
              <Select
              searchable
                label="Select Vehicle Type"
                placeholder="Pick one"
                data={vehicleTypeDropDownData}
                value={form
                  .getInputProps("vehicle_type.connect")
                  .value.toString()}
                onChange={setVehicleTypeDropDownValue}
              />
              {/* pick driver  */}
              <Select
                label="Select Driver"
                searchable
                placeholder="Pick one"
                data={driverDropDownData}
                value={form.getInputProps("driver.connect").value.toString()}
                onChange={setDriverDropDownValue}
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

export default VehicleAddModal;
