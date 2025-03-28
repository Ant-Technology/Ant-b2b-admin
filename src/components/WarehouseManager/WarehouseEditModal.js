import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  LoadingOverlay,
  Select,
} from "@mantine/core";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { customLoader } from "components/utilities/loader";
import { UPDATE_Manager, UPDATE_SUPPLIER } from "apollo/mutuations";
import { useEffect } from "react";
import { GET_MY_WARE_HOUSES } from "apollo/queries";

const WarehouseManagerEditModal = ({ manager, setOpenedEdit }) => {
  const form = useForm({});
  const [warehouses, setWarehouses] = useState([]);

  const [updateManager, { loading: supplierLoading }] =
    useMutation(UPDATE_Manager);
  console.log(manager);

  useEffect(() => {
    if (manager) {
      form.setValues({
        name: manager.user.name,
        phone: manager.user.phone,
        email: manager.user.email,
        warehouse_id: manager?.warehouse.id,
      });
    }
  }, [manager]);

  const { height } = useViewportSize();
  const { loading: managerLoading } = useQuery(GET_MY_WARE_HOUSES, {
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
  const submit = () => {
    updateManager({
      variables: {
        id: manager.id,
        name: form.values.name,
        phone: form.values.phone,
        email: form.values.email,
        warehouse_id: form.values.warehouse_id,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Manager Updated Successfully",
        });

        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Manager Not Updated Successfully",
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
        visible={supplierLoading}
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
                  searchable
                  data={warehouses}
                  value={form.getInputProps("warehouse_id").value?.toString()}
                  onChange={handleWarehouseChange}
                  label="Warhouse"
                  placeholder="Pick a warhouse this belongs to"
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

export default WarehouseManagerEditModal;
