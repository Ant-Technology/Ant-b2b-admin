import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  PasswordInput,
  ScrollArea,
  TextInput,
  Stack,
  Select,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { CREATE_DRIVER, CREATE_DROP_OFF } from "apollo/mutuations";
import {
  GET_DRIVERS,
  GET_DROPOFFS,
  GET_REGIONS,
  GET_VEHICLE_TYPES,
} from "apollo/queries";
import { customLoader } from "components/utilities/loader";
// import Map from "components/utilities/Map";
import { useState } from "react";

export const DropOffAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
  const [vehicleTypesDropDownData, setVehicleTypesDropDownData] = useState([]);
  const form = useForm({
    initialValues: {
      vehicle_type: {
        connect: "1",
      },
      from: {
        connect: {
          type: "DISTRIBUTOR",
          id: 1,
        },
      },
      orders: {
        ids: [3],
      },
    },
  });

  // mutation
  const [addDropOff, { loading: dropOffLoading }] = useMutation(
    CREATE_DROP_OFF,
    {
      update(cache, { data: { createDriver } }) {
        cache.updateQuery(
          {
            query: GET_DROPOFFS,
            variables: {
              first: 10,
              page: activePage,
            },
          },
          (data) => {
            if (data.drivers.data.length === 10) {
              setTotal(total + 1);
              setActivePage(total + 1);
            } else {
              return {
                drivers: {
                  data: [createDriver, ...data.dropoffs.data],
                },
              };
            }
          }
        );
      },
    }
  );

  // graphql queries
  const { loading: vehicleTypesLoading } = useQuery(GET_VEHICLE_TYPES, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let vehicleTypes = data.vehicleTypes;
      let vehicleTypesArray = [];

      // loop over regions data to structure the data for the use of drop down
      vehicleTypes.data.forEach((vehicle, index) => {
        vehicleTypesArray.push({
          label: vehicle?.title,
          value: vehicle?.id,
        });
      });

      // put it on the state
      setVehicleTypesDropDownData([...vehicleTypesArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  const { height } = useViewportSize();

  const submit = () => {
    addDropOff({
      variables: {
        region: form.getInputProps("region").value,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "DropOff Created Successfully",
        });

        setOpened(false);
      },
      onError(error) {
        setOpened(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "DropOff Not Created!",
        });
      },
    });
    // e.preventDefault();
  };

  // set the selected value to the form state
  const setVehicleTypeDropDownValue = (val) => {
    form.setFieldValue("vehicle_type.connect", val);
  };
  return (
    <>
      <LoadingOverlay
        visible={vehicleTypesLoading || dropOffLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />

      <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
        <form onSubmit={form.onSubmit(() => submit())}>
          <Stack>
            <Grid>
              <Grid.Col span={6}>
                <Select
                  data={vehicleTypesDropDownData}
                  value={form
                    .getInputProps("vehicle_type.connect")
                    ?.value.toString()}
                  onChange={setVehicleTypeDropDownValue}
                  label="Vehicle_Type"
                  placeholder="Pick a Vehicle Type belongs to"
                />
                <TextInput
                  required
                  label="Form"
                  placeholder="Form"
                  {...form.getInputProps("user.create.name")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Orders"
                  placeholder="Orders"
                  {...form.getInputProps("user.create.email")}
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
      </ScrollArea>
    </>
  );
};
