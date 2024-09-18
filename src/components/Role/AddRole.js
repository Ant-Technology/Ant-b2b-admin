import {
  Button,
  Grid,
  LoadingOverlay,
  ScrollArea,
  TextInput,
  Stack,
  Checkbox,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import { useState } from "react";
import { API,allPermissions } from "utiles/url";

export const RoleAddModal = ({ setOpened, fetchData }) => {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      name: "",
      permissions: [], // Array to store selected permissions
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
      const formData = new FormData();
      formData.append("name", form.getInputProps("name").value);

      // Append permissions array to formData
      formData.append(
        "permissions",
        JSON.stringify(form.getInputProps("permissions").value)
      );

      const { data } = await axios.post(`${API}/roles`, formData, config);
      if (data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Role Created Successfully",
        });
        setLoading(false);
        fetchData();
        setOpened(false);
      }
    } catch (error) {
      setLoading(false);
      showNotification({
        color: "red",
        title: "Error",
        message: error?.response?.data?.errors?.email
          ? error.response.data.errors.email[0]
          : "Role Not Created!",
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

            {/* Display Permissions in 4 columns */}
            <Grid>
              <Grid.Col span={12}>
                <Checkbox.Group
                  label="Permissions"
                  {...form.getInputProps("permissions", { type: "checkbox" })}
                >
                  <Grid>
                    {allPermissions.map((permission, index) => (
                      <Grid.Col span={3} key={permission}>
                        <Checkbox value={permission} label={permission} />
                      </Grid.Col>
                    ))}
                  </Grid>
                </Checkbox.Group>
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
