import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  PasswordInput,
  ScrollArea,
  TextInput,
  Stack,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import { useState } from "react";
import { API } from "utiles/url";

export const SalesAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
  fetchData,
}) => {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const { height } = useViewportSize();

  const submit = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post(
        `${API}/sales`,
        {
          name: form.getInputProps("name").value,
          phone: form.getInputProps("phone").value,
          email: form.getInputProps("email").value,
          password: form.getInputProps("password").value,
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
        setOpened(false);
      }
    } catch (error) {
      setLoading(false);
      showNotification({
        color: "red",
        title: "Error",
        message: error?.response?.data?.errors?.email
          ? error.response.data.errors.email[0]
          : "Sales Not Created!",
      });
    }
  };

  return (
    <>
      <LoadingOverlay
        visible={loading}
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
                  type="number"
                  placeholder="Phone"
                  {...form.getInputProps("phone")}
                />
                <PasswordInput
                  placeholder="Password"
                  label="Password"
                  {...form.getInputProps("password")}
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
