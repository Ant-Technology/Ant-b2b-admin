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
      address: "",
      gender: "",
      region: "",
      city: "",
      subcity: "",
      woreda: "",
      house_number: "",
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
      formData.append("profile_image", file);
      formData.append("name", form.getInputProps("name").value);
      formData.append("phone", form.getInputProps("phone").value);
      formData.append("email", form.getInputProps("email").value);
      formData.append("password", form.getInputProps("password").value);
      formData.append("address", form.getInputProps("address").value);
      formData.append("city", form.getInputProps("city").value);
      formData.append("subcity", form.getInputProps("subcity").value);
      formData.append("gender", form.getInputProps("gender").value);
      formData.append("woreda", form.getInputProps("woreda").value);
      formData.append("house_number", form.getInputProps("house_number").value);
      formData.append("region", form.getInputProps("region").value);
      formData.append("status", 1);

      const { data } = await axios.post(
        `${API}/sales`,

        formData,

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
  const imagePreview = () => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <img
        src={imageUrl}
        width="130"
        alt=""
        imageprops={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
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
              <Grid.Col span={6}>{file && imagePreview()}</Grid.Col>
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
