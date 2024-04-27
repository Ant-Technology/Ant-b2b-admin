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
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import React, { useEffect } from "react";
import { useState } from "react";
import { API } from "utiles/url";

export const SalesEditModal = ({
  activePage,
  fetchData,
  editRow,
  editId,
  setOpenedEdit,
}) => {
  const form = useForm({});
  const [loading, setLoading] = useState(false);

  const [updateDriver, { loading: driverLoading }] = useMutation(UPDATE_DRIVER);
  useEffect(() => {
    form.setValues({
      name: editRow.name,
      phone: editRow.phone,
      email: editRow.email,
    });
  }, [editRow]);

  const { height } = useViewportSize();

  const submit = async () => {
    fetchData(activePage);

    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.put(
        `${API}/sales/${editId}`,
        {
          name: form.values.name,
          email: form.values.email,
          phone: form.values.phone,
          status: 1,
        },
        config
      );
      if (data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Sales Created Successfully",
        });
        setLoading(false);
        fetchData(1);
        setOpenedEdit(false);
      }
    } catch (error) {
      setLoading(false);
      showNotification({
        color: "red",
        title: "Error",
        message: error?.response?.data?.errors?.email
          ? error.response.data.errors
          : "Sales Not Updated!",
      });
    }
  };

  return (
    <>
      <LoadingOverlay
        visible={editRow == null || loading}
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
                  label="Email"
                  placeholder="Email"
                  {...form.getInputProps("email")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Phone"
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
                    backgroundColor: "rgba(244, 151, 3, 0.8)",
                    color: "rgb(20, 61, 89)",
                  }}
                  type="submit"
                  variant="outline"
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
