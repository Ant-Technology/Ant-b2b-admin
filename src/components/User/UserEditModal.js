import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  ScrollArea,
  Stack,
  TextInput,
  Select,
  LoadingOverlay,
  Badge,
  ActionIcon,
  Tabs,
  SimpleGrid,
  Text,
  Grid,
  Card,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconX } from "@tabler/icons-react";
import { useQuery, useMutation } from "@apollo/client";
import { showNotification } from "@mantine/notifications";
import { Box } from "@mui/material";
import { ATTACH_ROLE, DETTACH_ROLE, UPDATE_USER } from "apollo/mutuations";
import { GET_ROLES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { useViewportSize } from "@mantine/hooks";

const UserEditModal = ({ setOpenedEdit, editId, data }) => {
  const [roles, setRoles] = useState([]);
  const [currentRoles, setCurrentRoles] = useState([]);
  const [initialProfileImage, setInitialProfileImage] = useState(null);
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState("generalInfo"); // Track active tab

  useEffect(() => {
    const userData = data.find((user) => user.id === editId);
    console.log(userData)

    if (userData) {
      form.setValues({
        name: userData.name,
        email: userData.email,
        phone:userData.phone
      });
      setCurrentRoles(userData.roles);
      if (userData.profile_image) {
        setInitialProfileImage(userData.profile_image);
      }
    }
  }, [editId, data]);

  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      phone:""
    },
  });
  const { loading: rolesListLoading } = useQuery(GET_ROLES, {
    onCompleted(data) {
      const rolesArray = data.roles.map((role) => ({
        label: role.name,
        value: role.name,
      }));
      setRoles(rolesArray);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  const { height } = useViewportSize();

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <img
        key={index}
        src={imageUrl}
        alt=""
        width="130"
        onLoad={() => URL.revokeObjectURL(imageUrl)}
      />
    );
  });

  if (initialProfileImage && files.length === 0) {
    previews.unshift(
      <img key="initial" src={initialProfileImage} alt="Profile" width="130" />
    );
  }

  const removeButton = (val) => (
    <ActionIcon size="xs" color="blue" radius="xl" variant="transparent">
      <IconX size={10} onClick={() => dettachRoleReq(val)} />
    </ActionIcon>
  );

  const [attach] = useMutation(ATTACH_ROLE);
  const [dettach] = useMutation(DETTACH_ROLE);

  const setRoleDropDownValue = (val) => {
    attach({
      variables: {
        user_id: editId,
        role: val.toUpperCase(),
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Role attached!",
        });
        setCurrentRoles(data.attachRole.roles);
      },
      onError() {
        showNotification({
          color: "red",
          title: "Error",
          message: "Failed to attach role!",
        });
      },
    });
  };

  const dettachRoleReq = (val) => {
    dettach({
      variables: {
        user_id: editId,
        role: val.toUpperCase(),
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "Role detached!",
        });
        setCurrentRoles(data.detachRole.roles);
      },
      onError() {
        showNotification({
          color: "red",
          title: "Error",
          message: "Failed to detach role!",
        });
      },
    });
  };

  const [editUser] = useMutation(UPDATE_USER);

  const submit = () => {
    const variables = {
      id: editId,
      name: form.getInputProps("name").value,
      password: form.getInputProps("password").value,
      phone:form.getInputProps("phone").value,
      password_confirmation: form.getInputProps("password_confirmation").value,
    };
    if (files.length > 0) {
      variables.profile_image = files[files.length - 1];
    }
    editUser({
      variables,
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "User Updated Successfully",
        });

        setOpenedEdit(false);
      },
      onError(error) {
        setOpenedEdit(true);
        showNotification({
          color: "red",
          title: "Error",
          message: "User Not Updated!",
        });
      },
    });
  };


  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  const availableRoles = roles.filter(
    (role) =>
      !currentRoles.some((currentRole) => currentRole.name === role.value)
  );

  return (
    <>
      <LoadingOverlay visible={rolesListLoading} overlayBlur={2} />
      <ScrollArea style={{ height: height / 1.1 }} type="auto" offsetScrollbars>
        <Tabs value={activeTab} onTabChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="generalInfo">General Info</Tabs.Tab>
            <Tabs.Tab value="manageRoles">Manage Roles</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="generalInfo" pt="xs">
            <Stack>
              <TextInput
                required
                label="Name"
                placeholder="Name"
                {...form.getInputProps("name")}
              />
              <TextInput
                label="Email"
                placeholder="Email"
                type="email"
                disabled
                {...form.getInputProps("email")}
              />
                 <TextInput
                required
                label="Phone"
                placeholder="Phone"
                {...form.getInputProps("phone")}
              />
                 <Card>
                <Text fz="xs">Change Password</Text>

                <PasswordInput
                  mt="md"
                  placeholder="Password"
                  {...form.getInputProps("password")}
                />

                <PasswordInput
                  mt="md"
                  placeholder="Password Confirmation"
                  {...form.getInputProps("password_confirmation")}
                />
              </Card>
              <Flex align="center" gap="md">
                <Button
                  onClick={() => document.getElementById("fileInput").click()}
                >
                  Upload Image
                </Button>
                <input
                  type="file"
                  id="fileInput"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <SimpleGrid>{previews}</SimpleGrid>
              </Flex>
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="manageRoles" pt="xs">
            <Text size="sm">Current Roles:</Text>
            <Flex gap="md" wrap="wrap" mt="sm">
              {currentRoles.map((role, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  rightSection={removeButton(role.name)}
                >
                  {role.name}
                </Badge>
              ))}
            </Flex>
            <Select
              searchable
              data={availableRoles}
              label="Attach Role"
              placeholder="Pick a role"
              onChange={setRoleDropDownValue}
            />
          </Tabs.Panel>
        </Tabs>

        {activeTab === "generalInfo" && (
                  <Grid>
                  <Grid.Col span={12}>
                    <Button
                    onClick={form.onSubmit(submit)}
                       style={{
                        marginTop: "20px",
                        width: "30%",
  
                        backgroundColor: "#FF6A00",
                        color: "#FFFFFF",
                      }}
                      fullWidth
                      type="submit"
                      color="blue"
                    >
                      Submit
                    </Button>
                  </Grid.Col>
                </Grid>
        )}
      </ScrollArea>
    </>
  );
};

export default UserEditModal;
