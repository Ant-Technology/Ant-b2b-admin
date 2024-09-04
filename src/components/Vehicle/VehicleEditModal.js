import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  Select,
  Stack,
  TextInput,
} from "@mantine/core";
import { UPDATE_VEHICLE } from "apollo/mutuations";
import { useForm } from "@mantine/form";
import { GET_DRIVERS, GET_VEHICLE, GET_VEHICLE_TYPES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { showNotification } from "@mantine/notifications";

const VehicleEditModal = ({ editId, openedEdit, setOpenedEdit }) => {
  const [updateVehicle, { loading: updateVehicleLoading }] =
  useMutation(UPDATE_VEHICLE);
  
  const [vehicleTypeDropDownData, setVehicleTypeDropDownData] = useState([]);
  const [driverDropDownData, setDriverDropDownData] = useState([]);

  const form = useForm({});

  const { loading } = useQuery(GET_VEHICLE, {
    variables: { id: editId },
    onCompleted(data) {
      //   console.log(data.vehicle.vehicle_type.id)

      form.setValues({
        name: data.vehicle.name,
        model: data.vehicle.model,
        owner_name: data.vehicle.owner_name,
        color: data.vehicle.color,
        plate_number: data.vehicle.plate_number,
        owner_phone: data.vehicle.owner_phone,
        vehicle_type: { connect: parseInt(data.vehicle.vehicle_type.id) },
        driver: { connect: parseInt(data.vehicle.driver.id) },
      });
    },
    onError(err) {
      console.log(err);
    },
  });

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
      setOpenedEdit(false);
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
      setOpenedEdit(false);
      showNotification({
        color: "red",
        title: "Error",
        message: "Something went wrong while fetching drivers!",
      });
    },
  });

  const submit = () => {
    console.log(form.values);
    updateVehicle({
      variables: {
        id: editId,
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
          message: "Vehicle Edited Successfully",
        });

        setOpenedEdit(false);
      },
      onError() {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Something went wrong while editing vehicle",
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
        visible={
          loading ||
          updateVehicleLoading ||
          driver_loading ||
          vehicle_type_loading
        }
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
                label="Select Vehicle Type"
                placeholder="Pick one"
                data={vehicleTypeDropDownData}
                value={form
                  .getInputProps("vehicle_type.connect")
                  .value?.toString()}
                onChange={setVehicleTypeDropDownValue}
              />
              {/* pick driver  */}
              <Select
                label="Select Driver"
                placeholder="Pick one"
                data={driverDropDownData}
                value={form.getInputProps("driver.connect").value?.toString()}
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

export default VehicleEditModal;
