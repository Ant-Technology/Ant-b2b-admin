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
import {
  GET_DRIVERS,
  GET_REGIONS,
  GET_UNASSIGNED_DRIVERS,
  GET_VEHICLES,
  GET_VEHICLE_TYPES,
} from "apollo/queries";
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
      model: "",
      plate_number: "",
      color: "",
      owner_name: "",
      owner_phone: "",
      driver: { connect: 1 },
      region: { connect: 1 },
      vehicle_type: { connect: 1 },
    },
  });

  // States for the dropdowns
  const [vehicleTypeDropDownData, setVehicleTypeDropDownData] = useState([]);
  const [driverDropDownData, setDriverDropDownData] = useState([]);
  const [regionDropDownData, setRegionDropDownData] = useState([]);

  // Fetch Vehicle Types
  const { loading: vehicle_type_loading } = useQuery(GET_VEHICLE_TYPES, {
    variables: {
      first: 100,
    },
    onCompleted(data) {
      const newArr = data.vehicleTypes.data.map((element) => ({
        label: element.title,
        value: element.id,
      }));
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

  // Fetch Regions
  const { loading: region_loading } = useQuery(GET_REGIONS, {
    variables: {
      first: 100,
      page: 1,
    },
    onCompleted(data) {
      const newArr = data.regions.data.map((element) => ({
        label: element.name,
        value: element.id,
      }));
      setRegionDropDownData(newArr);
    },
    onError() {
      setOpened(false);
      showNotification({
        color: "red",
        title: "Error",
        message: "Something went wrong while fetching regions!",
      });
    },
  });

  // Fetch Unassigned Drivers
  const { loading: driver_loading } = useQuery(GET_UNASSIGNED_DRIVERS, {
    onCompleted(data) {
      const newArr = data.getUnAssignedDrivers.map((element) => ({
        label: element.name,
        value: element.id,
      }));
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

  // Mutation to Create Vehicle
  const [addVehicle, { loading }] = useMutation(CREATE_VEHICLE, {
    refetchQueries: [{ query: GET_UNASSIGNED_DRIVERS }],
    awaitRefetchQueries: true,
    update(cache, { data: { createVehicle } }) {
      try {
        const { vehicles } = cache.readQuery({
          query: GET_VEHICLES,
          variables: {
            first: 10,
            page: activePage,
            ordered_by: [
              {
                 column:"CREATED_AT",
                 order:"DESC"
              }]
          },
        }) || { vehicles: { data: [], paginatorInfo: { total: 0 } } };
  
        const updatedVehicle = [createVehicle, ...vehicles.data];
        cache.writeQuery({
          query: GET_VEHICLES,
          variables: {
            first: 10,
            page: activePage,
            ordered_by: [
              {
                 column:"CREATED_AT",
                 order:"DESC"
              }]
          },
          data: {
            vehicles: {
              ...vehicles,
              data: updatedVehicle,
              paginatorInfo: {
                ...vehicles.paginatorInfo,
                total: vehicles.paginatorInfo.total + 1,
              },
            },
          },
        });
  
        // Update the total count and reset the active page
        const newTotal = vehicles.paginatorInfo.total + 1;
        setTotal(newTotal);
        setActivePage(1);
      } catch (err) {
        console.error("Error updating cache:", err);
      }
    },
    onCompleted(data) {
      if (data.createVehicle) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Vehicle Created Successfully",
        });
        setOpened(false);
      }
    },
    onError(error) {
      const errorMessage =
        error?.message || "Something went wrong while creating the vehicle";

      setOpened(true);
      showNotification({
        color: "red",
        title: "Error",
        message: errorMessage,
      });
    },
  });

  // Submit Method
  const submit = () => {
    addVehicle({
      variables: {
        model: form.getInputProps("model").value,
        plate_number: form.getInputProps("plate_number").value,
        color: form.getInputProps("color").value,
        owner_name: form.getInputProps("owner_name").value,
        owner_phone: form.getInputProps("owner_phone").value,
        driver: form.getInputProps("driver").value,
        region: form.getInputProps("region").value,
        vehicle_type: form.getInputProps("vehicle_type").value,
      },
    });
  };

  const setVehicleTypeDropDownValue = (val) => {
    form.setFieldValue("vehicle_type.connect", val);
  };

  const setDriverDropDownValue = (val) => {
    form.setFieldValue("driver.connect", val);
  };
  
  const setRegionDropDownValue = (val) => {
    form.setFieldValue("region.connect", val);
  };

  return (
    <>
      <LoadingOverlay
        visible={loading || driver_loading || region_loading || vehicle_type_loading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <form onSubmit={form.onSubmit(() => submit())}>
        <Stack>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                placeholder="Model"
                label="Model"
                {...form.getInputProps("model")}
                withAsterisk
              />
              <TextInput
                placeholder="Owner Phone"
                label="Owner Phone"
                {...form.getInputProps("owner_phone")}
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
              <Select
                searchable
                label="Select Vehicle Type"
                placeholder="Pick one"
                data={vehicleTypeDropDownData}
                value={form.getInputProps("vehicle_type.connect").value.toString()}
                onChange={setVehicleTypeDropDownValue}
              />
              <Select
                label="Select Driver"
                searchable
                placeholder="Pick one"
                data={driverDropDownData}
                value={form.getInputProps("driver.connect").value.toString()}
                onChange={setDriverDropDownValue}
              />
              <Select
                label="Select Region"
                searchable
                placeholder="Pick one"
                data={regionDropDownData}
                value={form.getInputProps("region.connect").value.toString()}
                onChange={setRegionDropDownValue}
              />
            </Grid.Col>
          </Grid>
          <Grid>
            <Grid.Col span={12}>
              <Button
                type="submit"
                style={{
                  marginTop: "20px",
                  width: "20%",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
                fullWidth
                color="blue"
              >
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
