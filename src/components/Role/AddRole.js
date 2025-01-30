import {
  Button,
  Grid,
  LoadingOverlay,
  ScrollArea,
  TextInput,
  Stack,
  Checkbox,
  Accordion,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import { useState, useEffect } from "react";
import { API } from "utiles/url";

export const RoleAddModal = ({ setOpened, fetchData }) => {
  const [loading, setLoading] = useState(false);
  const [checkedPermissions, setCheckedPermissions] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [allPermissions, setAllPermissions] = useState({});
  const form = useForm({
    initialValues: {
      name: "",
      permissions: [],
    },
  });

  useEffect(() => {
    fetchDataPermissions();
  }, []);

  const { height } = useViewportSize();

  const fetchDataPermissions = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(`${API}/permissions`, config);
      if (response.data) {
        setAllPermissions(response.data.permissions);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
    }
  };

  const submit = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    
      const newRole = {
        name: form.getInputProps("name").value,
        permissions: checkedPermissions,
      };
      const { data } = await axios.post(`${API}/roles`, newRole, config);
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
        message: error?.response?.data?.message || "Role Not Created!",
      });
    }
  };

  const handleToggleAll = () => {
    if (isAllChecked) {
      setCheckedPermissions([]);
      form.setFieldValue("permissions", []);
    } else {
      const allPerms = Object.values(allPermissions)
        .flat()
        .map((p) => p.name);
      setCheckedPermissions(allPerms);
      form.setFieldValue("permissions", allPerms);
    }
    setIsAllChecked(!isAllChecked);
  };

  useEffect(() => {
    const allPerms = Object.values(allPermissions)
      .flat()
      .map((p) => p.name);
    setIsAllChecked(
      allPerms.length > 0 && checkedPermissions.length === allPerms.length
    );
  }, [checkedPermissions]);

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
            <Grid gutter="md">
              {Object.entries(allPermissions).map(
                ([group, permissions], index) => (
                  <Grid.Col span={3} key={group}>
                    <Accordion variant="contained" multiple>
                      <Accordion.Item value={group}>
                        <Accordion.Control>{group}</Accordion.Control>
                        <Accordion.Panel>
                          <Checkbox.Group
                            value={checkedPermissions}
                            onChange={(value) => {
                              setCheckedPermissions(value);
                              form.setFieldValue("permissions", value);
                            }}
                          >
                            <Grid>
                              {permissions.map((perm) => (
                                <Grid.Col span={12} key={perm.name}>
                                  <Checkbox
                                    value={perm.name}
                                    label={perm.display_name}
                                  />
                                </Grid.Col>
                              ))}
                            </Grid>
                          </Checkbox.Group>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </Grid.Col>
                )
              )}
            </Grid>

            <Button
              onClick={handleToggleAll}
              style={{
                width: "8%",
                marginTop: "15px",
                backgroundColor: "#FF6A00",
                color: "#FFFFFF",
              }}
              fullWidth
            >
              {isAllChecked ? "Uncheck All" : "Check All"}
            </Button>

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
