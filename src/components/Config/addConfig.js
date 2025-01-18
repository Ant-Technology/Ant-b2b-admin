import {
  TextInput,
  Grid,
  Stack,
  ScrollArea,
  Button,
  Select,
  LoadingOverlay,
} from "@mantine/core";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { CREATE_STOCK } from "apollo/mutuations";
import { GET_PRODUCT_SKUS, GET_STOCKS, GET_WARE_HOUSES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { API } from "utiles/url";
import axios from "axios";

const AddConfig = ({
  setOpened,

  fetchData,
}) => {
  // form state
  const form = useForm({
    initialValues: {
      name: "",
      value: null,
    },
  });

  useEffect(() => {}, []);

  const { height } = useViewportSize();

  const submit = async () => {
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const configData = {
        name: form.getInputProps("name").value,
        value: form.getInputProps("value").value,
      };

      const { data } = await axios.post(
        `${API}/configs`,

        configData,
        config
      );
      if (data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Config Created Successfully",
        });
        fetchData();
        setOpened(false);
      }
    } catch (error) {
      showNotification({
        color: "red",
        title: "Error",
        message: "Config Not Created!",
      });
    }
  };

  return (
    <ScrollArea style={{ height: height / 1.8 }} type="auto" offsetScrollbars>
      <form onSubmit={form.onSubmit(() => submit())}>
        <Stack>
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                required
                type="text"
                label="Name"
                placeholder="Name"
                {...form.getInputProps("name")}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                required
                type="text"
                label="Value"
                placeholder="Value"
                {...form.getInputProps("value")}
              />
            </Grid.Col>
          </Grid>

          <Grid>
            <Grid.Col span={6}>
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
  );
};

export default AddConfig;
