import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Checkbox,
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
    if(editRow.gender === 'Male'){
      setIsMaleChecked(true);
      form.setFieldValue("gender", "Male");
      setIsFemaleChecked(false);
    }
    else{
      setIsFemaleChecked(true);
      form.setFieldValue("gender", "Female");
      setIsMaleChecked(false)
    }
    form.setValues({
      name: editRow.name,
      phone: editRow.phone,
      email: editRow.email,
      city:editRow.city,
      subcity:editRow.subcity,
      address:editRow.address,
      house_number:editRow.house_number,
      region:editRow.region,

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
      const formData = new FormData();
      formData.append("profile_image", file);
      formData.append("name", form.values("name").value);
      formData.append("phone", form.values.phone)
      formData.append("email", form.values.email)
      formData.append("password", form.valuespassword)
      formData.append("address", form.values.address)
      formData.append("city", form.values.city);
      formData.append("subcity", form.values.subcity)
      formData.append("gender", form.values.gender);
      formData.append("woreda", form.values.woreda)
      formData.append("house_number", form.values.house_number)
      formData.append("region", form.values.region);
      formData.append("status", 1);
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
  const [isMaleChecked, setIsMaleChecked] = useState(false);
  const [isFemaleChecked, setIsFemaleChecked] = useState(false);

  const handleMaleChange = (event) => {
    setIsMaleChecked(event.target.checked);
    form.setFieldValue("gender", "Male");
    setIsFemaleChecked(false);
  };

  const handleFemaleChange = (event) => {
    form.setFieldValue("gender", "Female");
    setIsFemaleChecked(event.target.checked);
    setIsMaleChecked(false);
  };
  const [file, setFile] = useState(null);

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
                <TextInput
                  required
                  label="House Number"
                  placeholder="House Number"
                  {...form.getInputProps("house_number")}
                />
              </Grid.Col>
              <Grid.Col span={6}>
                <FileInput
                  label="Choose Photo"
                  placeholder="Upload files"
                  value={file}
                  onChange={handleFileChange}
                />
                <div style={{ display: "flex", marginTop: "25px" }}>
                  <Checkbox
                    checked={isMaleChecked}
                    onChange={handleMaleChange}
                    label="Male"
                  />
                  <Checkbox
                    style={{ marginLeft: "10px" }}
                    checked={isFemaleChecked}
                    onChange={handleFemaleChange}
                    label="Female"
                  />
                </div>
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
      </ScrollArea>{" "}
    </>
  );
};
