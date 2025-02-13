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
import React, { useState, useRef } from "react";

const UserAddModal = ({
  setOpened,
  total,
  setTotal,
  activePage,
  setActivePage,
}) => {
  // roles
  const [roles, setRoles] = useState([]);
  const [files, setFiles] = useState([]);

  // ref for file input
  const fileInputRef = useRef(null);

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

  const [addUser, { loading: userLoading }] = useMutation(CREATE_USER, {
    update(cache, { data: { createUser } }) {
      cache.updateQuery(
        {
          query: GET_ALL_USERS,
          variables: {
            first: 10,
            page: activePage,
            search: "",
          },
        },
        (data) => {
          // Add the new user to the start of the existing users array
          return {
            users: {
              ...data.users,
              data: [createUser, ...data.users.data],
            },
          };
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
      phone: "",
      password_confirmation: "",
      role_id: "",
    },
  });
  const submit = () => {
    addUser({
      variables: {
        name: form.getInputProps("name").value,
        email: form.getInputProps("email").value,
        password: form.getInputProps("password").value,
        phone: form.getInputProps("phone").value,
        password_confirmation: form.getInputProps("password_confirmation")
          .value,
        profile_image: files[files.length - 1],
        role_id: form.getInputProps("role_id").value,
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
        setOpened(true);
        let errorMessage = "User Not Created!";
        if (error?.graphQLErrors?.length) {
          const validationErrors =
            error.graphQLErrors[0]?.extensions?.validation;
          if (validationErrors) {
            errorMessage = Object.values(validationErrors).flat().join(", ");
          }
        }
        showNotification({
          color: "red",
          title: "Error",
          message: errorMessage,
        });
      },
    });
  };

  // handle file change
  const handleFileChange = (event) => {
    setFiles(Array.from(event.target.files));
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
        onLoad={() => URL.revokeObjectURL(imageUrl)}
      />
    );
  });

  const { height } = useViewportSize();

  const setRoleDropDownValue = (val) => {
    form.setFieldValue("role_id", val);
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
          style={{ height: height / 1.4 }}
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
                    label="Phone"
                    placeholder="Phone"
                    type="text"
                    {...form.getInputProps("phone")}
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
                    label="Password Confirmation"
                    placeholder="Password Confirmation"
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
                </Grid.Col>
              </Grid>

              <div style={{ marginTop: "10px" }}>
                <Button
                  onClick={() => fileInputRef.current.click()}
                  color="blue"
                  variant="outline"
                  fullWidth
                >
                  Upload Image
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
                <SimpleGrid
                  cols={4}
                  breakpoints={[{ maxWidth: "sm", cols: 1 }]}
                  mt={previews.length > 0 ? "xl" : 0}
                >
                  {previews}
                </SimpleGrid>
              </div>
              <Grid>
                <Grid.Col span={12}>
                  <Button
                    style={{
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
            </Stack>
          </form>
        </ScrollArea>
      </div>
    </>
  );
};

export default UserAddModal;
