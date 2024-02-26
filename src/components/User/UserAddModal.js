import { useMutation, useQuery } from "@apollo/client";
import {
  Button,
  Grid,
  Group,
  LoadingOverlay,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useViewportSize } from "@mantine/hooks";
import { showNotification } from "@mantine/notifications";
import { CREATE_USER } from "apollo/mutuations";
import { GET_ALL_USERS, GET_ROLES } from "apollo/queries";
import { customLoader } from "components/utilities/loader";
import React, { useState } from "react";
import { Dropzone, DropzoneProps, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { PictureInPicture, Upload } from "tabler-icons-react";

const UserAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
  //roles
  const [roles, setRoles] = useState([]);
  const [files, setFiles] = useState([]);

  // apollo queries
  const { data: rolesList, loading: rolesListLoading } = useQuery(GET_ROLES, {
    onCompleted(data) {
      let roles = data.roles;
      let rolesArray = [];

      roles.forEach((role) => {
        rolesArray.push({
          label: role.name,
          value: role.id,
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

  // mutation
  const [addUser, { loading: userLoading }] = useMutation(CREATE_USER, {
    update(cache, { data: { createUser } }) {
      cache.updateQuery(
        {
          query: GET_ALL_USERS,
          variables: {
            first: 10,
            page: activePage,
          },
        },
        (data) => {
          if (data.users.data.length === 10) {
            setTotal(total + 1);
            setActivePage(total + 1);
          } else {
            return {
              users: {
                data: [createUser, ...data.users.data],
              },
            };
          }
        }
      );
    },
  });

  // form state
  const form = useForm({
    initialValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: {
        connect: null,
      },
    },
  });

  const submit = () => {
   
    addUser({
      variables: {
        name: form.getInputProps("name").value,
        email: form.getInputProps("email").value,
        password: form.getInputProps("password").value,
        password_confirmation: form.getInputProps("password_confirmation").value,
        profile_image: files[files.length - 1],
        role:form.getInputProps("role").value,
      },
      onCompleted(data) {
        showNotification({
          color: "green",
          title: "Success",
          message: "User Created Successfully",
        });

        setOpened(false);
      },
      onError(error) {
        setOpened(false);
        showNotification({
          color: "red",
          title: "Error",
          message: "User Not Created!",
        });
      },
    });
    // e.preventDefault();
  };

  // set previews
  
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

  const { height } = useViewportSize();

  const setRoleDropDownValue = (val) => {
    form.setFieldValue("role.connect", val);
  };
  const theme = useMantineTheme();

  return (
    <>
      <LoadingOverlay
        visible={rolesListLoading || userLoading}
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
                    required
                    label="Email"
                    placeholder="Email"
                    type="email"
                    {...form.getInputProps("email")}
                  />
                  <TextInput
                    required
                    label="Password"
                    placeholder="password"
                    type="password"
                    {...form.getInputProps("password")}
                  />

                  <TextInput
                    required
                    label="Password_confirmation"
                    placeholder="Password_confirmation"
                    type="password"
                    {...form.getInputProps("password_confirmation")}
                  />

                  <Select
                    data={roles}
                    value={form.getInputProps("role.connect")?.value}
                    onChange={setRoleDropDownValue}
                    label="Select Role"
                    placeholder="Pick a role this user belongs to"
                  />
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
                                  Attach as many files as you like, each file
                                  should not exceed 5mb
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
                </Grid.Col>
              </Grid>

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

export default UserAddModal;
