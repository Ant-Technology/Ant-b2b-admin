import { useMutation, useQuery } from "@apollo/client";
import {
  Grid,
  LoadingOverlay,
  ScrollArea,
  Stack,
  TextInput,
  Button,
  Text,
  Group,
  SimpleGrid,
  useMantineTheme,
  Card,
  Flex,
  Badge,
  ActionIcon,
  Select,
  PasswordInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { Box } from "@mui/material";
import { IconX } from "@tabler/icons";
import { ATTACH_ROLE, DETTACH_ROLE, UPDATE_USER } from "apollo/mutuations";
import { GET_ROLES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { useEffect, useState } from "react";

const UserEditModal = ({ setOpenedEdit, editId, data }) => {
  const [roles, setRoles] = useState([]);
  const [currentRoles, setCurrentRoles] = useState([]);
  const [initialProfileImage, setInitialProfileImage] = useState(null); // State for initial profile image

  useEffect(() => {
    data.forEach((data) => {
      if (data.id === editId) {
        form.setValues({
          name: data.name,
          email: data.email,
        });
        setCurrentRoles(data.roles);
        if (data.profile_image) {
          setInitialProfileImage(data.profile_image); // Set initial profile image if exists
        }
      }
    });
    // eslint-disable-next-line
  }, []);

  // form state
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
    },
  });

  const [files, setFiles] = useState([]);

  const { loading: rolesListLoading } = useQuery(GET_ROLES, {
    onCompleted(data) {
      let roles = data.roles;
      let rolesArray = [];

      roles.forEach((role) => {
        rolesArray.push({
          label: role.name,
          value: role.name,
        });
      });

      setRoles([...rolesArray]);
    },
    onError(err) {
      showNotification({
        color: "red",
        title: "Error",
        message: `${err}`,
      });
    },
  });

  const theme = useMantineTheme();
  const { height } = useViewportSize();

  const previews = files.map((file, index) => {
    const imageUrl = URL.createObjectURL(file);
    return (
      <img
        key={index}
        src={imageUrl}
        alt=""
        width="130"
        imageProps={{ onLoad: () => URL.revokeObjectURL(imageUrl) }}
      />
    );
  });

  if (initialProfileImage && files.length === 0) {
    // Display the initial profile image if no new file is selected
    previews.unshift(
      <img key="initial" src={initialProfileImage} alt="Profile" width="130" />
    );
  }

  const removeButton = (val) => {
    return (
      <ActionIcon size="xs" color="blue" radius="xl" variant="transparent">
        <IconX size={10} onClick={() => dettachRoleReq(val)} />
      </ActionIcon>
    );
  };

  const [attach, { loading: aload }] = useMutation(ATTACH_ROLE);
  const [dettach, { loading: dload }] = useMutation(DETTACH_ROLE);

  const setRoleDropDownValue = (val) => {
    attach({
      variables: {
        user_id: editId,
        role: val.toUpperCase(),
      },
      onCompleted(data) {
        showNotification({
          color: "Green",
          title: "Success",
          message: "Role attached!",
        });

        setCurrentRoles(data.attachRole.roles);
      },
      onError(data) {
        showNotification({
          color: "red",
          title: "Error",
          message: "Something went wrong while attaching a role!",
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
          color: "Green",
          title: "Success",
          message: "Role Detached!",
        });

        setCurrentRoles(data.detachRole.roles);
      },
      onError(data) {
        showNotification({
          color: "red",
          title: "Error",
          message: "Something went wrong while detaching a role!",
        });
      },
    });
  };

  // mutation
  const [editUser, { loading: updateUserLoading }] = useMutation(UPDATE_USER);

  const submit = () => {
    const variables = {
      id: editId,
      name: form.getInputProps("name").value,
      password: form.getInputProps("password").value,
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
        setOpenedEdit(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "User Not Updated!",
        });
      },
    });
  };

  // Filter out roles that are not included in the current roles
  const availableRoles = roles.filter((role) => {
    return !currentRoles.some((currentRole) => currentRole.name === role.value);
  });

  // Handle file selection
  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
  };

  return (
    <>
      <LoadingOverlay
        visible={rolesListLoading || aload || dload || updateUserLoading}
        color="blue"
        overlayBlur={2}
        loader={customLoader}
      />
      <div>
        <ScrollArea
          style={{ height: height / 1.1 }}
          type="auto"
          offsetScrollbars
        >
          <form onSubmit={form.onSubmit(() => submit())}>
            <Stack>
              <Grid>
                <Grid.Col span={12}>
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
                </Grid.Col>
              </Grid>

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
              <div>
                <Flex
                  align="center"
                  justify="space-between" // Distributes space between items
                  direction="row"
                  p="xs"
                  m="xs"
                  bg="background.paper"
                  style={{
                    borderRadius: 8,
                    height: "70px",
                    overflow: "hidden",
                  }}
                >
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
              </div>

              <Grid>
                <Grid.Col span={12}>
                  <Button
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
              <>
                <Text fz="sm">Current Roles: </Text>
                <Flex
                  gap="md"
                  bg="rgba(0, 0, 0, .1)"
                  justify="center"
                  align="center"
                  wrap="wrap"
                  p="sm"
                >
                  {currentRoles &&
                    currentRoles?.map((data, id) => (
                      <Badge
                        key={id}
                        variant="outline"
                        sx={{ paddingRight: 3 }}
                        rightSection={removeButton(data.name)}
                      >
                        {data.name}
                      </Badge>
                    ))}
                </Flex>
              </>

              <Select
                data={availableRoles}
                value={form.getInputProps("role.connect")?.value}
                onChange={setRoleDropDownValue}
                label="Attach Role"
                placeholder="Pick a role this user belongs to"
              />
            </Stack>
          </form>
        </ScrollArea>
      </div>
    </>
  );
};

export default UserEditModal;
