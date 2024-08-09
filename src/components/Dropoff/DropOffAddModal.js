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
  MultiSelect,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { CREATE_DRIVER, CREATE_DROP_OFF } from "apollo/mutuations";
import {
  GET_DISTRIBUTORS,
  GET_DRIVERS,
  GET_DROPOFFS,
  GET_ORDERS,
  GET_ORDERS_BY_DROPOFF_STATUS,
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
  const [distributorsDropDownData, setDistributorsDropDownData] = useState([]);
  const [ordersDropDownData, setOrdersDropDownData] = useState([]);
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
        ids: [],
      },
    },
    validate: (values) => {
      const errors = {
        orders:
          values.orders.ids.length === 0
            ? "Please select at least one order"
            : null,
      };
      return errors;
    },
  });

  // mutation
  const [addDropOff, { loading: dropOffLoading }] = useMutation(
    CREATE_DROP_OFF,
    {
      update(cache, { data: { createDropoff } }) {
        // Read the existing data from the cache
        const { dropoffs } = cache.readQuery({
          query: GET_DROPOFFS,
          variables: {
            first: 10,
            page: 1,
          },
        });
        if (!dropoffs) {
          return;
        }
        const updatedDropoffs = [createDropoff, ...dropoffs.data];

        cache.writeQuery({
          query: GET_DROPOFFS,
          variables: {
            first: 10,
            page: 1,
          },
          data: {
            dropoffs: {
              ...dropoffs,
              data: updatedDropoffs,
            },
          },
        });

        const newTotal = dropoffs.paginatorInfo.total + 1;
        setTotal(newTotal);
        setActivePage(1);
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

  // graphql queries
  const { loading: ordersLoading } = useQuery(GET_ORDERS_BY_DROPOFF_STATUS, {
    variables: {
     status: "pending"
    },
    onCompleted(data) {
      console.log(data)
      let orders = data.getOrdersByDropOffStatus;
      let ordersArray = [];

      // loop over regions data to structure the data for the use of drop down
      orders?.forEach((order, index) => {
        ordersArray.push({
          label: order?.id,
          value: order?.id,
        });
      });

      // put it on the state
      setOrdersDropDownData([...ordersArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });
  // graphql queries
  const { loading: distributorsLoading } = useQuery(GET_DISTRIBUTORS, {
    variables: {
      first: 100000,
      page: 1,
    },
    onCompleted(data) {
      let distributors = data.distributors;
      let distributorsArray = [];

      // loop over regions data to structure the data for the use of drop down
      distributors.data.forEach((distributor, index) => {
        distributorsArray.push({
          label: distributor?.name,
          value: distributor?.id,
        });
      });

      // put it on the state
      setDistributorsDropDownData([...distributorsArray]);
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
        vehicleType: form.getInputProps("vehicle_type").value,
        orders: form.getInputProps("orders").value, // Pass selected order IDs
        from: form.getInputProps("from").value,
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
        let errorMessage = "DropOff Not Created!";
        if (error && error.message) {
          errorMessage = error.message;
        }
        setOpened(false);
        showNotification({
          color: "red",
          title: "Error",
          message: errorMessage,
        });
      },
    });
    // e.preventDefault();
  };

  // set the selected value to the form state
  const setVehicleTypeDropDownValue = (val) => {
    form.setFieldValue("vehicle_type.connect", val);
  };
  const setDistributorDropDownValue = (val) => {
    form.setFieldValue("from.connect.id", val);
  };
  const setOrdersDropDownValue = (values) => {
    console.log(values);
    const selectedOrderIds = values.map((order) => order);
    form.setFieldValue("orders.ids", selectedOrderIds);
  };

  return (
    <>
      <LoadingOverlay
        visible={vehicleTypesLoading || dropOffLoading || distributorsLoading}
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
                  searchable
                  value={form
                    .getInputProps("vehicle_type.connect")
                    ?.value.toString()}
                  onChange={setVehicleTypeDropDownValue}
                  label="Vehicle_Type"
                  placeholder="Pick a Vehicle Type belongs to"
                />
                <Select
                  data={distributorsDropDownData}
                  searchable
                  value={form
                    .getInputProps("from.connect.id")
                    ?.value.toString()}
                  onChange={setDistributorDropDownValue}
                  label="Distributor"
                  placeholder="Pick a Distributor belongs to"
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <MultiSelect
                searchable
                  data={ordersDropDownData}
                  value={form.getInputProps("orders")?.value}
                  onChange={setOrdersDropDownValue}
                  clearable
                  label="Orders"
                  placeholder="Pick one or more Orders"
                  nothingFoundMessage="Nothing found..."
                />
                {form.errors.orders && (
                  <div style={{ color: "red" }}>{form.errors.orders}</div>
                )}
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
