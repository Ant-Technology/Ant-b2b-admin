import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
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
import React, { useRef, useState, useMemo } from "react";

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

  const [vehicleTypeDropDownData, setVehicleTypeDropDownData] = useState([]);
  const [driverDropDownData, setDriverDropDownData] = useState([]);
  const [regionDropDownData, setRegionDropDownData] = useState([]);

  const { loading: vehicle_type_loading } = useQuery(GET_VEHICLE_TYPES, {
    variables: { first: 100 },
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

  const { loading: region_loading } = useQuery(GET_REGIONS, {
    variables: { first: 100, page: 1 },
    onCompleted(data) {
      const newArr = data.regions.data.map((element) => ({
        label: element.name,
        value: element.id,
      }));
      setRegionDropDownData(newArr);
    },
    onError() {
      showNotification({
        color: "red",
        title: "Error",
        message: "Something went wrong while fetching regions!",
      });
    },
  });

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

  const [addVehicle, { loading }] = useMutation(CREATE_VEHICLE, {
    refetchQueries: [{ query: GET_UNASSIGNED_DRIVERS }],
    awaitRefetchQueries: true,
    update(cache, { data: { createVehicle } }) {
      cache.updateQuery(
        {
          query: GET_VEHICLES,
          variables: {
            first: parseInt(10),
            page: activePage,
            search: "",
            ordered_by: [
              {
                column: "CREATED_AT",
                order: "DESC",
              },
            ],
          },
        },
        (data) => {
          return {
            vehicles: {
              ...data.vehicles,
              data: [createVehicle, ...data.vehicles.data],
            },
          };
        }
      );
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
        plate_doc: files.plate[0],
        license_doc: files.license[0],
        libre_doc: files.libre[0],
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

  const [files, setFiles] = useState({
    plate: [],
    license: [],
    libre: [],
  });

  const fileInputRefs = {
    plate: useRef(null),
    license: useRef(null),
    libre: useRef(null),
  };

  const handleFileChange = (event, fileType) => {
    setFiles((prevFiles) => ({
      ...prevFiles,
      [fileType]: Array.from(event.target.files),
    }));
  };

  const FilePreview = ({ fileList }) => {
    const previews = useMemo(() => {
      return fileList.map((file, index) => {
        const fileUrl = URL.createObjectURL(file);

        return (
          <div key={index} style={{ margin: "0 auto" }}>
            {file.type === "application/pdf" ? (
              <embed
                src={fileUrl}
                width="130"
                height="160"
                type="application/pdf"
                onLoad={() => URL.revokeObjectURL(fileUrl)}
              />
            ) : (
              <img
                src={fileUrl}
                alt=""
                width="130"
                onLoad={() => URL.revokeObjectURL(fileUrl)}
              />
            )}
          </div>
        );
      });
    }, [fileList]);

    return (
      <SimpleGrid
        cols={3}
        spacing="md"
        style={{ maxHeight: "200px", overflowY: "auto" }} // Added fixed height and scroll
      >
        {previews}
      </SimpleGrid>
    );
  };

  const { height } = useViewportSize();

  return (
    <>
      <LoadingOverlay
        visible={
          loading || driver_loading || region_loading || vehicle_type_loading
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
                  value={form
                    .getInputProps("vehicle_type.connect")
                    .value.toString()}
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
          </Stack>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Upload Plate */}
            <div style={{ flex: "1 1 5%", margin: "5px" }}>
              <Button
                onClick={() => fileInputRefs.plate.current.click()}
                style={{
                  width: "70%",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
              >
                Upload Plate
              </Button>
              <input
                type="file"
                ref={fileInputRefs.plate}
                accept="image/*,.pdf"
                style={{ display: "none" }}
                onChange={(event) => handleFileChange(event, "plate")}
              />
              <FilePreview fileList={files.plate} />
            </div>

            {/* Upload License */}
            <div style={{ flex: "1 1 5%", margin: "5px" }}>
              <Button
                onClick={() => fileInputRefs.license.current.click()}
                style={{
                  width: "70%",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
              >
                Upload License
              </Button>
              <input
                type="file"
                ref={fileInputRefs.license}
                accept="image/*,.pdf"
                style={{ display: "none" }}
                onChange={(event) => handleFileChange(event, "license")}
              />
              <FilePreview fileList={files.license} />
            </div>

            {/* Upload Libre */}
            <div style={{ flex: "1 1 5%", margin: "5px" }}>
              <Button
                onClick={() => fileInputRefs.libre.current.click()}
                style={{
                  width: "70%",
                  backgroundColor: "#FF6A00",
                  color: "#FFFFFF",
                }}
              >
                Upload Libre
              </Button>
              <input
                type="file"
                ref={fileInputRefs.libre}
                accept="image/*,.pdf"
                style={{ display: "none" }}
                onChange={(event) => handleFileChange(event, "libre")}
              />
              <FilePreview fileList={files.libre} />
            </div>
          </div>
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
        </form>
      </ScrollArea>
    </>
  );
};

export default VehicleAddModal;
