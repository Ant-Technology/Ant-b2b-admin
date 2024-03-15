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
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { IconX } from "@tabler/icons";
import { ATTACH_ROLE, DETTACH_ROLE, UPDATE_USER } from "apollo/mutuations";
import { GET_ROLES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import { useEffect, useState } from "react";
import { PictureInPicture, Upload } from "tabler-icons-react";

const UserEditModal = ({ setOpenedEdit, editId, data }) => {
  const [roles, setRoles] = useState([]);
  const [currentRoles, setCurrentRoles] = useState([]);

  useEffect(() => {
    data.forEach((data) => {
      if (data.id === editId) {
        form.setValues({
          name: data.name,
          email: data.email,
        });

        setCurrentRoles(data.roles);
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
          message: "Something went wrong while attachng a role!",
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
          message: "Role Dettached!",
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
                  <ScrollArea style={{ height: 300 }}>
                    <div style={{ marginTop: "25px" }}>
                      <Dropzone accept={IMAGE_MIME_TYPE} onDrop={setFiles}>
                        <Group
                          position="center"
                          spacing="xl"
                          style={{ minHeight: 200, pointerEvents: "none" }}
                        >
                          <Dropzone.Accept>
                            <Upload
                              size={50}
                              stroke={1.5}
                              color={
                                theme.colors[theme.primaryColor][
                                  theme.colorScheme === "dark" ? 4 : 6
                                ]
                              }
                            />
                          </Dropzone.Accept>
                          <Dropzone.Reject>
                            <PictureInPicture
                              size={50}
                              stroke={1.5}
                              color={
                                theme.colors.red[
                                  theme.colorScheme === "dark" ? 4 : 6
                                ]
                              }
                            />
                          </Dropzone.Reject>
                          <Dropzone.Idle>
                            <PictureInPicture size={50} stroke={1.5} />
                          </Dropzone.Idle>

                          <div>
                            <Text size="xl" inline>
                              Drag images here or click to select files
                            </Text>
                            <Text size="sm" color="dimmed" inline mt={7}>
                              Attach as many files as you like, each file should
                              not exceed 5mb
                            </Text>
                          </div>
                        </Group>
                      </Dropzone>

                      <SimpleGrid
                        cols={4}
                        breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                        mt={previews.length > 0 ? "xl" : 0}
                      >
                        {previews}
                      </SimpleGrid>
                    </div>
                  </ScrollArea>

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
                {/* <Button compact mt="md">
                  Change Password
                </Button> */}
              </Card>

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

              <Grid>
                <Grid.Col span={12}>
                  <Button
                    type="submit"
                    color="blue"
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
      </div>
    </>
  );
};

export default UserEditModal;
