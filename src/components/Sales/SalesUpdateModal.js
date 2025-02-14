import { useMutation } from "@apollo/client";
import {
  Button,
  FileInput,
  Grid,
  LoadingOverlay,
  PasswordInput,
  ScrollArea,
  Stack,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { UPDATE_DRIVER } from "apollo/mutuations";
import axios from "axios";
import { customLoader } from "components/utilities/loader";
import React, { useEffect, useState } from "react";
import { API } from "utiles/url";

export const SalesEditModal = ({
  activePage,
  fetchData,
  editRow,
  setOpenedEdit,
}) => {
  // Define form with initial values
  const form = useForm({
    initialValues: {
      name: "",
      phone: "",
      email: "",
      city: "",
      subcity: "",
      address: "",
      house_number: "",
      woreda: "",
      region: "",
      password: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [updateDriver, { loading: driverLoading }] = useMutation(UPDATE_DRIVER);
  const { height } = useViewportSize();

  // Populate form when editRow changes
  useEffect(() => {
    if (editRow) {
      form.setValues({
        name: editRow.name || "",
        phone: editRow.phone || "",
        email: editRow.email || "",
        city: editRow.city || "",
        subcity: editRow.subcity || "",
        address: editRow.address || "",
        house_number: editRow.house_number || "",
        woreda: editRow.woreda || "",
        region: editRow.region || "",
      });
    }
  }, [editRow]); 

  // Debugging - Log form values on change
  useEffect(() => {
    console.log("Form values updated:", form.values);
  }, [form.values]);

  const submit = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem("auth_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      };
      const formData = new FormData();

      if (file) {
        formData.append("profile_image", file);
      }
      Object.entries(form.values).forEach(([key, value]) => {
        formData.append(key, value);
      });

      formData.append("status", 1);
      formData.append("_method", "PATCH");

      const { data } = await axios.post(
        `${API}/sales/${editRow.id}`,
        formData,
        config
      );

      if (data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Sales Updated Successfully",
        });
        fetchData(activePage);
        setOpenedEdit(false);
      }
    } catch (error) {
      showNotification({
        color: "red",
        title: "Error",
        message: error?.response?.data?.errors?.email
          ? error.response.data.errors
          : "Sales Not Updated!",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (newFile) => {
    setFile(newFile);
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
        <form onSubmit={form.onSubmit(submit)}>
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
                <TextInput
                  required
                  label="Phone"
                  placeholder="Phone"
                  {...form.getInputProps("phone")}
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
                  label="Address"
                  placeholder="Address"
                  {...form.getInputProps("address")}
                />
                <TextInput
                  placeholder="Region"
                  label="Region"
                  {...form.getInputProps("region")}
                />
                <TextInput
                  required
                  label="City"
                  placeholder="City"
                  {...form.getInputProps("city")}
                />
                <TextInput
                  placeholder="SubCity"
                  label="Sub City"
                  {...form.getInputProps("subcity")}
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="Woreda"
                  placeholder="Woreda"
                  {...form.getInputProps("woreda")}
                />
                <FileInput
                  label="Upload Photo"
                  placeholder="Upload Photo"
                  value={file}
                  accept="image/png,image/jpeg"
                  onChange={handleFileChange}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <TextInput
                  required
                  label="House Number"
                  placeholder="House Number"
                  {...form.getInputProps("house_number")}
                />
              </Grid.Col>
            </Grid>
            <Grid>
              <Grid.Col span={6}>
                {file ? (
                  <img
                    src={URL.createObjectURL(file)}
                    width="130"
                    alt=""
                    onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                  />
                ) : (
                  editRow?.profile_image && (
                    <img
                      src={editRow.profile_image}
                      width="130"
                      alt=""
                    />
                  )
                )}
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
