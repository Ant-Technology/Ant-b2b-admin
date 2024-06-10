import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  ScrollArea,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { UPDATE_DRIVER } from "apollo/mutuations";
import { GET_DRIVER } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import React, { useEffect } from "react";

export const DriverEditModal = ({
  activePage,
  fetchData,
  editRow,
  editId,
  setOpenedEdit,
}) => {
  const form = useForm({});
  const [updateDriver, { loading: driverLoading }] = useMutation(UPDATE_DRIVER);
  useEffect(() => {
    form.setValues({
      name: editRow?.name,
      phone: editRow?.phone,
      address: editRow?.address,
      city: editRow?.city,
    });
  }, [editRow]);

  const { height } = useViewportSize();

  const submit = () => {
    updateDriver({
      variables: {
        id: editRow.id,
        name: form.values.name,
        address: form.values.address,
        phone: form.values.phone,
        city: form.values.city,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Driver Updated Successfully",
        });
        fetchData(activePage);

        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "Driver Not Created Successfully",
        });
      },
    });
    // e.preventDefault();
  };

  return (
    <>
      <LoadingOverlay
        visible={editRow == null || driverLoading}
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
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="City"
                  placeholder="City"
                  {...form.getInputProps("city")}
                />
                <TextInput
                  required
                  label="Phone"
                  placeholder="Phone"
                  {...form.getInputProps("phone")}
                />
              </Grid.Col>
            </Grid>
            {/* user */}

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
