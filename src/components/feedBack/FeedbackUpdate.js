import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  LoadingOverlay,
  PasswordInput,
  ScrollArea,
  TextInput,
  Stack,
  Checkbox,
  FileInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import { useEffect, useState } from "react";
import { API } from "utiles/url";

export const FeedbackUpdate = ({
  setOpened,
item,
  fetchData,
}) => {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      name: "",
      status: "",
    },
  });
 useEffect(() => {
    form.setValues({
      name: item?.name,
    });
  }, [item]);
  const { height } = useViewportSize();

  const submit = async () => {
    console.log("y")
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      console.log(form.getInputProps("name").value)
      const { data } = await axios.put(
        `${API}/feedback-types/${item.id}`,

        {name:form.getInputProps("name").value},

        config
      );
      if (data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Feedback-types Updated Successfully",
        });
        setLoading(false);
        fetchData();
        setOpened(false);
      }
    } catch (error) {
        console.log(error)
      setLoading(false);
      showNotification({
        color: "red",
        title: "Error",
        message: "Feedback-types Not Updated!",
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
              </Grid.Col>
            </Grid>

            <Grid>
              <Grid.Col span={6}>
                <Button
                  style={{
                    width: "40%",
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
