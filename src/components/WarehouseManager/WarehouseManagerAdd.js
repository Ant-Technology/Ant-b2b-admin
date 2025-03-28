import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Select,
  LoadingOverlay,
  PasswordInput,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { CREATE_SUPPLIER, CREATE_WAREHOUSE_MANAGER } from "apollo/mutuations";
import {
  GET_MY_WARE_HOUSES,
  GET_SUPPLIERS,
  GET_WARE_HOUSE_MANAGERS,
} from "apollo/queries";
import { customLoader } from "components/utilities/loader";

const WarehouseManagerAddModal = ({ setOpened, size, activePage }) => {
  const [warehouses, setWarehouses] = useState([]);

  const form = useForm({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      password: "",
      address: "",
      city: "",
      password_confirmation: "",
      warehouse_id: "1",
    },

    validate: {
      password_confirmation: (value, values) => {
        if (value !== values.password) {
          return "Passwords do not match!";
        }
        return null; // No error
      },
    },
  });
  const { loading: supplierLoading } = useQuery(GET_MY_WARE_HOUSES, {
    variables: {
      first: parseInt(1000),
      page: 1,
    },

    onCompleted(data) {
      const arr = data.myWarehouses.data.map((item) => ({
        label: item.name,
        value: item.id,
      }));

      setWarehouses(arr);
    },
  });
  // mutation
  const [addWarhouseManager, { loading: warehouseManagerLoading }] =
    useMutation(CREATE_WAREHOUSE_MANAGER, {
      update(cache, { data: { createWarehouseManager } }) {
        cache.updateQuery(
          {
            query: GET_WARE_HOUSE_MANAGERS,
            variables: {
              first: parseInt(size),
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
              warehouseManagers: {
                ...data.warehouseManagers,
                data: [createWarehouseManager, ...data.warehouseManagers.data],
              },
            };
          }
        );
      },
    });

  const { height } = useViewportSize();
  const submit = () => {
    if (form.validate().hasErrors) {
      return;
    }
    addWarhouseManager({
      variables: {
        name: form.getInputProps("name").value,
        phone: form.getInputProps("phone").value,
        email: form.getInputProps("email").value,
        //  city: form.getInputProps("city").value,
        //  address: form.getInputProps("address").value,
        password: form.getInputProps("password").value,
        password_confirmation: form.getInputProps("password_confirmation")
          .value,
        warehouse_id: form.getInputProps("warehouse_id").value,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Warhouse Manager Created Successfully",
        });
        setOpened(false);
      },
      onError(error) {
        let errorMessage = "Warhouse Manager Not Created Successfully!";
        if (error?.graphQLErrors?.length) {
          const graphQLError = error.graphQLErrors[0];
          const debugMessage = graphQLError?.debugMessage || "";
          const validationErrors = graphQLError?.extensions?.validation;

          if (validationErrors) {
            errorMessage = Object.values(validationErrors).flat().join(", ");
          } else {
            errorMessage = debugMessage || errorMessage;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        showNotification({
          color: "red",
          title: "Error",
          message: errorMessage,
        });
      },
    });
  };
  const handleWarehouseChange = (val) => {
    form.setFieldValue("warehouse_id", val);
  };
  return (
    <>
      <LoadingOverlay
        visible={warehouseManagerLoading}
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
                  required
                  label="Name"
                  placeholder="Name"
                  {...form.getInputProps("name")}
                />
                <Select
                  required
                  searchable
                  data={warehouses}
                  value={form.getInputProps("warehouse_id").value.toString()}
                  onChange={handleWarehouseChange}
                  label="Warhouse"
                  placeholder="Pick a warhouse this belongs to"
                />
                <PasswordInput
                  placeholder="Password"
                  label="Password"
                  {...form.getInputProps("password")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Contact Email"
                  placeholder="Email"
                  {...form.getInputProps("email")}
                />
                <TextInput
                  required
                  label="Contact Phone"
                  placeholder="Phone"
                  {...form.getInputProps("phone")}
                />

                <PasswordInput
                  placeholder="Confirm Password"
                  label="Confirm Password"
                  error={form.errors.password_confirmation}
                  {...form.getInputProps("password_confirmation")}
                />
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={4}>
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

export default WarehouseManagerAddModal;
