import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  LoadingOverlay,
} from "@mantine/core";
import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { customLoader } from "components/utilities/loader";
import {UPDATE_SUPPLIER } from "apollo/mutuations";
import { useEffect } from "react";

const SupplierEditModal = ({supplier, setOpenedEdit }) => {
  const form = useForm({});

  const [updateRetailer, { loading: supplierLoading }] =
    useMutation(UPDATE_SUPPLIER);

  useEffect(() => {
    if (supplier) {
      form.setValues({
        name: supplier.user.name,
        phone: supplier.user.phone,
        address: supplier.address,
        city: supplier.city,
        email: supplier.user.email,
      });
    }
  }, [supplier]);

  const { height } = useViewportSize();

  const submit = () => {
    updateRetailer({
      variables: {
        id: supplier.id,
        name: form.values.name,
        address: form.values.address,
        phone: form.values.phone,
        city: form.values.city,
        email: form.values.email,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Supplier Updated Successfully",
        });

        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Supplier Not Updated Successfully",
        });
      },
    });
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
                <TextInput
                  required
                  label="Address"
                  placeholder="Address"
                  {...form.getInputProps("address")}
                />
                <TextInput
                  required
                  label="City"
                  placeholder="City"
                  {...form.getInputProps("city")}
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

export default SupplierEditModal;
